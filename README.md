<p align="center">
  <!-- TODO: 替换为项目 Logo 图片 -->
  <img src="resources/logo.jpg" alt="BigPrime DataSync Logo" width="200"/>
</p>

<h1 align="center">BigPrime DataSync</h1>

<p align="center">
  <strong>开源数据同步与编排平台 — 连接万物，流动数据</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/JDK-17-green" alt="JDK 17"/>
  <img src="https://img.shields.io/badge/Spring%20Boot-3.2.0-green" alt="Spring Boot 3.2.0"/>
  <img src="https://img.shields.io/badge/Vue-3.5-brightgreen" alt="Vue 3.5"/>
  <img src="https://img.shields.io/badge/License-Apache--2.0-blue" alt="License"/>
</p>

<p align="center">
  <a href="#-功能特性">功能特性</a> •
  <a href="#-架构概览">架构概览</a> •
  <a href="#-快速开始">快速开始</a> •
  <a href="#-部署指南">部署指南</a> •
  <a href="#-模块说明">模块说明</a> •
  <a href="#-技术栈">技术栈</a>
</p>

## 📖 项目介绍

**BigPrime DataSync** 是一款面向企业级数据集成的一站式开源平台，致力于解决异构数据源之间的数据同步、编排与治理问题。平台以 **DAG 可视化编排** 为核心调度范式，内置 **Apache Flink** 与 **Apache SeaTunnel** 双引擎，覆盖实时 CDC 与批量 ETL 全场景；同时融合 **AI 智能增强**、**数据血缘追踪**、**集群治理**与**可观测运维**能力，为企业提供从数据接入到数据消费的完整闭环。

