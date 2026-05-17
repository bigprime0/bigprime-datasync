/**
 * IoT协议说明配置数据
 * 为各种IoT协议提供详细的技术文档和使用指南
 */

export interface ProtocolGuide {
  name: string
  displayName: string
  category: string
  description: string
  scenarios: string[]
  standards: string[]
  dataReportStrategy: string
  advantages: string[]
  limitations: string[]
  configTips: string[]
  typicalDevices: string[]
}

export const iotProtocolGuides: Record<string, ProtocolGuide> = {
  MQTT: {
    name: 'MQTT',
    displayName: 'MQTT消息队列',
    category: 'IoT协议',
    description: 'MQTT是一种轻量级的发布/订阅消息传输协议,专为低带宽、高延迟或不可靠网络环境设计。',
    scenarios: [
      '智能家居设备互联',
      '车联网数据采集',
      '工业物联网监控',
      '移动APP推送通知',
      '远程设备管理'
    ],
    standards: [
      'MQTT 3.1.1 (ISO/IEC 20922:2016)',
      'MQTT 5.0 (OASIS标准)',
      '支持QoS 0/1/2三种服务质量等级',
      '支持TLS/SSL加密传输'
    ],
    dataReportStrategy: '订阅模式：连接器订阅MQTT主题,实时接收消息推送;支持通配符订阅(+/#),自动处理重连和消息缓存。',
    advantages: [
      '极低的协议开销(固定头2字节)',
      '支持QoS保证消息可靠性',
      '支持遗嘱消息(LWT)检测设备离线',
      '双向通信能力(发布/订阅)',
      '生态成熟,库支持广泛'
    ],
    limitations: [
      '需要MQTT Broker作为中间件',
      '大数据量传输性能不如HTTP',
      '不适合视频流等大文件传输'
    ],
    configTips: [
      'QoS=0适合传感器实时数据,允许丢失',
      'QoS=1适合控制指令,至少送达一次',
      'QoS=2适合关键业务,确保仅送达一次',
      '订阅主题支持通配符: sensor/+/temperature',
      'Clean Session=false保留离线消息'
    ],
    typicalDevices: [
      '温湿度传感器',
      '智能插座/开关',
      '空气质量监测站',
      '车载OBD设备',
      'GPS定位器'
    ]
  },

  MODBUS: {
    name: 'MODBUS',
    displayName: 'Modbus工业协议',
    category: 'IoT协议',
    description: 'Modbus是工业自动化领域应用最广泛的通信协议,支持串口和TCP/IP两种传输方式。',
    scenarios: [
      '工厂PLC数据采集',
      '变频器参数读取',
      '电力系统监控',
      '楼宇自控系统',
      '水处理SCADA系统'
    ],
    standards: [
      'Modbus RTU (串口,二进制)',
      'Modbus ASCII (串口,ASCII码)',
      'Modbus TCP (以太网,端口502)',
      'IEC 61158/IEC 61784标准'
    ],
    dataReportStrategy: '主从轮询：连接器作为主站,按照配置的寄存器地址和轮询间隔,定时读取从站数据;支持批量读取优化性能。',
    advantages: [
      '工业标准协议,设备兼容性强',
      '实现简单,调试方便',
      '支持串口和以太网',
      '实时性好,响应延迟低',
      '开放协议,无专利费用'
    ],
    limitations: [
      '主从模式,主站需要轮询',
      '单个报文最多读取125个寄存器',
      '不支持设备主动上报',
      '串口通信距离受限(1200米)'
    ],
    configTips: [
      '从站ID范围1-247,0为广播地址',
      '寄存器地址从0开始(显示+1)',
      '功能码03读保持寄存器,04读输入寄存器',
      '轮询间隔建议≥100ms避免设备过载',
      '串口参数必须与设备一致(波特率/校验)'
    ],
    typicalDevices: [
      'PLC控制器',
      '变频器',
      '智能电表',
      '温控仪表',
      '流量计'
    ]
  },

  OPCUA: {
    name: 'OPCUA',
    displayName: 'OPC-UA工业互联',
    category: 'IoT协议',
    description: 'OPC-UA是工业4.0时代的统一架构协议,提供平台无关、安全可靠的工业数据交换能力。',
    scenarios: [
      '智能制造数据采集',
      'MES/ERP系统集成',
      '设备预测性维护',
      '跨平台工业互联',
      '数字孪生数据源'
    ],
    standards: [
      'IEC 62541标准',
      '支持二进制/XML/JSON编码',
      '内置安全机制(加密/签名/认证)',
      '支持订阅/发布和请求/响应模式'
    ],
    dataReportStrategy: '订阅模式：连接器订阅OPC-UA节点,服务器检测到数据变化时主动推送;支持死区过滤和采样间隔配置。',
    advantages: [
      '跨平台(Windows/Linux/嵌入式)',
      '内置安全认证和加密',
      '支持复杂数据类型',
      '自动发现节点和服务',
      '支持历史数据访问'
    ],
    limitations: [
      '协议复杂,实现成本高',
      '资源占用较大(不适合MCU)',
      '配置复杂,学习曲线陡峭'
    ],
    configTips: [
      '终端节点格式: opc.tcp://ip:port',
      '匿名认证适合内网测试',
      '生产环境建议用户名/密码认证',
      '订阅发布间隔建议≥1000ms',
      'NodeId格式: ns=2;s=Device1.Temperature'
    ],
    typicalDevices: [
      '西门子PLC(S7-1200/1500)',
      '施耐德控制器',
      '罗克韦尔自动化设备',
      '工业机器人',
      '数控机床'
    ]
  },

  COAP: {
    name: 'COAP',
    displayName: 'CoAP轻量协议',
    category: 'IoT协议',
    description: 'CoAP是面向受限节点和受限网络的轻量级应用层协议,类似HTTP但更加精简。',
    scenarios: [
      '6LoWPAN传感器网络',
      '电池供电设备',
      '低功耗广域网(LPWAN)',
      '智能照明系统',
      '可穿戴设备'
    ],
    standards: [
      'RFC 7252核心协议',
      'RFC 7641观察者模式',
      'RFC 7959分块传输',
      'DTLS加密(RFC 6347)'
    ],
    dataReportStrategy: '观察者模式：连接器向设备注册观察者,设备状态变化时主动通知;支持请求/响应模式定时GET资源。',
    advantages: [
      'UDP传输,开销小(仅4字节头)',
      '支持多播和资源发现',
      '内置确认和重传机制',
      '支持观察者模式(类似订阅)',
      '资源寻址类似RESTful'
    ],
    limitations: [
      'UDP不保证顺序和可靠性',
      '最大报文1280字节(IPv6 MTU)',
      '不适合大数据传输',
      '生态不如MQTT/HTTP成熟'
    ],
    configTips: [
      '默认端口5683(明文)/5684(DTLS)',
      'CON消息需要ACK确认',
      'NON消息不需要确认(低功耗)',
      '观察者选项: Observe: 0',
      '资源路径格式: /sensors/temp'
    ],
    typicalDevices: [
      'ZigBee网关',
      'Thread边界路由器',
      '低功耗传感器',
      '智能门锁',
      'BLE网关'
    ]
  },

  TCP: {
    name: 'TCP',
    displayName: 'TCP Socket通信',
    category: 'IoT协议',
    description: 'TCP是面向连接的可靠传输协议,适用于需要持久连接和高可靠性的场景。',
    scenarios: [
      '高速公路ETC龙门架',
      'GPS定位设备',
      '视频监控摄像头(控制)',
      '工业设备私有协议',
      '自定义物联网协议'
    ],
    standards: [
      'RFC 793传输控制协议',
      '面向连接,三次握手建立',
      '流量控制和拥塞控制',
      '保证数据顺序和完整性'
    ],
    dataReportStrategy: '服务端监听：连接器作为TCP服务端,监听指定端口,接收设备主动上报的数据;支持多客户端并发连接。',
    advantages: [
      '可靠传输,自动重传丢失数据',
      '保证数据顺序',
      '流量控制防止接收方过载',
      '适合长连接保持',
      '支持大数据传输'
    ],
    limitations: [
      '三次握手延迟较高',
      '资源占用大(维持连接状态)',
      '不适合频繁短连接场景',
      '需要处理粘包/拆包'
    ],
    configTips: [
      '监听端口建议1024-65535',
      '启用心跳检测防止连接断开',
      '设置接收缓冲区大小',
      '超时时间建议30-60秒',
      '私有协议需定义消息分隔符'
    ],
    typicalDevices: [
      'ETC RSU设备',
      'GPS北斗终端',
      '工业网关',
      '环境监测站',
      '自助终端'
    ]
  },

  UDP: {
    name: 'UDP',
    displayName: 'UDP数据报协议',
    category: 'IoT协议',
    description: 'UDP是无连接的传输协议,提供快速但不可靠的数据传输服务。',
    scenarios: [
      'AIS船舶自动识别',
      'ADS-B飞机定位',
      '实时视频监控',
      '广播式传感器数据',
      'Syslog日志上报'
    ],
    standards: [
      'RFC 768用户数据报协议',
      '无连接,无状态',
      '不保证可靠性和顺序',
      '支持广播和多播'
    ],
    dataReportStrategy: 'UDP监听：连接器绑定端口,接收设备发送的UDP数据报;支持广播地址,一对多快速分发。',
    advantages: [
      '传输速度快,无连接开销',
      '支持广播和多播',
      '资源占用小',
      '适合实时性要求高的场景',
      '报文独立,无状态'
    ],
    limitations: [
      '不保证可靠性,可能丢包',
      '不保证顺序',
      '无流量控制',
      '最大报文64KB',
      '需要应用层处理重传'
    ],
    configTips: [
      '监听端口0.0.0.0接收所有接口',
      '广播地址255.255.255.255',
      'AIS默认端口10110',
      'ADS-B默认端口30003',
      '高丢包场景考虑应用层确认'
    ],
    typicalDevices: [
      'AIS船舶设备',
      'ADS-B接收机',
      '多播视频源',
      'SNMP监控代理',
      'DNS服务器'
    ]
  },

  WEBSOCKET: {
    name: 'WEBSOCKET',
    displayName: 'WebSocket双向通信',
    category: 'IoT协议',
    description: 'WebSocket是基于TCP的全双工通信协议,支持浏览器和服务器之间的持久连接。',
    scenarios: [
      'Web端实时监控',
      '浏览器内设备控制',
      '实时消息推送',
      '在线协作工具',
      'HTML5设备管理'
    ],
    standards: [
      'RFC 6455协议规范',
      '基于HTTP握手升级',
      '帧格式封装',
      '支持文本和二进制消息'
    ],
    dataReportStrategy: 'WebSocket连接：设备通过WebSocket连接到服务器,实时双向传输数据;支持心跳保活和自动重连。',
    advantages: [
      '全双工双向通信',
      '协议开销小(仅2字节帧头)',
      '无需轮询,服务端主动推送',
      '浏览器原生支持',
      '跨域支持(CORS)'
    ],
    limitations: [
      '需要服务端支持',
      '某些代理服务器可能不支持',
      '长连接占用服务器资源',
      '移动网络切换需要重连'
    ],
    configTips: [
      'URL格式: ws://host:port/path',
      'wss://使用TLS加密',
      '启用心跳ping/pong帧',
      '设置重连退避策略',
      '消息大小建议<1MB'
    ],
    typicalDevices: [
      'ESP8266/ESP32模块',
      '树莓派网关',
      '智能家居网关',
      'Web控制终端',
      'HTML5传感器'
    ]
  },

  BLE: {
    name: 'BLE',
    displayName: '蓝牙低功耗',
    category: 'IoT协议',
    description: 'BLE是蓝牙4.0引入的低功耗短距离无线通信技术,广泛用于可穿戴和智能硬件。',
    scenarios: [
      '可穿戴健康监测',
      '智能手环/手表',
      '蓝牙信标(iBeacon)',
      '室内定位导航',
      '近场交互设备'
    ],
    standards: [
      'Bluetooth 4.0/4.1/4.2/5.0/5.1',
      'GATT通用属性协议',
      'GAP通用访问协议',
      'ATT属性协议'
    ],
    dataReportStrategy: 'GATT订阅：网关扫描并连接BLE设备,订阅特征值通知,设备状态变化时主动推送;支持周期性扫描发现新设备。',
    advantages: [
      '功耗极低(纽扣电池可用数月)',
      '成本低,手机内置支持',
      '配对快速,连接简单',
      '支持广播模式(iBeacon)',
      'BLE 5.0传输距离可达200米'
    ],
    limitations: [
      '传输距离短(10-100米)',
      '传输速率低(1-2Mbps)',
      '不适合大数据传输',
      '连接设备数量有限(主设备7-10个)',
      '墙壁/金属屏蔽影响大'
    ],
    configTips: [
      '扫描窗口和间隔影响功耗',
      'UUID标识服务和特征',
      '订阅通知: notify/indicate',
      'MTU影响单次传输大小',
      '连接间隔影响实时性和功耗'
    ],
    typicalDevices: [
      '小米手环',
      '体温计/血压计',
      'iBeacon信标',
      '蓝牙门锁',
      '蓝牙体重秤'
    ]
  },

  SERIAL: {
    name: 'SERIAL',
    displayName: '串口通信',
    category: 'IoT协议',
    description: '串口(RS232/RS485)是传统的点对点或多点通信方式,广泛用于工业设备和嵌入式系统。',
    scenarios: [
      'AIS船舶数据(NMEA协议)',
      'ADS-B飞机数据',
      'GPS定位数据(NMEA)',
      'ETC龙门架数据',
      '工业仪表数据采集'
    ],
    standards: [
      'RS232: EIA/TIA-232-F标准',
      'RS485: EIA/TIA-485-A标准',
      '波特率: 1200-115200bps',
      '数据位/停止位/校验位可配'
    ],
    dataReportStrategy: '串口监听：连接器打开串口,持续读取设备发送的数据流;支持多种协议解析(NMEA/AIS/ADS-B/自定义)。',
    advantages: [
      '硬件简单,成本低',
      '抗干扰能力强(差分传输)',
      'RS485支持多点通信(最多32/128个)',
      '长距离传输(RS485可达1200米)',
      '工业标准,设备兼容性好'
    ],
    limitations: [
      'RS232距离短(15米)',
      '传输速率低(<115200bps)',
      '需要物理连接',
      '不支持热插拔(RS232)',
      '多设备需要地址管理'
    ],
    configTips: [
      '波特率必须与设备一致',
      '数据位通常8位',
      '停止位通常1位',
      '校验位: None/Even/Odd',
      'RS485需配置终端电阻(120Ω)'
    ],
    typicalDevices: [
      'AIS基站',
      'ADS-B接收机',
      'GPS模块',
      'ETC RSU',
      '工业传感器'
    ]
  },

  NBIOT: {
    name: 'NBIOT',
    displayName: 'NB-IoT窄带物联',
    category: 'IoT协议',
    description: 'NB-IoT是3GPP标准化的窄带物联网技术,提供广覆盖、低功耗、低成本的蜂窝连接。',
    scenarios: [
      '智能水表/电表/气表',
      '智慧停车地磁',
      '烟感/消防报警',
      '环境监测站',
      '资产追踪定位'
    ],
    standards: [
      '3GPP Release 13/14/15/16',
      'LTE Category NB1/NB2',
      'CoAP/LwM2M应用协议',
      '频段: B5/B8/B20等'
    ],
    dataReportStrategy: '平台接入：设备通过运营商网络连接到IoT平台,使用CoAP/LwM2M上报数据;连接器从平台API获取数据。',
    advantages: [
      '运营商网络,覆盖广',
      '深度覆盖(地下车库/管道)',
      '超低功耗(电池10年)',
      '海量连接(每扇区5万)',
      '无需网关,设备直连'
    ],
    limitations: [
      '传输速率低(上行<60kbps)',
      '延迟较高(秒级)',
      '不支持移动性(固定场景)',
      '需要SIM卡和流量费',
      '信号弱时重传消耗功耗'
    ],
    configTips: [
      '选择本地运营商网络',
      'PSM省电模式延长电池寿命',
      'eDRX扩展间歇接收降低功耗',
      '上报间隔建议≥1小时',
      '小数据包<200字节最优'
    ],
    typicalDevices: [
      '智能水表',
      '烟感报警器',
      '地磁车检器',
      '智能井盖',
      '电动车定位器'
    ]
  },

  LORAWAN: {
    name: 'LORAWAN',
    displayName: 'LoRaWAN远程网络',
    category: 'IoT协议',
    description: 'LoRaWAN是低功耗广域网协议,基于LoRa物理层,提供双向通信和端到端加密。',
    scenarios: [
      '农业环境监测',
      '智慧城市传感器',
      '资产追踪',
      '智能照明控制',
      '长距离抄表'
    ],
    standards: [
      'LoRaWAN 1.0/1.0.3/1.1规范',
      'LoRa Alliance标准',
      '频段: CN470/EU868/US915',
      'Class A/B/C设备类型'
    ],
    dataReportStrategy: '网关接收：LoRa网关接收设备上行消息,转发到Network Server;连接器从应用服务器获取解码后的数据。',
    advantages: [
      '超长距离(郊区15公里)',
      '低功耗(电池5-10年)',
      '私有部署,无流量费',
      '穿透能力强',
      '自组网,拓扑灵活'
    ],
    limitations: [
      '传输速率极低(<50kbps)',
      '占空比限制(1%)',
      '延迟高(秒到分钟级)',
      '网关覆盖成本',
      '干扰敏感'
    ],
    configTips: [
      'Class A最省电,仅上行后接收',
      'Class B周期性接收窗口',
      'Class C持续接收,功耗高',
      'ADR自适应速率优化功耗',
      'Confirmed消息需要ACK确认'
    ],
    typicalDevices: [
      '土壤传感器',
      '水位监测',
      '垃圾桶监测',
      '停车位检测',
      '气象站'
    ]
  },

  ZIGBEE: {
    name: 'ZIGBEE',
    displayName: 'Zigbee网状网络',
    category: 'IoT协议',
    description: 'Zigbee是低功耗、低成本的网状网络协议,支持自组网和多跳路由。',
    scenarios: [
      '智能家居控制',
      '工业自动化',
      '楼宇照明控制',
      '无线传感器网络',
      '医疗监护设备'
    ],
    standards: [
      'IEEE 802.15.4物理层',
      'Zigbee 3.0统一标准',
      'Zigbee PRO协议栈',
      '频段: 2.4GHz全球通用'
    ],
    dataReportStrategy: '网关集中：Zigbee协调器作为网关,收集网络内所有节点数据;连接器从网关读取聚合的数据。',
    advantages: [
      '自组网,自愈能力强',
      '网状拓扑,多跳扩展',
      '功耗低,适合电池供电',
      '网络容量大(65000节点)',
      'AES-128加密安全'
    ],
    limitations: [
      '传输速率低(250kbps)',
      '传输距离短(10-100米)',
      '2.4GHz易受干扰(WiFi)',
      '协调器故障影响全网',
      '不同厂商互操作性差'
    ],
    configTips: [
      '协调器唯一,负责组网',
      '路由器扩展网络覆盖',
      '终端设备最省电',
      'PAN ID区分不同网络',
      '信道选择避开WiFi'
    ],
    typicalDevices: [
      '飞利浦Hue智能灯',
      'Zigbee开关/插座',
      '门窗传感器',
      '温湿度传感器',
      '人体红外传感器'
    ]
  },

  KNX: {
    name: 'KNX',
    displayName: 'KNX楼宇自动化',
    category: 'IoT协议',
    description: 'KNX是国际标准的楼宇自动化总线协议,用于家居和楼宇控制系统。',
    scenarios: [
      '智能楼宇照明',
      'HVAC暖通空调',
      '窗帘/百叶窗控制',
      '安防门禁系统',
      '能源管理系统'
    ],
    standards: [
      'ISO/IEC 14543标准',
      'EN 50090欧洲标准',
      'GB/Z 20965中国标准',
      'KNX Association认证'
    ],
    dataReportStrategy: '总线监听：连接器接入KNX总线,监听Group Address报文;解析ETS配置,映射设备数据点。',
    advantages: [
      '国际标准,互操作性强',
      '分布式控制,无中心节点',
      '传输介质多样(TP/IP/RF/PL)',
      '稳定可靠,工程级应用',
      '厂商众多,生态完善'
    ],
    limitations: [
      '成本高,需专业调试',
      'ETS工具复杂,学习曲线陡',
      '总线负载有限(256设备/线路)',
      '改造成本高',
      '配置需要KNX认证工程师'
    ],
    configTips: [
      'Group Address标识功能',
      'Physical Address标识设备',
      'TP总线速率9600bps',
      'IP网关连接以太网',
      'ETS导出配置文件'
    ],
    typicalDevices: [
      'ABB开关面板',
      '西门子调光器',
      'Gira触摸屏',
      'Jung传感器',
      'MDT执行器'
    ]
  },

  BACNET: {
    name: 'BACNET',
    displayName: 'BACnet楼宇网络',
    category: 'IoT协议',
    description: 'BACnet是楼宇自动化和控制网络的数据通信协议,支持多种网络类型。',
    scenarios: [
      '商业楼宇BMS',
      'HVAC系统集成',
      '能源管理平台',
      '消防报警集成',
      '数据中心空调监控'
    ],
    standards: [
      'ASHRAE 135标准',
      'ISO 16484-5国际标准',
      'BACnet/IP以太网',
      'BACnet/MSTP串口'
    ],
    dataReportStrategy: 'COV订阅：连接器订阅设备对象的COV(Change of Value),值变化时设备主动通知;支持轮询读取对象属性。',
    advantages: [
      '楼宇自控行业标准',
      '对象模型统一',
      '支持多种网络(IP/MSTP/Ethernet)',
      'COV机制减少轮询',
      '厂商互操作性好'
    ],
    limitations: [
      '协议复杂,实现难度大',
      '配置繁琐,需专业知识',
      'MSTP速率低(76.8kbps)',
      '不适合移动场景',
      '安全机制较弱'
    ],
    configTips: [
      '设备实例号Device Instance唯一',
      'Object Identifier标识对象',
      'COV订阅减少网络流量',
      'MSTP地址0-127',
      'BACnet/IP默认端口47808'
    ],
    typicalDevices: [
      '江森控制器',
      '霍尼韦尔DDC',
      '西门子PXC',
      '开利空调控制器',
      '特灵冷水机组'
    ]
  },

  DNP3: {
    name: 'DNP3',
    displayName: 'DNP3电力SCADA',
    category: 'IoT协议',
    description: 'DNP3是电力行业SCADA系统的标准通信协议,提供可靠的遥测遥控能力。',
    scenarios: [
      '电力调度SCADA',
      '变电站自动化',
      '配电网监控',
      '水利闸门控制',
      '石油管道SCADA'
    ],
    standards: [
      'IEEE 1815标准',
      'DNP3 Level 2合规',
      '支持串口/以太网',
      'IEC 60870-5类似协议'
    ],
    dataReportStrategy: '主从问答：主站(连接器)向从站(RTU)发送完整性扫描和事件扫描请求;从站响应变化数据,支持SOE带时标事件。',
    advantages: [
      '电力行业标准',
      '时间戳精度高(1ms)',
      '优先级机制',
      '支持事件缓冲和确认',
      '可靠性高,错误检测强'
    ],
    limitations: [
      '协议复杂,调试困难',
      '配置项多,易出错',
      '不适合高速数据采集',
      '安全机制需额外配置(Secure Auth)',
      '老旧设备兼容性问题'
    ],
    configTips: [
      '主站地址通常1,从站地址>1',
      'Class 0扫描完整性数据',
      'Class 1/2/3扫描事件',
      'Confirm超时时间设置',
      '对象变化组配置(Group 1/2)'
    ],
    typicalDevices: [
      '电力RTU',
      '变电站保护装置',
      '配电终端FTU',
      '故障录波器',
      'PMU相量测量单元'
    ]
  },

  IEC61850: {
    name: 'IEC61850',
    displayName: 'IEC61850变电站通信',
    category: 'IoT协议',
    description: 'IEC61850是变电站自动化系统的国际标准,定义了设备间的信息交换模型。',
    scenarios: [
      '智能变电站',
      '数字化保护装置',
      '过程层IED互联',
      '站控层SCADA集成',
      '分布式能源接入'
    ],
    standards: [
      'IEC 61850系列标准',
      'MMS制造报文规范',
      'GOOSE通用面向对象变电站事件',
      'SV采样值传输'
    ],
    dataReportStrategy: 'GOOSE/Report：订阅GOOSE报文接收实时事件;订阅Report接收数据变化报告;MMS客户端读写逻辑节点数据。',
    advantages: [
      '变电站行业标准',
      '自描述能力(SCL配置)',
      'GOOSE/SV毫秒级实时性',
      '面向对象建模',
      '支持多种服务(MMS/GOOSE/SV)'
    ],
    limitations: [
      '协议复杂,学习成本高',
      'SCL配置文件难以解析',
      '不同厂商实现差异大',
      '测试工具昂贵',
      '需要专业知识'
    ],
    configTips: [
      'ICD文件描述设备能力',
      'SCD文件描述系统配置',
      'GOOSE订阅APPID和MAC',
      'Report控制块RCB配置',
      '数据集DataSet定义'
    ],
    typicalDevices: [
      '保护测控装置',
      '智能终端',
      '合并单元MU',
      '故障录波器',
      '状态监测装置'
    ]
  },

  RTSP: {
    name: 'RTSP',
    displayName: 'RTSP视频流',
    category: 'IoT协议',
    description: 'RTSP是实时流协议,用于控制音视频流的传输,配合RTP/RTCP实现流媒体播放。',
    scenarios: [
      'IP摄像头视频流',
      '安防监控系统',
      '视频会议',
      '无人机图传',
      '视频门铃'
    ],
    standards: [
      'RFC 2326 RTSP协议',
      'RFC 3550 RTP协议',
      'H.264/H.265视频编码',
      'AAC/G.711音频编码'
    ],
    dataReportStrategy: 'RTSP客户端：连接器作为客户端,通过RTSP控制摄像头视频流;接收RTP数据包,解码后提取关键帧元数据(分辨率/码率/时间戳)。',
    advantages: [
      '标准流媒体协议',
      '支持暂停/快进/跳转',
      '低延迟(秒级)',
      '支持多路复用',
      'RTP传输效率高'
    ],
    limitations: [
      '需要专门播放器',
      '防火墙/NAT穿透困难',
      'UDP易丢包影响画质',
      '带宽占用大',
      '不支持P2P'
    ],
    configTips: [
      'URL格式: rtsp://ip:554/stream',
      'TCP传输更稳定,UDP延迟低',
      '认证方式: Basic/Digest',
      'DESCRIBE获取媒体信息',
      'SETUP建立传输通道'
    ],
    typicalDevices: [
      '海康威视摄像头',
      '大华网络摄像机',
      'Axis网络摄像机',
      '宇视IPC',
      '天地伟业DVR'
    ]
  },

  ONVIF: {
    name: 'ONVIF',
    displayName: 'ONVIF开放标准',
    category: 'IoT协议',
    description: 'ONVIF是网络视频设备的开放接口标准,提供设备发现、配置、视频流控制等统一接口。',
    scenarios: [
      '跨品牌摄像头集成',
      '安防平台统一接入',
      'VMS视频管理系统',
      'NVR录像机对接',
      '视频智能分析'
    ],
    standards: [
      'ONVIF Profile S流媒体',
      'ONVIF Profile G录像',
      'ONVIF Profile T高级视频',
      'SOAP Web Services'
    ],
    dataReportStrategy: 'ONVIF服务：连接器通过ONVIF接口发现设备,获取媒体URI和配置;调用Event服务订阅设备事件(移动侦测/报警)。',
    advantages: [
      '跨厂商互操作性',
      '统一接口,易于集成',
      '支持设备自动发现',
      '功能丰富(PTZ/录像/事件)',
      '开放标准,无专利费'
    ],
    limitations: [
      '各厂商实现差异',
      'Profile不同功能不同',
      'SOAP协议开销大',
      '某些高级功能需私有扩展',
      '兼容性测试复杂'
    ],
    configTips: [
      'WS-Discovery发现设备',
      'GetCapabilities查询能力',
      'GetProfiles获取配置',
      'GetStreamUri获取RTSP地址',
      'CreatePullPointSubscription订阅事件'
    ],
    typicalDevices: [
      '海康ONVIF摄像头',
      '大华ONVIF IPC',
      'Sony网络摄像机',
      'Bosch安防摄像机',
      '宇视ONVIF设备'
    ]
  },

  ETC_GANTRY: {
    name: 'ETC_GANTRY',
    displayName: 'ETC龙门架',
    category: 'IoT协议',
    description: 'ETC龙门架系统是高速公路电子不停车收费系统的核心设备,通过DSRC/5.8GHz与车载OBU通信。',
    scenarios: [
      '高速公路收费',
      '省界虚拟站收费',
      '匝道计费',
      '自由流收费',
      '车路协同V2X'
    ],
    standards: [
      'GB/T 20851 DSRC标准',
      'JT/T 978收费数据',
      '交通部ETC技术规范',
      '5.8GHz DSRC频段'
    ],
    dataReportStrategy: 'RSU数据采集：龙门架RSU通过DSRC读取OBU信息,生成交易流水;连接器通过TCP/UDP接收RSU上报的交易记录。',
    advantages: [
      '不停车收费,提高通行效率',
      '交易速度快(<300ms)',
      '准确率高(>99.9%)',
      '支持高速行驶(200km/h)',
      '无需人工干预'
    ],
    limitations: [
      '需要车载OBU',
      '天线覆盖范围有限',
      '恶劣天气影响识别',
      '设备成本高',
      '需要RSU密集部署'
    ],
    configTips: [
      'RSU ID唯一标识',
      '车道号/门架号配置',
      '交易数据格式(0200/0201)',
      '心跳间隔30秒',
      '数据上报采用TCP长连接'
    ],
    typicalDevices: [
      'ETC龙门架RSU',
      '车载OBU',
      'ETC车道RSU',
      '车牌识别摄像头',
      '费显器'
    ]
  }
}

/**
 * 根据product名称获取协议说明
 */
export function getProtocolGuide(productName: string): ProtocolGuide | null {
  const upperName = productName.toUpperCase().replace(/[-_]/g, '')
  return iotProtocolGuides[upperName] || null
}

/**
 * 判断是否为IoT协议
 */
export function isIoTProtocol(productName: string): boolean {
  return getProtocolGuide(productName) !== null
}