> 🏢 企业官网：[www.bigprime.cn](http://www.bigprime.cn)

### 平台定位

| 维度 | 说明 |
|------|------|
| **数据同步** | 50+ 数据源连接器，Flink 实时 CDC + SeaTunnel 批量同步，SPI 插件化架构支持零侵入扩展 |
| **DAG 编排** | 拖拽式可视化流程设计，HTTP 同步 / MQ 异步双执行模式，条件路由与并行分支 |
| **AI 增强** | 多模型统一接入（OpenAI / DeepSeek / Ollama），MCP Server 让 AI Agent 直接操作平台，RAG 知识库精准问答 |
| **数据血缘** | 自动追踪数据流向，血缘图谱可视化，端到端数据链路可审计 |
| **集群治理** | Worker 节点动态注册、心跳监控、多策略负载均衡，水平按需扩展 |
| **可观测** | 统一日志采集（Loki）、多通道告警（邮件/Webhook/钉钉）、运行指标实时监控 |

---

![BigPrime DataSync 截图](resources/dashboard.png)

## ✨ 功能特性

### 🔌 连接器生态
- **50+ 数据源连接器**：MySQL、PostgreSQL、Oracle、SQL Server、Kafka、Elasticsearch、Redis、MongoDB、Hive、HDFS 等
- **双引擎支持**：Apache Flink 1.16 + Apache SeaTunnel 2.3.x，覆盖实时与批量场景
- **SPI 插件化架构**：连接器热插拔，自定义扩展零侵入
- **健康检查**：自动检测连接器状态，异常告警

### 🔄 数据同步编排
- **可视化 DAG 编排**：拖拽式流程设计，所见即所得
- **多执行模式**：HTTP 同步直连 / MQ 异步解耦，按需切换
- **实时 CDC**：基于 Flink CDC 的实时数据变更捕获
- **SQL 模板引擎**：内置 Flink SQL 模板，变量化配置，一键生成

### 🤖 AI 智能增强
- **多模型接入**：OpenAI / Anthropic / DeepSeek / Ollama，统一管理
- **MCP Server**：内置 Model Context Protocol，AI Agent 可直接操作平台数据
- **AI 对话助手**：智能 SQL 生成、数据解读、运维建议
- **RAG 知识库**：文档检索增强，精准回答业务问题

### 🐍 Python 工作台
- **嵌入式 Python 运行时**：无需预装 Python，开箱即用
- **Jupyter Kernel Gateway**：在线 Notebook 交互式开发
- **LSP 智能补全**：集成 Python Language Server，IDE 级编辑体验

### 📊 可观测运维
- **集群管理**：Worker 节点动态注册、心跳监控、负载均衡
- **数据血缘**：自动追踪数据流向，血缘图谱可视化
- **日志中心**：统一日志采集与检索（Loki + Logback）
- **告警中心**：多通道告警（邮件/Webhook/钉钉），阈值可配

---

## 🏗 架构概览

```mermaid
graph TB
    subgraph Frontend["前端 Vue 3"]
        UI_Connector["连接器管理"]
        UI_DAG["DAG 编排"]
        UI_AI["AI 中心"]
        UI_Python["Python 工作台"]
        UI_Ops["运维监控"]
    end

    subgraph Backend["Backend Spring Boot 3.2"]
        B_Connector["连接器管理服务"]
        B_DAG["DAG 引擎"]
        B_AI["AI 中心"]
        B_Python["Python 运行时"]
        B_Core["核心框架"]
    end

    subgraph Worker["Action Worker 分布式执行节点"]
        W_Flink["Flink Job 提交执行"]
        W_ST["SeaTunnel 任务执行"]
        W_Action["自定义 Action 算子"]
    end

    subgraph Infra["基础设施"]
        MySQL[("MySQL 8.0")]
        Nacos["Nacos 2.2+"]
        Redis[("Redis")]
    end

    Frontend -->|HTTP / WebSocket / SSE| Backend
    Backend -->|HTTP / Nacos| Worker
    Backend --> MySQL
    Backend --> Nacos
    Nacos -.->|共享配置 bigprime.yaml| Backend
    Nacos -.->|共享配置 bigprime.yaml| Worker
    Redis -.->|缓存 / 会话| Backend
    Worker --> MySQL
```

---

## 🚀 快速开始

### 环境要求

| 依赖 | 版本要求 | 说明 |
|------|---------|------|
| JDK | 17+ | 推荐 Eclipse Temurin |
| Maven | 3.8+ | 构建工具 |
| MySQL | 8.0+ | 元数据存储 |
| Nacos | 2.2+ | 配置中心 & 服务注册 |
| Node.js | 22+ | 前端构建（可由 Maven 自动下载） |

### 1. 初始化数据库

```sql
CREATE DATABASE bigprime_datasync DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE bigprime_datasync;
SOURCE init.sql;
```

> `init.sql` 位于发布包的 `script/` 目录，包含全部建表语句与初始数据。

### 2. 启动 Nacos

```bash
cd nacos/bin
sh startup.sh -m standalone
```

在 Nacos 控制台创建命名空间 `bigprime-datasync`，并添加共享配置：

- **Data ID**: `bigprime.yaml`
- **Group**: `DEFAULT_GROUP`
- **格式**: `YAML`

配置内容包括数据源、Redis 等共享信息（参考下方 Nacos 配置模板）。

### 3. 构建项目

```bash
mvn clean package -Pall -DskipTests -T 1C
```

构建产物位于 `bigprime-datasync-distribution/target/`。

### 4. 构建 Python 运行时（可选）

如需使用在线 Python IDE 功能：

```bash
# Windows
build-python-runtime.bat

# Linux
chmod +x build-python-runtime.sh
./build-python-runtime.sh
```

构建产物自动放置于 `plugins/python-runtime/`。

> 也可使用 `-with-python` Profile 一步完成：`mvn clean package -Pall-with-python -DskipTests -T 1C`

### 5. 启动服务

解压发布包后：

**Windows:**
```cmd
cd bin
start-all.bat
```

**Linux:**
```bash
cd bin
chmod +x *.sh
./start-all.sh
```

访问 http://localhost:6506 即可打开平台。

---

## 📦 部署指南

### 发布包结构

```
bigprime-datasync-distribution/
├── bin/
│   ├── start-all.bat/sh        # 一键启动（Backend + Worker）
│   └── stop-all.bat/sh         # 一键停止
├── sql/
│   └── init.sql                # 数据库初始化脚本
├── backend/
│   ├── bin/
│   │   ├── start.bat/sh        # Backend 启动脚本
│   │   ├── stop.bat/sh         # Backend 停止脚本
│   │   └── pylib_install.sh    # Python 依赖安装脚本
│   ├── conf/
│   │   ├── bootstrap.yml       # 核心启动配置（端口、Nacos地址等）
│   │   ├── application-local.yml  # 本地环境覆盖
│   │   └── application-prod.yml   # 生产环境覆盖
│   ├── lib/                    # JAR 依赖（thin jar + 外部 lib）
│   ├── static/                 # 前端静态资源
│   ├── logs/                   # 日志目录
│   └── data/                   # 数据目录
├── worker/
│   ├── bin/
│   │   ├── start-worker.bat/sh
│   │   └── stop-worker.bat/sh
│   ├── conf/
│   │   ├── bootstrap.yml       # Worker 启动配置
│   │   └── application.yml     # Worker 应用配置
│   ├── lib/
│   └── logs/
└── plugins/
    ├── python-runtime/          # 嵌入式 Python 运行时（可选）
    └── skywalking-agent/        # SkyWalking 探针（可选）
```

### 部署步骤

```mermaid
graph LR
    A[1. 初始化 MySQL] --> B[2. 启动 Nacos]
    B --> C[3. 配置 Nacos bigprime.yaml]
    C --> D[4. 构建项目 mvn package]
    D --> E["5. 构建 Python 运行时<br/>build-python-runtime（可选）"]
    E --> F[6. 启动服务 start-all]
    F --> G["7. 访问 http://localhost:6506"]
```

### 打包 Profile 说明

| Profile | 包含内容 | 适用场景 |
|---------|---------|---------|
| `all` | Backend + Worker + Frontend | 完整部署（默认） |
| `web` | Backend + Frontend | 仅 Web 服务，Worker 独立部署 |
| `worker` | Worker only | Worker 节点水平扩展 |
| `web-with-python` | Backend + Frontend + Python 运行时 | 含 Python IDE 的 Web 部署 |
| `all-with-python` | 全部 + Python 运行时 | 完整部署（含 Python IDE） |

### 生产环境配置

#### 环境变量

| 变量 | 默认值 | 说明 |
|------|-------|------|
| `SERVER_PORT` | 6506 | Backend 服务端口 |
| `DATASOURCE_URL` | - | MySQL JDBC URL |
| `DATASOURCE_USERNAME` | - | 数据库用户名 |
| `DATASOURCE_PASSWORD` | - | 数据库密码 |
| `NACOS_HOST` | 127.0.0.1 | Nacos 地址 |
| `NACOS_PORT` | 8848 | Nacos 端口 |
| `NACOS_NAMESPACE` | bigprime-datasync | Nacos 命名空间 |
| `WORKER_COUNT` | 1 | Worker 实例数量 |
| `WORKER_MAX_TASKS` | 10 | Worker 最大并发任务数 |
| `SKYWALKING_COLLECTOR` | - | SkyWalking OAP 地址 |

#### Nacos 共享配置（bigprime.yaml）

所有环境相关配置统一在 Nacos 中管理，包括数据源、Redis 等：

```yaml
# bigprime.yaml - Nacos 共享配置
spring:
  data:
    redis:
      database: 8
      host: 47.97.255.119
      port: 6379
      password: '******'
      timeout: 10000
  rabbitmq:
    host: www.bigprime.cn
    port: 5672
    username: rabbitmq
    password: '******'
    virtual-host: /
    publisher-confirms: true
    publisher-returns: true
    template:
      mandatory: true
    listener:
      simple:
        acknowledge-mode: auto
        concurrency: 3
        max-concurrency: 10
        prefetch: 10
  datasource:
    dgp:
      driver-class-name: com.mysql.cj.jdbc.Driver
      url: jdbc:mysql://47.97.255.119:3316/bigprime?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai&nullCatalogMeansCurrent=true
      username: root
      password: '******'
      hikari:
        maximum-pool-size: 60
        connection-timeout: 60000
        idle-timeout: 60000
        validation-timeout: 3000
        max-lifetime: 180000
        login-timeout: 5
        minimum-idle: 10

easy-query:
  enable: true
  database: mysql
  name-conversion: underlined
  delete-throw: true
  print-sql: true
  keep-native-style: true
```

#### 配置文件说明

| 文件 | 位置 | 说明 |
|------|------|------|
| `bootstrap.yml` | `backend/conf/` | 核心启动配置（端口、Nacos、Python 运行时等） |
| `application-local.yml` | `backend/conf/` | 本地环境覆盖配置 |
| `application-prod.yml` | `backend/conf/` | 生产环境覆盖配置（通过环境变量注入敏感信息） |
| `bootstrap.yml` | `worker/conf/` | Worker 启动配置 |
| `application.yml` | `worker/conf/` | Worker 应用配置 |

#### 激活生产环境 Profile

修改 `backend/conf/bootstrap.yml`：

```yaml
spring:
  profiles:
    active: prod
```

### 可选组件

#### Python 运行时

平台内置嵌入式 Python 运行时，支持在线 Python IDE：

```bash
# Windows
build-python-runtime.bat

# Linux
chmod +x build-python-runtime.sh
./build-python-runtime.sh
```

构建产物放置于 `plugins/python-runtime/`。也可使用 `-with-python` Profile 一步打包。

#### SkyWalking APM

将 Skywalking Agent 放置于 `plugins/skywalking-agent/`，启动脚本会自动检测并加载。

---

## 📁 模块说明

### 🔌 连接器管理

统一的连接器生命周期管理：注册、测试、健康检查、参数配置。支持 50+ 数据源，SPI 插件化架构支持自定义扩展。
![](resources/connector-metric.png)

![](resources/connectors.png)

### 🔄 DAG 编排

可视化拖拽式流程设计，支持节点间的依赖编排、并行分支、条件路由。支持 HTTP 同步和 MQ 异步两种执行模式。
![](resources/dag.png)

### 🤖 AI 中心

统一管理 AI 提供商与模型，内置 MCP Server 让 AI Agent 直接操作平台。支持对话助手、RAG 知识库、流式输出。
![](resources/chat.png)

![](resources/chat-2.png)

![](resources/mcp.png)

![](resources/rag-1.png)

![](resources/rag-2.png)

### 🐍 Python 工作台

嵌入式 Python 运行时，无需预装 Python。集成 Jupyter Kernel Gateway 和 LSP 智能补全，提供 IDE 级在线开发体验。

![](resources/python-1.png)

![](resources/python-ai.png)

### 📊 集群管理

Worker 节点动态注册、心跳监控、资源感知负载均衡。支持多种调度策略：随机、轮询、最少活跃、资源智能调度。
![](resources/workers.png)

### 🔔 告警中心

多通道告警通知（邮件/Webhook/钉钉），连接器健康异常、任务执行失败等事件自动触发，阈值可配。
![](resources/alert.png)

![](resources/alter-rule.png)

### 📈 数据血缘

自动追踪数据流向，构建血缘图谱，可视化展示数据从源到目标的完整链路。
![](resources/lineage-1.png)

![](resources/lineage-2.png)

![](resources/lineage-3.png)

### 🔍 SQL 开发

内置 SQL 查询工作台，支持多数据源切换、SQL 编辑与执行、结果预览与导出。集成 Flink SQL 模板引擎，变量化配置一键生成作业脚本。
![](resources/sql-1.png)

![](resources/sql-4.png)

### 🌐 协议网关

统一 API 网关，支持 HTTP/CoAP/MQTT 等多协议接入，提供路由转发、协议转换、鉴权拦截能力。设备与第三方系统通过网关统一访问平台服务。
![](resources/wg.png)

![](resources/wg-2.png)

### 📋 日志管理

统一日志采集、存储与检索，支持按服务/级别/时间范围快速过滤。集成 Loki 日志后端，实时推送日志流，运维排障一目了然。
![](resources/log-1.png)

![](resources/log-2.png)

![](resources/log-3.png)

### 项目模块结构

```
bigprime-datasync/
├── bigprime-datasync-core/            # 核心框架（安全、通用工具、基础实体）
├── bigprime-datasync-backend/         # 后端主服务（REST API、WebSocket、AI、Python）
├── bigprime-datasync-ui/              # 前端工程（Vue 3 + Vite）
├── bigprime-datasync-dag/             # DAG 编排引擎
│   ├── bigprime-datasync-dag-common/
│   ├── bigprime-datasync-dag-config/
│   └── bigprime-datasync-dag-core/
├── bigprime-datasync-query/           # SQL 查询模块
├── bigprime-datasync-distribution/    # 打包分发（Assembly Plugin）
├── bigprime-connector/                # 连接器框架 & 50+ 连接器实现
├── bigprime-connector-flink/          # Flink 连接器适配层
│   ├── flink-api/
│   ├── flink-common/
│   └── flink-1.16/
├── bigprime-connector-seatunnel/      # SeaTunnel 连接器适配层
│   ├── seatunnel-api/
│   ├── seatunnel-2.3.11/
│   └── seatunnel-2.3.12/
├── bigprime-action/                   # Action 算子引擎
│   ├── bigprime-action-interface/
│   ├── bigprime-action-core/
│   ├── bigprime-action-impl/
│   └── bigprime-action-worker/
├── bigprime-ai/                       # AI 模块
│   ├── bigprime-ai-api/
│   ├── bigprime-ai-core/
│   ├── bigprime-ai-knowledge/
│   ├── bigprime-ai-memory/
│   ├── bigprime-ai-search/
│   ├── bigprime-ai-skill/
│   └── bigprime-ai-usage/
├── bigprime-cluster-management/       # 集群管理
├── bigprime-alert-center/             # 告警中心
│   ├── alert-center-api/
│   ├── alert-center-core/
│   └── alert-center-storage/
├── bigprime-lineage/                  # 数据血缘
├── bigprime-log-management/           # 日志管理
├── bigprime-gateway/                  # API 网关
│   ├── gateway-api/
│   ├── gateway-core/
│   └── gateway-service/
└── assembly/                          # Assembly 描述符 & 启停脚本
```

---

## 💻 技术栈

### 后端

| 技术 | 版本 | 说明 |
|------|------|------|
| Java | 17 | JDK 17+ |
| Spring Boot | 3.2.0 | 核心框架 |
| Spring Cloud | 2023.0.0 | 微服务框架 |
| Spring Cloud Alibaba | 2022.0.0.0 | Nacos 配置中心 & 服务发现 |
| Spring AI | 1.1.4 | AI 模型接入 & MCP Server |
| Apache Flink | 1.16 | 实时计算引擎 |
| Apache SeaTunnel | 2.3.x | 批量数据同步引擎 |
| MyBatis-Plus | 3.5.x | ORM 框架 |
| Hutool | 5.8.23 | Java 工具库 |
| Nacos | 2.2+ | 配置中心 & 服务注册 |

### 前端

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.5 | 前端框架 |
| OpenTiny Vue | 3.23 | UI 组件库 |
| Vite | 5.4 | 构建工具 |
| TypeScript | 5.4 | 类型安全 |
| AntV X6 | 2.18 | DAG 可视化编排 |
| ECharts | 5.5 | 数据可视化 |
| Monaco Editor | 0.48 | 代码编辑器 |
| Pinia | 2.2 | 状态管理 |

---

## 📜 License

本项目基于 [Apache License 2.0](LICENSE) 开源。

---

## 🙏 致谢

- [Apache Flink](https://flink.apache.org/) — 实时计算引擎
- [Apache SeaTunnel](https://seatunnel.apache.org/) — 数据同步引擎
- [Spring Boot](https://spring.io/projects/spring-boot) — 应用框架
- [Spring AI](https://spring.io/projects/spring-ai) — AI 集成框架
- [OpenTiny](https://opentiny.design/) — Vue 3 UI 组件库
- [AntV X6](https://x6.antv.antgroup.com/) — 图编辑引擎
- [EasyQuery](https://www.easyquery.com/) — 数据查询与过滤组件

## 欢迎交流
- **欢迎您加入社区交流分享**
  <img style="margin: 20px 20px 20px 0;" src="resources/us1.png"  width="300" height="300"/>
