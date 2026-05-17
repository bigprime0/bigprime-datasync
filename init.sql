create table ai_api_call_log
(
    id              varchar(64)                   not null comment '主键 ID（雪花）'
        primary key,
    api_key_id      varchar(64)                   not null comment '使用的 API 密钥 ID',
    endpoint        varchar(256)                  null comment '调用接口路径',
    request_tokens  int         default 0         not null comment '请求 Token 数',
    response_tokens int         default 0         not null comment '响应 Token 数',
    latency_ms      int         default 0         not null comment '响应耗时（毫秒）',
    status          varchar(32) default 'SUCCESS' not null comment '状态：SUCCESS/ERROR/RATE_LIMITED',
    error_msg       text                          null comment '错误信息',
    create_time     datetime                      null comment '调用时间'
)
    comment 'AI API 调用日志表' charset = utf8mb4;

create index idx_api_key_id
    on ai_api_call_log (api_key_id);

create index idx_create_time
    on ai_api_call_log (create_time);

create table ai_api_key
(
    id              varchar(64)                        not null comment '主键'
        primary key,
    name            varchar(128)                       not null comment 'Key 名称',
    api_key         varchar(128)                       not null comment 'API Key（sk- 前缀，唯一）',
    assistant_id    varchar(64)                        null comment '绑定的助手 ID',
    allowed_origins varchar(1024)                      null comment '允许的来源域名（逗号分隔，空=不限）',
    expire_time     datetime                           null comment '过期时间（null=永不过期）',
    rate_limit      int      default 0                 null comment '每分钟最大请求数（0=不限）',
    total_calls     bigint   default 0                 null comment '累计调用次数',
    status          tinyint  default 1                 null comment '状态：1-启用 0-禁用',
    creator         varchar(64)                        null comment '创建人 ID',
    creator_name    varchar(64)                        null comment '创建人姓名',
    create_time     datetime default CURRENT_TIMESTAMP null comment '创建时间',
    update_time     datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    constraint uk_api_key
        unique (api_key)
)
    comment 'AI 开放 API Key 表' charset = utf8mb4;

create table ai_assistant
(
    id                  varchar(64)          not null comment '主键 ID（雪花）'
        primary key,
    name                varchar(128)         not null comment '助手名称',
    alias               varchar(128)         null comment '别名（唯一英文标识，供其他模块调用）',
    enabled_mcp_servers text                 null comment '已启用的 MCP 服务器 ID 列表（JSON 数组）',
    enabled_skills      text                 null comment '已启用的技能 ID 列表（JSON 数组）',
    knowledge_base_ids  text                 null comment '绑定的知识库 ID 列表（JSON 数组）',
    enabled_doc_libs    text                 null comment '已绑定的文档库 ID 列表（JSON 数组）',
    memory_enabled      tinyint(1) default 0 not null comment '是否启用记忆：0-禁用 1-启用',
    web_search_enabled  tinyint(1) default 0 not null comment '是否启用网络搜索兜底：0-禁用 1-启用',
    description         text                 null comment '描述',
    avatar              varchar(512)         null comment '头像 URL 或 emoji',
    model_id            varchar(64)          not null comment '绑定的模型 ID',
    system_prompt       text                 null comment '系统提示词',
    opening_message     text                 null comment '开场白',
    temperature         double               null comment '温度参数（0.0-2.0）',
    max_tokens          int                  null comment '最大 Token 数',
    is_public           tinyint(1) default 0 not null comment '是否公开：0-私有 1-公开',
    status              tinyint    default 1 not null comment '状态：1-启用 0-禁用',
    category            varchar(50)          null,
    sort_order          int        default 0 not null comment '排序权重',
    creator             varchar(64)          null comment '创建人 ID',
    creator_name        varchar(128)         null comment '创建人名称',
    create_time         datetime             null comment '创建时间',
    updater             varchar(64)          null comment '更新人 ID',
    updater_name        varchar(128)         null comment '更新人名称',
    update_time         datetime             null comment '更新时间',
    deleted             tinyint    default 0 not null comment '逻辑删除：0-未删除 1-已删除',
    constraint alias
        unique (alias)
)
    comment 'AI 助手配置表' charset = utf8mb4;

create index idx_model_id
    on ai_assistant (model_id);

create table ai_crawler_execution
(
    id            varchar(64)                   not null comment '主键 ID'
        primary key,
    task_id       varchar(64)                   not null comment '关联的爬虫任务 ID',
    task_name     varchar(255)                  null comment '任务名称（冗余）',
    status        varchar(32) default 'RUNNING' not null comment '状态: RUNNING / SUCCESS / FAILED / CANCELLED',
    model_id      varchar(64)                   null comment '使用的 AI 模型 ID',
    website_url   varchar(1000)                 null comment '爬取的目标 URL',
    instructions  text                          null comment '执行时的自然语言指令',
    total_steps   int         default 0         null comment '总步骤数',
    events        longtext                      null comment 'Agent 执行事件列表（JSON 数组，含 THINKING/ACTION/OBSERVATION/RESULT）',
    result_data   longtext                      null comment '最终提取的数据（JSON）',
    error_message text                          null comment '失败时的错误信息',
    duration_ms   bigint                        null comment '执行耗时（毫秒）',
    started_at    datetime                      null comment '开始时间',
    completed_at  datetime                      null comment '完成时间',
    creator       varchar(64)                   null comment '创建人',
    create_time   datetime                      null comment '创建时间',
    deleted       tinyint(1)  default 0         not null comment '逻辑删除: 0-未删除 1-已删除'
)
    comment 'AI 爬虫 Agent 执行记录' charset = utf8mb4;

create index idx_started_at
    on ai_crawler_execution (started_at);

create index idx_status
    on ai_crawler_execution (status);

create index idx_task_id
    on ai_crawler_execution (task_id);

create table ai_doc_library
(
    id                 varchar(64)       not null comment '主键 ID（雪花）'
        primary key,
    name               varchar(128)      not null comment '唯一标识名（如 seatunnel-docs，用作工具名前缀）',
    display_name       varchar(128)      null comment '显示名称（如 SeaTunnel 文档库）',
    description        text              null comment '描述',
    doc_path           varchar(512)      not null comment '文档根路径（相对或绝对路径）',
    file_filter        varchar(64)       null comment '文件过滤模式（如 *.md）',
    max_read_length    int               null comment '单次读取最大字符数（默认 8000）',
    max_search_results int               null comment '关键词搜索最多返回段落数（默认 10）',
    context_lines      int               null comment '搜索每个匹配段落上下文行数（默认 5）',
    file_count         int               null comment '文档数量（自动统计）',
    icon               varchar(128)      null comment '图标（emoji 或 URL）',
    category           varchar(32)       null comment '分类（如 data-dev/search/compute）',
    status             tinyint default 1 not null comment '状态：1-启用 0-禁用',
    sort_order         int     default 0 not null comment '排序权重',
    creator            varchar(64)       null comment '创建人 ID',
    creator_name       varchar(128)      null comment '创建人名称',
    create_time        datetime          null comment '创建时间',
    updater            varchar(64)       null comment '更新人 ID',
    updater_name       varchar(128)      null comment '更新人名称',
    update_time        datetime          null comment '更新时间',
    deleted            tinyint default 0 not null comment '逻辑删除：0-未删除 1-已删除',
    constraint uk_doc_lib_name
        unique (name)
)
    comment '文档库表（DocLibrary，指向文件系统目录，助手绑定后注册 list/read/search 工具）' charset = utf8mb4;

create index idx_category
    on ai_doc_library (category);

create index idx_status
    on ai_doc_library (status);

create table ai_document
(
    id                varchar(64)                   not null comment '主键 ID（雪花）'
        primary key,
    knowledge_base_id varchar(64)                   not null comment '所属知识库 ID',
    file_name         varchar(256)                  not null comment '文件名',
    file_type         varchar(32)                   null comment '文件类型（PDF/WORD/MARKDOWN/TXT）',
    file_size         bigint                        null comment '文件大小（字节）',
    file_content      longtext                      null comment '文件文本内容（提取后存储）',
    chunk_count       int         default 0         not null comment '分块数量',
    graph_node_count  int         default 0         null comment '知识图谱节点数量',
    status            varchar(32) default 'PENDING' not null comment '状态：PENDING/PROCESSING/DONE/FAILED',
    error_msg         text                          null comment '处理错误信息',
    creator           varchar(64)                   null comment '创建人 ID',
    creator_name      varchar(128)                  null comment '创建人名称',
    create_time       datetime                      null comment '创建时间',
    updater           varchar(64)                   null comment '更新人 ID',
    updater_name      varchar(128)                  null comment '更新人名称',
    update_time       datetime                      null comment '更新时间',
    deleted           tinyint     default 0         not null comment '逻辑删除：0-未删除 1-已删除'
)
    comment 'AI 知识库文档表' charset = utf8mb4;

create index idx_kb_id
    on ai_document (knowledge_base_id);

create table ai_document_chunk
(
    id          varchar(64)   not null comment '主键 ID（雪花）'
        primary key,
    document_id varchar(64)   not null comment '所属文档 ID',
    kb_id       varchar(64)   not null comment '所属知识库 ID',
    content     longtext      not null comment '分块文本内容',
    chunk_index int default 0 not null comment '分块序号',
    create_time datetime      null comment '创建时间'
)
    comment 'AI 文档分块表' charset = utf8mb4;

create index idx_doc_id
    on ai_document_chunk (document_id);

create index idx_kb_id
    on ai_document_chunk (kb_id);

create table ai_external_agent
(
    id             varchar(64)          not null comment '主键 ID（雪花）'
        primary key,
    name           varchar(128)         not null comment '配置名称，如"我的Dify爬虫Agent"',
    provider       varchar(20)          not null comment '平台类型：DIFY/COZE/FASTGPT',
    base_url       varchar(512)         not null comment '平台 API 地址（支持私有化部署）',
    api_key        varchar(1024)        not null comment 'API Key（SHA-256 哈希存储，不可逆）',
    api_key_prefix varchar(32)          null comment 'API Key 前缀（明文，用于展示）',
    agent_id       varchar(128)         null comment 'Agent 标识（Coze=bot_id，FastGPT=appId，Dify 不需要）',
    description    varchar(500)         null comment '描述',
    enabled        tinyint(1) default 1 not null comment '是否启用：1-启用 0-禁用',
    creator        varchar(64)          null comment '创建人 ID',
    creator_name   varchar(128)         null comment '创建人名称',
    create_time    datetime             null comment '创建时间',
    updater        varchar(64)          null comment '更新人 ID',
    updater_name   varchar(128)         null comment '更新人名称',
    update_time    datetime             null comment '更新时间',
    deleted        tinyint    default 0 not null comment '逻辑删除：0-未删除 1-已删除'
)
    comment '外部 Agent 平台配置表' charset = utf8mb4;

create table ai_external_agent_session
(
    id                       varchar(64)  not null comment '主键 ID（雪花）'
        primary key,
    external_agent_id        varchar(64)  not null comment '关联 ai_external_agent.id',
    local_session_id         varchar(64)  not null comment '本平台会话 ID（ai_session.id）',
    external_conversation_id varchar(256) null comment '三方平台返回的 conversation_id（首次调用后写入）',
    create_time              datetime     null comment '创建时间',
    update_time              datetime     null comment '最后更新时间',
    constraint uk_agent_local_session
        unique (external_agent_id, local_session_id)
)
    comment '外部 Agent 会话映射表' charset = utf8mb4;

create table ai_graph_schema
(
    id                varchar(64)  not null comment '主键 ID（雪花）'
        primary key,
    knowledge_base_id varchar(64)  not null comment '所属知识库 ID',
    entity_type       varchar(128) not null comment '实体类型名称，如：人物、公司、产品',
    description       varchar(512) null comment '类型说明',
    attributes        text         null comment '属性列表（JSON 数组，如 ["姓名","职位","所属公司"]）',
    relations         text         null comment '可参与的关系类型（JSON 数组）',
    extract_prompt    text         null comment '专项抽取指令（可选，给 LLM 的额外 Prompt）',
    creator           varchar(64)  null comment '创建人 ID',
    create_time       datetime     null comment '创建时间',
    constraint uk_kb_type
        unique (knowledge_base_id, entity_type)
)
    comment 'AI 知识图谱实体类型模板表' charset = utf8mb4;

create index idx_kb_id
    on ai_graph_schema (knowledge_base_id);

create table ai_knowledge_base
(
    id                   varchar(64)                    not null comment '主键 ID（雪花）'
        primary key,
    name                 varchar(128)                   not null comment '知识库名称',
    description          text                           null comment '描述',
    embedding_model_id   varchar(64)                    null comment '向量化模型 ID（关联 ai_model，type=EMBEDDING）',
    rerank_model_id      varchar(64)                    null comment '重排序模型 ID（关联 ai_model，type=RERANK）',
    graph_model_id       varchar(64)                    null comment '图谱语义模型 ID（关联 ai_model，type=CHAT）',
    chunk_size           int           default 500      not null comment '分块大小（字符数）',
    chunk_overlap        int           default 50       not null comment '分块重叠字符数',
    chunk_strategy       varchar(32)   default 'FIXED'  not null comment '分块策略：FIXED/SENTENCE',
    retrieval_mode       varchar(32)   default 'VECTOR' not null comment '检索模式：VECTOR/GRAPH/HYBRID',
    doc_count            int           default 0        not null comment '文档数量',
    status               tinyint       default 1        not null comment '状态：1-启用 0-禁用',
    vector_connector_id  varchar(64)                    null comment '向量数据库连接器 ID（Milvus）',
    graph_connector_id   varchar(64)                    null comment '图数据库连接器 ID（Neo4j）',
    creator              varchar(64)                    null comment '创建人 ID',
    creator_name         varchar(128)                   null comment '创建人名称',
    create_time          datetime                       null comment '创建时间',
    updater              varchar(64)                    null comment '更新人 ID',
    updater_name         varchar(128)                   null comment '更新人名称',
    update_time          datetime                       null comment '更新时间',
    deleted              tinyint       default 0        not null comment '逻辑删除：0-未删除 1-已删除',
    confidence_threshold decimal(4, 2) default 0.50     null
)
    comment 'AI 知识库表' charset = utf8mb4;

create table ai_knowledge_chunk
(
    id                varchar(64)   not null comment '主键 ID（雪花）'
        primary key,
    knowledge_base_id varchar(64)   not null comment '所属知识库 ID',
    document_id       varchar(64)   not null comment '所属文档 ID',
    content           text          not null comment '分块文本内容',
    chunk_index       int default 0 not null comment '分块序号（从0开始）',
    token_count       int           null comment '估算 token 数',
    milvus_id         varchar(128)  null comment '在 Milvus 中的向量 ID',
    create_time       datetime      null comment '创建时间'
)
    comment 'AI 知识库文本块表' charset = utf8mb4;

create index idx_doc_id
    on ai_knowledge_chunk (document_id);

create index idx_kb_id
    on ai_knowledge_chunk (knowledge_base_id);

create table ai_knowledge_graph_entity
(
    id                varchar(64)  not null comment '主键 ID（雪花）'
        primary key,
    knowledge_base_id varchar(64)  not null comment '所属知识库 ID',
    document_id       varchar(64)  null comment '来源文档 ID',
    entity_name       varchar(512) not null comment '实体名称',
    entity_type       varchar(128) null comment '实体类型：PERSON/ORG/CONCEPT/PLACE/EVENT/OTHER',
    properties        text         null comment '实体属性（JSON 对象，LLM 抽取后填充）',
    neo4j_node_id     varchar(128) null comment 'Neo4j 中的节点 ID',
    create_time       datetime     null comment '创建时间'
)
    comment 'AI 知识图谱实体索引表' charset = utf8mb4;

create index idx_doc_id
    on ai_knowledge_graph_entity (document_id);

create index idx_entity_name
    on ai_knowledge_graph_entity (entity_name(191));

create index idx_kb_id
    on ai_knowledge_graph_entity (knowledge_base_id);

create table ai_knowledge_graph_relation
(
    id                 varchar(64)   not null comment '主键 ID（雪花）'
        primary key,
    knowledge_base_id  varchar(64)   not null comment '所属知识库 ID',
    document_id        varchar(64)   null comment '来源文档 ID',
    source_entity_id   varchar(64)   not null comment '主体实体 ID（关联 ai_knowledge_graph_entity）',
    source_entity_name varchar(512)  null comment '主体实体名称（冗余）',
    target_entity_id   varchar(64)   not null comment '客体实体 ID',
    target_entity_name varchar(512)  null comment '客体实体名称（冗余）',
    relation_type      varchar(128)  not null comment '关系类型，如：属于、管理、投资',
    confidence         decimal(5, 4) null comment 'LLM 置信度（0-1）',
    properties         text          null comment '关系属性（JSON 对象）',
    neo4j_edge_id      varchar(128)  null comment 'Neo4j 中的边 ID',
    document_name      varchar(512)  null comment '来源文档名称（冗余）',
    create_time        datetime      null comment '创建时间'
)
    comment 'AI 知识图谱关系索引表' charset = utf8mb4;

create index idx_kb_id
    on ai_knowledge_graph_relation (knowledge_base_id);

create index idx_relation_type
    on ai_knowledge_graph_relation (relation_type);

create index idx_source_entity
    on ai_knowledge_graph_relation (source_entity_id);

create index idx_target_entity
    on ai_knowledge_graph_relation (target_entity_id);

create table ai_mcp_market
(
    id            varchar(64)          not null comment '主键 ID（雪花）'
        primary key,
    name          varchar(128)         not null comment '服务名称',
    description   text                 null comment '服务描述',
    icon          varchar(256)         null comment '图标 URL 或 emoji',
    category      varchar(64)          null comment '分类：search/data/dev/weather/other',
    transport     varchar(32)          not null comment '传输协议：STDIO/SSE/HTTP',
    package_name  varchar(256)         null comment 'npm包名或镜像名（STDIO使用）',
    command       varchar(512)         null comment '启动命令（STDIO使用）',
    args          text                 null comment '命令参数 JSON数组',
    endpoint      varchar(512)         null comment '连接地址（SSE/HTTP使用）',
    env_vars      text                 null comment '环境变量 JSON对象',
    config_schema text                 null comment '配置项Schema（JSON Schema）',
    install_count bigint     default 0 not null comment '安装次数统计',
    version       varchar(32)          null comment '版本号',
    author        varchar(128)         null comment '作者',
    source_url    varchar(512)         null comment '源代码/文档地址',
    is_official   tinyint(1) default 0 not null comment '是否官方推荐：0-否 1-是',
    status        tinyint    default 1 not null comment '状态：1-上架 0-下架',
    sort_order    int        default 0 not null comment '排序权重',
    creator       varchar(64)          null comment '创建人 ID',
    create_time   datetime             null comment '创建时间',
    updater       varchar(64)          null comment '更新人 ID',
    update_time   datetime             null comment '更新时间',
    deleted       tinyint    default 0 not null comment '逻辑删除：0-未删除 1-已删除'
)
    comment 'MCP 服务市场表' charset = utf8mb4;

create index idx_category
    on ai_mcp_market (category);

create index idx_is_official
    on ai_mcp_market (is_official);

create index idx_status
    on ai_mcp_market (status);

create index idx_transport
    on ai_mcp_market (transport);

create table ai_mcp_server
(
    id            varchar(64)          not null comment '主键 ID（雪花）'
        primary key,
    name          varchar(128)         not null comment '服务器名称',
    description   text                 null comment '描述',
    icon_url      varchar(512)         null comment '图标 URL',
    type          varchar(32)          not null comment '类型：BUILTIN/MARKET/CUSTOM',
    transport     varchar(32)          not null comment '传输协议：STDIO/SSE/HTTP',
    endpoint      varchar(512)         null comment '连接地址（SSE/HTTP 使用）',
    command       varchar(512)         null comment '命令（STDIO 使用）',
    args          text                 null comment '命令参数（JSON 数组）',
    env_vars      text                 null comment '环境变量（JSON 对象）',
    config_schema text                 null comment '配置 Schema（JSON Schema）',
    config_values text                 null comment '用户配置值（JSON 对象，加密）',
    is_configured tinyint(1) default 0 not null comment '是否已完成配置',
    status        tinyint    default 1 not null comment '状态：1-启用 0-禁用',
    creator       varchar(64)          null comment '创建人 ID',
    creator_name  varchar(128)         null comment '创建人名称',
    create_time   datetime             null comment '创建时间',
    updater       varchar(64)          null comment '更新人 ID',
    updater_name  varchar(128)         null comment '更新人名称',
    update_time   datetime             null comment '更新时间',
    deleted       tinyint    default 0 not null comment '逻辑删除：0-未删除 1-已删除'
)
    comment 'MCP 服务器表' charset = utf8mb4;

create table ai_memory
(
    id          varchar(64)                not null comment '主键 ID（雪花）'
        primary key,
    user_id     varchar(64)                not null comment '用户 ID',
    type        varchar(32) default 'LONG' not null comment '记忆类型：SHORT-短期 / LONG-长期',
    content     text                       not null comment '记忆内容',
    importance  int         default 5      not null comment '重要性评分（1-10）',
    source      varchar(32)                null comment '来源：CHAT/MANUAL',
    session_id  varchar(64)                null comment '来源会话 ID',
    expire_at   datetime                   null comment '过期时间（NULL 表示永久）',
    create_time datetime                   null comment '创建时间',
    deleted     tinyint     default 0      not null comment '逻辑删除：0-未删除 1-已删除'
)
    comment '用户 AI 记忆表' charset = utf8mb4;

create index idx_type
    on ai_memory (type);

create index idx_user_id
    on ai_memory (user_id);

create table ai_message
(
    id            varchar(64)       not null comment '主键 ID（雪花）'
        primary key,
    session_id    varchar(64)       not null comment '所属会话 ID',
    role          varchar(32)       not null comment '消息角色：USER / ASSISTANT / SYSTEM',
    content       longtext          null comment '消息内容（支持 Markdown）',
    input_tokens  int               null comment '消耗的输入 Token 数',
    output_tokens int               null comment '消耗的输出 Token 数',
    sequence      int     default 0 not null comment '消息序号（会话内有序）',
    model_id      varchar(64)       null comment '实际使用的模型 ID',
    finish_time   datetime          null comment '完成时间（流式结束时间）',
    creator       varchar(64)       null comment '创建人 ID',
    creator_name  varchar(128)      null comment '创建人名称',
    create_time   datetime          null comment '创建时间',
    updater       varchar(64)       null comment '更新人 ID',
    updater_name  varchar(128)      null comment '更新人名称',
    update_time   datetime          null comment '更新时间',
    deleted       tinyint default 0 not null comment '逻辑删除：0-未删除 1-已删除'
)
    comment 'AI 对话消息表' charset = utf8mb4;

create index idx_session_id
    on ai_message (session_id);

create index idx_session_seq
    on ai_message (session_id, sequence);

create table ai_model
(
    id                 varchar(64)                not null comment '主键 ID（雪花）'
        primary key,
    provider_id        varchar(64)                not null comment '所属提供商 ID',
    model_type         varchar(32) default 'CHAT' not null comment '模型类型：CHAT/EMBEDDING/RERANK/IMAGE',
    model_name         varchar(128)               not null comment '模型标识（如 gpt-4o、llama3）',
    display_name       varchar(128)               null comment '展示名称',
    max_tokens         int                        null comment '最大 Token 数',
    supports_vision    tinyint(1)  default 0      not null comment '是否支持视觉（多模态）',
    supports_tools     tinyint(1)  default 0      not null comment '是否支持工具调用',
    supports_stream    tinyint(1)  default 1      not null comment '是否支持流式输出',
    input_price_per_k  decimal(10, 6)             null comment '输入 Token 单价（美元/1K）',
    output_price_per_k decimal(10, 6)             null comment '输出 Token 单价（美元/1K）',
    status             tinyint     default 1      not null comment '状态：1-启用 0-禁用',
    sort_order         int         default 0      not null comment '排序权重',
    creator            varchar(64)                null comment '创建人 ID',
    creator_name       varchar(128)               null comment '创建人名称',
    create_time        datetime                   null comment '创建时间',
    updater            varchar(64)                null comment '更新人 ID',
    updater_name       varchar(128)               null comment '更新人名称',
    update_time        datetime                   null comment '更新时间',
    deleted            tinyint     default 0      not null comment '逻辑删除：0-未删除 1-已删除'
)
    comment 'AI 模型表' charset = utf8mb4;

create index idx_provider_id
    on ai_model (provider_id);

create table ai_prompt
(
    id           varchar(64)          not null comment '主键 ID（雪花）'
        primary key,
    title        varchar(256)         not null comment '提示词标题',
    description  varchar(512)         null comment '提示词描述',
    variables    varchar(512)         null comment '变量列表（JSON 数组，如 ["name","lang"]）',
    content      longtext             not null comment '提示词内容（支持变量 {{变量名}}）',
    category     varchar(64)          null comment '分类（如：写作/编程/分析/翻译）',
    tags         varchar(512)         null comment '标签（JSON 数组）',
    is_public    tinyint(1) default 0 not null comment '是否公开：0-私有 1-公开',
    usage_count  int        default 0 not null comment '使用次数',
    sort_order   int        default 0 not null comment '排序权重',
    status       tinyint    default 1 not null comment '状态：1-启用 0-禁用',
    creator      varchar(64)          null comment '创建人 ID',
    creator_name varchar(128)         null comment '创建人名称',
    create_time  datetime             null comment '创建时间',
    updater      varchar(64)          null comment '更新人 ID',
    updater_name varchar(128)         null comment '更新人名称',
    update_time  datetime             null comment '更新时间',
    deleted      tinyint    default 0 not null comment '逻辑删除：0-未删除 1-已删除'
)
    comment 'AI 提示词表' charset = utf8mb4;

create index idx_category
    on ai_prompt (category);

create index idx_creator
    on ai_prompt (creator);

create table ai_provider
(
    id           varchar(64)       not null comment '主键 ID（雪花）'
        primary key,
    name         varchar(128)      not null comment '提供商名称（用户自定义）',
    type         varchar(32)       not null comment '类型：OPENAI/ANTHROPIC/OLLAMA/DEEPSEEK/CUSTOM',
    api_endpoint varchar(512)      null comment 'API 地址（Ollama/自定义必填）',
    api_key      varchar(512)      null comment 'API Key（AES-256 加密存储）',
    status       tinyint default 1 not null comment '状态：1-启用 0-禁用',
    sort_order   int     default 0 not null comment '排序权重',
    creator      varchar(64)       null comment '创建人 ID',
    creator_name varchar(128)      null comment '创建人名称',
    create_time  datetime          null comment '创建时间',
    updater      varchar(64)       null comment '更新人 ID',
    updater_name varchar(128)      null comment '更新人名称',
    update_time  datetime          null comment '更新时间',
    deleted      tinyint default 0 not null comment '逻辑删除：0-未删除 1-已删除'
)
    comment 'AI 提供商表' charset = utf8mb4;

create table ai_search_config
(
    id           varchar(64)           not null comment '主键 ID（雪花）'
        primary key,
    name         varchar(128)          null comment '配置名称（如：Bing搜索）',
    engine       varchar(32)           not null comment '搜索引擎：BING/BRAVE/SERPAPI',
    api_key      varchar(512)          null comment 'API Key（AES-256 加密）',
    endpoint     varchar(512)          null comment 'API 地址（自定义时使用）',
    config_json  text                  null comment '附加配置 JSON（如 Google cx 字段：{"cx":"..."}）',
    max_results  int        default 10 not null comment '最大返回结果数',
    is_default   tinyint(1) default 0  not null comment '是否为默认搜索引擎',
    status       tinyint    default 1  not null comment '状态：1-启用 0-禁用',
    creator      varchar(64)           null comment '创建人 ID',
    creator_name varchar(128)          null comment '创建人名称',
    create_time  datetime              null comment '创建时间',
    updater      varchar(64)           null comment '更新人 ID',
    updater_name varchar(128)          null comment '更新人名称',
    update_time  datetime              null comment '更新时间',
    deleted      tinyint    default 0  not null comment '逻辑删除：0-未删除 1-已删除'
)
    comment 'AI 网络搜索配置表' charset = utf8mb4;

create table ai_session
(
    id            varchar(64)       not null comment '主键 ID（雪花）'
        primary key,
    title         varchar(256)      null comment '会话标题（自动从第一条消息截取）',
    assistant_id  varchar(64)       null comment '关联助手 ID（为空使用默认设置）',
    model_id      varchar(64)       not null comment '使用的模型 ID',
    system_prompt text              null comment '系统提示词（覆盖助手默认设置）',
    temperature   double            null comment '温度参数（0.0-2.0）',
    max_tokens    int               null comment '最大 Token 数',
    message_count int     default 0 not null comment '消息数量（冗余）',
    status        tinyint default 1 not null comment '状态：1-活跃 0-归档',
    creator       varchar(64)       null comment '创建人 ID',
    creator_name  varchar(128)      null comment '创建人名称',
    create_time   datetime          null comment '创建时间',
    updater       varchar(64)       null comment '更新人 ID',
    updater_name  varchar(128)      null comment '更新人名称',
    update_time   datetime          null comment '更新时间',
    deleted       tinyint default 0 not null comment '逻辑删除：0-未删除 1-已删除',
    source        varchar(32)       null comment '会话来源: chat/etl/code/crawler'
)
    comment 'AI 对话会话表' charset = utf8mb4;

create index idx_creator
    on ai_session (creator);

create index idx_model_id
    on ai_session (model_id);

create table ai_skill
(
    id             varchar(64)                  not null comment '主键 ID（雪花）'
        primary key,
    name           varchar(128)                 not null comment 'Skill 标识（全局唯一，对应 SKILL.md frontmatter.name）',
    display_name   varchar(128)                 null comment '显示名称',
    description    text                         null comment '功能描述（向 LLM 暴露，用于助手绑定选择）',
    skill_md       longtext                     null comment 'SKILL.md 完整内容（YAML frontmatter + Markdown 正文）',
    category       varchar(64)                  null comment '分类（data-sync/search/analysis/custom 等）',
    tags           varchar(512)                 null comment '标签（JSON 数组，如 ["seatunnel","etl"]）',
    source_type    varchar(32) default 'CUSTOM' not null comment '来源：IMPORTED-ZIP导入 / CUSTOM-在线编写 / BUILTIN-系统内置',
    has_references tinyint(1)  default 0        not null comment '是否包含 references 文件（ai_skill_file 表）',
    has_scripts    tinyint(1)  default 0        not null comment '是否包含 scripts 文件（Agent Loop 后可执行）',
    version        varchar(32)                  null comment '版本号（来自 SKILL.md frontmatter，如 1.0.0）',
    icon           varchar(128)                 null comment '图标（emoji 或 URL）',
    is_public      tinyint(1)  default 0        not null comment '是否公开：0-私有 1-公开',
    status         tinyint     default 1        not null comment '状态：1-启用 0-禁用',
    sort_order     int         default 0        not null comment '排序权重',
    creator        varchar(64)                  null comment '创建人 ID',
    creator_name   varchar(128)                 null comment '创建人名称',
    create_time    datetime                     null comment '创建时间',
    updater        varchar(64)                  null comment '更新人 ID',
    updater_name   varchar(128)                 null comment '更新人名称',
    update_time    datetime                     null comment '更新时间',
    deleted        tinyint     default 0        not null comment '逻辑删除：0-未删除 1-已删除',
    constraint uk_skill_name
        unique (name)
)
    comment 'AI Skill 表（SKILL.md 流程规范，非工具调用）' charset = utf8mb4;

create index idx_category
    on ai_skill (category);

create index idx_source_type
    on ai_skill (source_type);

create index idx_status
    on ai_skill (status);

create table ai_skill_file
(
    id           varchar(64)          not null comment '主键 ID（雪花）'
        primary key,
    skill_id     varchar(64)          not null comment '关联的 Skill ID',
    file_type    varchar(16)          not null comment '文件类型：REFERENCE / SCRIPT / ASSET',
    file_path    varchar(512)         not null comment '相对路径，如 references/connectors/source/mysql-cdc.md',
    file_name    varchar(128)         not null comment '文件名，如 mysql-cdc.md',
    file_ext     varchar(32)          null comment '扩展名，如 .md / .py / .js',
    file_content longtext             not null comment '文件内容（UTF-8 文本）',
    file_size    int                  null comment '文件大小（字节）',
    sort_order   int        default 0 not null comment '同目录内排序',
    creator      varchar(64)          null comment '创建人 ID',
    creator_name varchar(128)         null comment '创建人名称',
    create_time  datetime             null comment '创建时间',
    deleted      tinyint(1) default 0 not null comment '逻辑删除'
)
    comment 'Skill 附件文件表（references/scripts/assets 原始目录结构）' charset = utf8mb4;

create index idx_file_type
    on ai_skill_file (file_type);

create index idx_skill_file_path
    on ai_skill_file (skill_id, file_path(191));

create index idx_skill_id
    on ai_skill_file (skill_id);

create table ai_usage_quota
(
    id            varchar(64)            not null comment '主键 ID（雪花）'
        primary key,
    user_id       varchar(64)            not null comment '用户 ID',
    model_id      varchar(64)            null comment '模型 ID（NULL 表示全局配额）',
    monthly_limit bigint default 1000000 not null comment '月度 Token 配额',
    used_tokens   bigint default 0       not null comment '已用 Token 数',
    month         varchar(7)             not null comment '月份（yyyy-MM）',
    create_time   datetime               null comment '创建时间',
    update_time   datetime               null comment '更新时间',
    constraint uk_user_model_month
        unique (user_id, model_id, month)
)
    comment 'AI 用量配额表' charset = utf8mb4;

create table ai_usage_record
(
    id                varchar(64)                     not null comment '主键 ID（雪花）'
        primary key,
    user_id           varchar(64)                     not null comment '用户 ID',
    user_name         varchar(128)                    null comment '用户名',
    model_id          varchar(64)                     null comment '使用的模型 ID',
    model_name        varchar(128)                    null comment '模型名称',
    session_id        varchar(64)                     null comment '关联会话 ID',
    prompt_tokens     int            default 0        not null comment '输入 Token 数',
    completion_tokens int            default 0        not null comment '输出 Token 数',
    total_tokens      int            default 0        not null comment '总 Token 数',
    estimated_cost    decimal(10, 6) default 0.000000 not null comment '估算费用（美元）',
    create_time       datetime                        null comment '调用时间'
)
    comment 'AI 用量记录表' charset = utf8mb4;

create index idx_create_time
    on ai_usage_record (create_time);

create index idx_model_id
    on ai_usage_record (model_id);

create index idx_user_id
    on ai_usage_record (user_id);

create table api_test
(
    id           bigint auto_increment comment 'id'
        primary key,
    chinese_name varchar(20)  null comment '中文名',
    id_card      varchar(20)  null comment '身份证',
    fixed_phone  varchar(20)  null comment '座机号',
    mobile_phone varchar(20)  null comment '手机号',
    address      varchar(100) null comment '地址',
    email        varchar(50)  null comment '电子邮件',
    password     varchar(20)  null comment '密码',
    bank_card    varchar(50)  null comment '银行卡',
    regex        varchar(50)  null comment '正则替换',
    md5          varchar(100) null comment 'md5',
    sha1         varchar(100) null comment 'sha1',
    sha256       varchar(100) null comment 'sha256',
    sha512       varchar(100) null comment 'sha512',
    des          varchar(100) null comment 'des',
    aes          varchar(100) null comment 'aes',
    constraint un
        unique (id) comment 'aa'
)
    comment 'api测试' row_format = DYNAMIC;

create table api_test1
(
    id           bigint auto_increment comment 'id'
        primary key,
    chinese_name varchar(20)  null comment '中文名',
    id_card      varchar(20)  null comment '身份证',
    fixed_phone  varchar(20)  null comment '座机号',
    mobile_phone varchar(20)  null comment '手机号',
    address      varchar(100) null comment '地址',
    email        varchar(50)  null comment '电子邮件',
    password     varchar(20)  null comment '密码',
    bank_card    varchar(50)  null comment '银行卡',
    regex        varchar(50)  null comment '正则替换',
    md5          varchar(100) null comment 'md5',
    sha1         varchar(100) null comment 'sha1',
    sha256       varchar(100) null comment 'sha256',
    sha512       varchar(100) null comment 'sha512',
    des          varchar(100) null comment 'des',
    aes          varchar(100) null comment 'aes',
    constraint un
        unique (id) comment 'aa'
)
    comment 'api测试1' row_format = DYNAMIC;

create table cluster_management_config
(
    id           bigint auto_increment
        primary key,
    config_key   varchar(128)                       not null comment '配置键',
    config_value text                               null comment '配置值',
    config_type  varchar(32)                        null comment '配置类型：STRING,JSON,NUMBER,BOOLEAN',
    description  varchar(256)                       null comment '配置描述',
    create_time  datetime default CURRENT_TIMESTAMP null comment '创建时间',
    update_time  datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    constraint config_key
        unique (config_key)
)
    comment '集群管理配置表' charset = utf8mb4
                             row_format = DYNAMIC;

create table dag_trigger
(
    id                   bigint auto_increment comment '主键ID'
        primary key,
    dag_definition_id    varchar(64)                  not null comment 'DAG定义ID',
    name                 varchar(100)                 not null comment '触发器名称',
    type                 varchar(20)                  not null comment '触发器类型: CRON(定时), MANUAL(手动)',
    cron_expression      varchar(100)                 null comment 'Cron表达式',
    enabled              tinyint(1)  default 0        null comment '是否启用',
    concurrency_policy   varchar(20) default 'FORBID' null comment '并发策略: FORBID(不允许并发), REPLACE(取消旧的), ALLOW(允许并行)',
    max_parallel         int         default 3        null comment '最大并行执行数',
    dedup_key_expression varchar(200)                 null comment '去重键表达式',
    trigger_context      text                         null comment '触发上下文(JSON格式)',
    next_fire_time       datetime                     null comment '下一次触发时间',
    last_fire_time       datetime                     null comment '上一次触发时间',
    fire_count           bigint      default 0        null comment '触发次数统计',
    owner                varchar(50)                  null comment '触发器所有者',
    description          varchar(500)                 null comment '描述',
    deleted              tinyint                      null comment '删除标识  0：正常   1：已删除',
    creator              bigint                       null comment '创建者',
    create_time          datetime                     null comment '创建时间',
    updater              bigint                       null comment '更新者',
    update_time          datetime                     null comment '更新时间'
)
    comment 'DAG触发器配置表' charset = utf8mb4
                              row_format = DYNAMIC;

create index idx_dag_definition_id
    on dag_trigger (dag_definition_id);

create index idx_enabled_type
    on dag_trigger (enabled, type);

create index idx_next_fire_time
    on dag_trigger (next_fire_time);

create table data_alert_history
(
    id                    bigint auto_increment comment '主键ID'
        primary key,
    alert_id              varchar(64)                           not null comment '告警唯一ID',
    source_module         varchar(50)                           not null comment '来源模块：CONNECTOR/WORKER/LOG/DAG',
    source_id             varchar(100)                          null comment '来源对象ID',
    source_name           varchar(200)                          null comment '来源对象名称',
    alert_type            varchar(100)                          not null comment '告警类型',
    alert_level           varchar(20)                           not null comment '告警级别',
    alert_message         text                                  null comment '告警消息',
    alert_detail          json                                  null comment '告警详情（JSON）',
    context_data          text                                  null comment '上下文数据（JSON）',
    rule_id               bigint                                null comment '触发的规则ID',
    rule_name             varchar(200)                          null comment '规则名称',
    rule_code             varchar(100)                          null comment '规则编码',
    rule_expression       text                                  null comment '规则表达式',
    trigger_time          datetime                              not null comment '触发时间',
    first_trigger_time    datetime                              null comment '首次触发时间（用于聚合）',
    trigger_count         int         default 1                 null comment '触发次数（聚合场景）',
    status                varchar(20) default 'ACTIVE'          null comment '状态：ACTIVE/PROCESSING/RESOLVED/IGNORED',
    resolved              tinyint(1)  default 0                 null comment '是否已解决',
    resolved_time         datetime                              null comment '解决时间',
    resolved_type         varchar(20)                           null comment '解决方式：AUTO/MANUAL',
    resolved_by           varchar(64)                           null comment '解决人ID',
    remark                text                                  null comment '备注',
    notification_status   varchar(20)                           null comment '通知状态：PENDING/SENT/PARTIAL/FAILED/IGNORED',
    notification_channels varchar(200)                          null comment '已发送的通知渠道',
    notification_time     datetime                              null comment '通知时间',
    notification_error    text                                  null comment '通知错误信息',
    create_time           datetime    default CURRENT_TIMESTAMP null comment '创建时间',
    update_time           datetime    default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    constraint alert_id
        unique (alert_id)
)
    comment '告警历史表' charset = utf8mb4
                         row_format = DYNAMIC;

create index idx_alert_type
    on data_alert_history (alert_type);

create index idx_level_status
    on data_alert_history (alert_level, status);

create index idx_module_time
    on data_alert_history (source_module, trigger_time);

create index idx_source
    on data_alert_history (source_id, trigger_time);

create index idx_status
    on data_alert_history (status, trigger_time);

create index idx_trigger_time
    on data_alert_history (trigger_time);

create table data_alert_metric_definition
(
    id            bigint auto_increment comment '指标ID'
        primary key,
    source_module varchar(50)                          not null comment '所属模块',
    metric_name   varchar(100)                         not null comment '指标变量名（英文）',
    display_name  varchar(200)                         not null comment '指标显示名（中文）',
    metric_type   varchar(20)                          not null comment '数据类型：INTEGER/LONG/DOUBLE/STRING/BOOLEAN',
    unit          varchar(20)                          null comment '单位',
    description   text                                 null comment '指标描述',
    operators     varchar(200)                         null comment '可用操作符（逗号分隔）',
    example_value varchar(100)                         null comment '示例值',
    enabled       tinyint(1) default 1                 null comment '是否启用',
    sort_order    int        default 999               null comment '排序',
    create_time   datetime   default CURRENT_TIMESTAMP null comment '创建时间',
    update_time   datetime   default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    constraint uk_module_metric
        unique (source_module, metric_name)
)
    comment '告警指标定义表' charset = utf8mb4
                             row_format = DYNAMIC;

create index idx_module
    on data_alert_metric_definition (source_module, enabled);

create table data_alert_notification_log
(
    id                   bigint auto_increment comment '日志ID'
        primary key,
    alert_id             varchar(64)                        not null comment '告警ID',
    alert_history_id     bigint                             null comment '告警历史记录ID',
    connector_id         varchar(64)                        not null comment '连接器ID',
    connector_type       varchar(50)                        null comment '连接器类型',
    receiver             varchar(200)                       null comment '接收人',
    send_time            datetime                           not null comment '发送时间',
    status               varchar(20)                        not null comment '发送状态：SUCCESS/FAILED',
    error_message        text                               null comment '错误信息',
    retry_count          int      default 0                 null comment '重试次数',
    response_time        int                                null comment '响应时间（毫秒）',
    notification_content text                               null comment '通知内容',
    create_time          datetime default CURRENT_TIMESTAMP null comment '创建时间'
)
    comment '告警通知日志表' charset = utf8mb4
                             row_format = DYNAMIC;

create index idx_alert
    on data_alert_notification_log (alert_id, send_time);

create index idx_connector
    on data_alert_notification_log (connector_id, send_time);

create index idx_send_time
    on data_alert_notification_log (send_time);

create index idx_status
    on data_alert_notification_log (status, send_time);

create table data_alert_policy
(
    id          bigint auto_increment comment '策略ID'
        primary key,
    policy_name varchar(100)                         not null comment '策略名称',
    policy_type varchar(50)                          not null comment '策略类型：SILENCE/GROUP/SUPPRESS/ESCALATE/TIME_WINDOW/CONVERGE',
    enabled     tinyint(1) default 1                 null comment '是否启用',
    priority    int        default 100               null comment '优先级（越小越优先）',
    scope       varchar(50)                          null comment '作用范围：GLOBAL/MODULE/LEVEL/TYPE',
    scope_value varchar(200)                         null comment '范围值',
    config      json                                 null comment '策略配置',
    description text                                 null comment '策略描述',
    create_time datetime   default CURRENT_TIMESTAMP null comment '创建时间',
    update_time datetime   default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间'
)
    comment '告警策略表' charset = utf8mb4
                         row_format = DYNAMIC;

create index idx_enabled_priority
    on data_alert_policy (enabled, priority);

create index idx_type
    on data_alert_policy (policy_type);

create table data_alert_rule
(
    id                      bigint auto_increment comment '规则ID'
        primary key,
    rule_name               varchar(200)                          not null comment '规则名称',
    rule_code               varchar(100)                          not null comment '规则编码（唯一标识）',
    source_module           varchar(50)                           not null comment '所属模块：CONNECTOR/WORKER/LOG/DAG',
    alert_type              varchar(100)                          not null comment '告警类型',
    alert_level             varchar(20)                           not null comment '告警级别：CRITICAL/ERROR/WARNING/INFO',
    rule_expression         text                                  not null comment '规则表达式',
    expression_type         varchar(50)                           null comment '表达式类型：SIMPLE/COMPOSITE/TIME_WINDOW',
    time_window             int                                   null comment '时间窗口（秒）',
    silence_period          int         default 300               null comment '静默期（秒）',
    enabled                 tinyint(1)  default 1                 null comment '是否启用',
    notification_connectors text                                  null comment '通知连接器ID列表（JSON数组）',
    receivers               text                                  null comment '接收人列表（JSON数组）',
    scope                   varchar(50) default 'GLOBAL'          null comment '作用范围：GLOBAL/SPECIFIC',
    scope_value             varchar(200)                          null comment '作用范围值',
    description             text                                  null comment '规则描述',
    ext_config              json                                  null comment '扩展配置',
    create_time             datetime    default CURRENT_TIMESTAMP null comment '创建时间',
    update_time             datetime    default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    creator                 varchar(64)                           null comment '创建人ID',
    creator_name            varchar(100)                          null comment '创建人姓名',
    updater                 varchar(64)                           null comment '更新人ID',
    updater_name            varchar(100)                          null comment '更新人姓名',
    constraint rule_code
        unique (rule_code)
)
    comment '告警规则表' charset = utf8mb4
                         row_format = DYNAMIC;

create index idx_alert_type
    on data_alert_rule (alert_type);

create index idx_module_enabled
    on data_alert_rule (source_module, enabled);

create index idx_scope
    on data_alert_rule (scope, scope_value);

create table data_alert_statistics
(
    id                        bigint auto_increment comment '统计ID'
        primary key,
    stat_date                 date                               not null comment '统计日期',
    stat_hour                 int                                null comment '统计小时（0-23）',
    source_module             varchar(50)                        null comment '模块',
    alert_level               varchar(20)                        null comment '告警级别',
    alert_type                varchar(100)                       null comment '告警类型',
    total_count               int      default 0                 null comment '总告警数',
    resolved_count            int      default 0                 null comment '已解决数',
    active_count              int      default 0                 null comment '活跃告警数',
    avg_resolve_time          bigint                             null comment '平均解决时间（毫秒）',
    notification_success_rate decimal(5, 2)                      null comment '通知成功率',
    create_time               datetime default CURRENT_TIMESTAMP null comment '创建时间',
    constraint uk_stat
        unique (stat_date, stat_hour, source_module, alert_level, alert_type)
)
    comment '告警统计表' charset = utf8mb4
                         row_format = DYNAMIC;

create index idx_date_module
    on data_alert_statistics (stat_date, source_module);

create table data_alert_subscription
(
    id                      bigint auto_increment comment '订阅ID'
        primary key,
    user_id                 varchar(64)                          not null comment '用户ID',
    user_name               varchar(100)                         null comment '用户名称',
    subscribe_type          varchar(50)                          not null comment '订阅类型：MODULE/LEVEL/TYPE/OBJECT',
    subscribe_config        json                                 null comment '订阅配置',
    notification_connectors text                                 null comment '通知连接器ID列表',
    notification_time_range varchar(100)                         null comment '通知时间段：ALL/WORK_HOURS',
    enabled                 tinyint(1) default 1                 null comment '是否启用',
    description             text                                 null comment '订阅描述',
    create_time             datetime   default CURRENT_TIMESTAMP null comment '创建时间',
    update_time             datetime   default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间'
)
    comment '告警订阅表' charset = utf8mb4
                         row_format = DYNAMIC;

create index idx_type
    on data_alert_subscription (subscribe_type);

create index idx_user
    on data_alert_subscription (user_id, enabled);

create table data_crawler_account
(
    id                varchar(64)                           not null comment '主键ID'
        primary key,
    name              varchar(200)                          not null comment '账号名称/标识',
    platform          varchar(100)                          not null comment '所属平台/网站',
    username          varchar(200)                          not null comment '登录用户名',
    password          varchar(500)                          null comment '登录密码(加密存储)',
    cookies           longtext                              null comment 'Cookie信息',
    token             varchar(1000)                         null comment 'Token信息',
    status            varchar(20) default 'ACTIVE'          null comment '账号状态: ACTIVE(可用), INACTIVE(不可用), COOLING(冷却中), BANNED(已封禁)',
    login_status      varchar(20)                           null comment '登录状态: LOGGED_IN(已登录), LOGGED_OUT(未登录), LOGIN_FAILED(登录失败)',
    account_level     varchar(50)                           null comment '账号等级/会员类型',
    use_count         bigint      default 0                 null comment '使用次数',
    success_count     bigint      default 0                 null comment '成功次数',
    failure_count     bigint      default 0                 null comment '失败次数',
    last_login_time   datetime                              null comment '最后登录时间',
    last_use_time     datetime                              null comment '最后使用时间',
    token_expire_time datetime                              null comment 'Token过期时间',
    priority          int         default 50                null comment '优先级(数值越大优先级越高)',
    remark            varchar(1000)                         null comment '备注',
    creator           varchar(64)                           null comment '创建者',
    creator_name      varchar(128)                          null comment '创建者名称',
    create_time       datetime    default CURRENT_TIMESTAMP not null comment '创建时间',
    updater           varchar(64)                           null comment '更新者',
    updater_name      varchar(128)                          null comment '更新者名称',
    update_time       datetime    default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted           tinyint(1)  default 0                 null comment '逻辑删除标识(0-未删除, 1-已删除)'
)
    comment '爬虫账号池表' collate = utf8mb4_unicode_ci
                           row_format = DYNAMIC;

create index idx_create_time
    on data_crawler_account (create_time);

create index idx_deleted
    on data_crawler_account (deleted);

create index idx_platform
    on data_crawler_account (platform);

create index idx_priority
    on data_crawler_account (priority);

create index idx_status
    on data_crawler_account (status);

create table data_crawler_config
(
    id           varchar(64)                           not null comment '配置ID'
        primary key,
    config_key   varchar(100)                          not null comment '配置键',
    config_value varchar(1000)                         null comment '配置值',
    extend1      varchar(500)                          null comment '扩展字段1',
    extend2      varchar(500)                          null comment '扩展字段2',
    extend3      varchar(500)                          null comment '扩展字段3',
    description  varchar(1000)                         null comment '配置说明',
    status       varchar(20) default 'ACTIVE'          null comment '配置状态: ACTIVE(启用), INACTIVE(禁用)',
    creator      varchar(64)                           null comment '创建者',
    creator_name varchar(128)                          null comment '创建者名称',
    create_time  datetime    default CURRENT_TIMESTAMP not null comment '创建时间',
    updater      varchar(64)                           null comment '更新者',
    updater_name varchar(128)                          null comment '更新者名称',
    update_time  datetime    default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted      tinyint(1)  default 0                 null comment '逻辑删除标识(0-未删除, 1-已删除)',
    constraint uk_config_key
        unique (config_key, deleted)
)
    comment '爬虫配置表' collate = utf8mb4_unicode_ci
                         row_format = DYNAMIC;

create index idx_create_time
    on data_crawler_config (create_time);

create index idx_deleted
    on data_crawler_config (deleted);

create index idx_status
    on data_crawler_config (status);

create table data_crawler_execution_history
(
    id                  varchar(64)                           not null comment '主键ID'
        primary key,
    task_id             varchar(64)                           not null comment '爬虫任务ID',
    task_name           varchar(200)                          null comment '任务名称',
    dag_execution_id    varchar(64)                           null comment 'DAG执行ID(关联DAG执行记录)',
    status              varchar(20) default 'INIT'            not null comment '执行状态: INIT(初始化), RUNNING(运行中), SUCCESS(成功), FAILED(失败), CANCELLED(取消)',
    start_time          datetime                              null comment '开始时间',
    end_time            datetime                              null comment '结束时间',
    duration            bigint                                null comment '执行耗时(毫秒)',
    url_count           int         default 0                 null comment '爬取的URL数量',
    success_url_count   int         default 0                 null comment '成功爬取的URL数量',
    failed_url_count    int         default 0                 null comment '失败的URL数量',
    record_count        bigint      default 0                 null comment '提取的数据记录数',
    stored_record_count bigint      default 0                 null comment '存储的数据记录数',
    progress            int         default 0                 null comment '执行进度(0-100)',
    error_message       text                                  null comment '错误信息',
    error_stack         longtext                              null comment '错误堆栈',
    trigger_type        varchar(20) default 'MANUAL'          null comment '触发方式: MANUAL(手动), SCHEDULED(定时), API(接口)',
    trigger_user        varchar(64)                           null comment '触发人',
    create_time         datetime    default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time         datetime    default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间'
)
    comment '爬虫执行历史表' collate = utf8mb4_unicode_ci
                             row_format = DYNAMIC;

create index idx_create_time
    on data_crawler_execution_history (create_time);

create index idx_dag_execution_id
    on data_crawler_execution_history (dag_execution_id);

create index idx_start_time
    on data_crawler_execution_history (start_time);

create index idx_status
    on data_crawler_execution_history (status);

create index idx_task_id
    on data_crawler_execution_history (task_id);

create table data_crawler_proxy
(
    id                varchar(64)                           not null comment '主键ID'
        primary key,
    name              varchar(200)                          not null comment '代理名称',
    host              varchar(200)                          not null comment '代理服务器地址',
    port              int                                   not null comment '代理服务器端口',
    proxy_type        varchar(20) default 'HTTP'            null comment '代理类型: HTTP, HTTPS, SOCKS4, SOCKS5',
    username          varchar(200)                          null comment '用户名(如需认证)',
    password          varchar(500)                          null comment '密码(如需认证)',
    status            varchar(20) default 'ACTIVE'          null comment '代理状态: ACTIVE(可用), INACTIVE(不可用), TESTING(检测中)',
    region            varchar(100)                          null comment '地区/国家',
    provider          varchar(200)                          null comment '供应商',
    response_time     int                                   null comment '响应时间(毫秒)',
    success_count     bigint      default 0                 null comment '成功次数',
    failure_count     bigint      default 0                 null comment '失败次数',
    last_success_time datetime                              null comment '最后成功时间',
    last_failure_time datetime                              null comment '最后失败时间',
    last_check_time   datetime                              null comment '最后检测时间',
    priority          int         default 50                null comment '优先级(数值越大优先级越高)',
    remark            varchar(1000)                         null comment '备注',
    creator           varchar(64)                           null comment '创建者',
    creator_name      varchar(128)                          null comment '创建者名称',
    create_time       datetime    default CURRENT_TIMESTAMP not null comment '创建时间',
    updater           varchar(64)                           null comment '更新者',
    updater_name      varchar(128)                          null comment '更新者名称',
    update_time       datetime    default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted           tinyint(1)  default 0                 null comment '逻辑删除标识(0-未删除, 1-已删除)'
)
    comment '爬虫代理IP表' collate = utf8mb4_unicode_ci
                           row_format = DYNAMIC;

create index idx_create_time
    on data_crawler_proxy (create_time);

create index idx_deleted
    on data_crawler_proxy (deleted);

create index idx_host_port
    on data_crawler_proxy (host, port);

create index idx_priority
    on data_crawler_proxy (priority);

create index idx_region
    on data_crawler_proxy (region);

create index idx_status
    on data_crawler_proxy (status);

create table data_crawler_robots_cache
(
    id             varchar(64)                                 not null comment '主键ID'
        primary key,
    domain         varchar(200)                                not null comment '域名',
    robots_content longtext                                    null comment 'robots.txt内容',
    allowed        tinyint(1)   default 1                      null comment '是否允许爬取',
    crawl_delay    bigint       default 0                      null comment '爬取延迟(毫秒)',
    user_agent     varchar(200) default 'BigPrime-Crawler/1.0' null comment 'User-Agent',
    robots_url     varchar(500)                                null comment 'robots.txt URL',
    status_code    int                                         null comment 'HTTP状态码',
    cache_time     datetime                                    null comment '缓存时间',
    expire_time    datetime                                    null comment '过期时间',
    create_time    datetime     default CURRENT_TIMESTAMP      not null comment '创建时间',
    update_time    datetime     default CURRENT_TIMESTAMP      not null on update CURRENT_TIMESTAMP comment '更新时间',
    constraint uk_domain_ua
        unique (domain, user_agent)
)
    comment 'Robots协议缓存表' collate = utf8mb4_unicode_ci
                               row_format = DYNAMIC;

create index idx_cache_time
    on data_crawler_robots_cache (cache_time);

create index idx_domain
    on data_crawler_robots_cache (domain);

create index idx_expire_time
    on data_crawler_robots_cache (expire_time);

create table data_crawler_task
(
    id                      varchar(64)                           not null comment '主键ID'
        primary key,
    name                    varchar(200)                          not null comment '任务名称',
    description             varchar(500)                          null comment '任务描述',
    task_type               varchar(20) default 'SINGLE'          null comment '任务类型: SINGLE(单次), SCHEDULED(定时), MANUAL(手动)',
    template_id             varchar(64)                           null comment '模板ID(如果基于模板创建)',
    template_name           varchar(200)                          null comment '模板名称',
    dag_config              longtext                              null comment 'DAG配置(JSON格式)',
    target_url              varchar(500)                          null comment '目标URL或URL模式',
    website_url             varchar(1000)                         null comment '目标网站 URL（AI Agent 爬虫使用）',
    login_username          varchar(255)                          null comment '登录用户名（可选）',
    login_password          varchar(1000)                         null comment '登录密码（AES-256 加密存储）',
    instructions            text                                  null comment '自然语言爬取指令',
    assistant_id            varchar(64)                           null comment '绑定的 AI 助手 ID',
    playwright_connector_id varchar(64)                           null comment '绑定的 Playwright Connector ID',
    model_id                varchar(64)                           null comment '使用的 AI 模型 ID（关联 ai_model 表）',
    task_mode               varchar(32)                           null comment '任务模式: DAG（旧）/ AGENT（AI Agent）',
    cron_expression         varchar(100)                          null comment '调度表达式(Cron格式)',
    status                  varchar(20) default 'DRAFT'           null comment '任务状态: DRAFT(草稿), READY(就绪), RUNNING(运行中), PAUSED(暂停), STOPPED(停止)',
    enabled                 tinyint(1)  default 0                 null comment '是否启用',
    retry_count             int         default 3                 null comment '重试次数',
    timeout                 int         default 300               null comment '超时时间(秒)',
    concurrency             int         default 1                 null comment '并发数',
    total_executions        bigint      default 0                 null comment '总执行次数',
    success_executions      bigint      default 0                 null comment '成功执行次数',
    failed_executions       bigint      default 0                 null comment '失败执行次数',
    last_execution_time     datetime                              null comment '最后执行时间',
    next_execution_time     datetime                              null comment '下次执行时间',
    creator                 varchar(64)                           null comment '创建者',
    creator_name            varchar(128)                          null comment '创建者名称',
    create_time             datetime    default CURRENT_TIMESTAMP not null comment '创建时间',
    updater                 varchar(64)                           null comment '更新者',
    updater_name            varchar(128)                          null comment '更新者名称',
    update_time             datetime    default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted                 tinyint(1)  default 0                 null comment '逻辑删除标识(0-未删除, 1-已删除)'
)
    comment '爬虫任务表' collate = utf8mb4_unicode_ci
                         row_format = DYNAMIC;

create index idx_create_time
    on data_crawler_task (create_time);

create index idx_deleted
    on data_crawler_task (deleted);

create index idx_enabled
    on data_crawler_task (enabled);

create index idx_name
    on data_crawler_task (name);

create index idx_next_execution_time
    on data_crawler_task (next_execution_time);

create index idx_status
    on data_crawler_task (status);

create index idx_template_id
    on data_crawler_task (template_id);

create table data_crawler_template
(
    id             varchar(64)                             not null comment '主键ID'
        primary key,
    template_code  varchar(100)                            not null comment '模板编码(唯一标识)',
    template_name  varchar(200)                            not null comment '模板名称',
    category       varchar(50)                             not null comment '模板分类: NEWS(新闻), ECOMMERCE(电商), JOB(招聘), BLOG(博客), WEATHER(天气), STOCK(股票), SOCIAL(社交), API(接口)',
    description    varchar(1000)                           null comment '模板描述',
    difficulty     varchar(20)   default 'EASY'            null comment '难度等级: EASY(简单), MEDIUM(中等), HARD(困难)',
    dag_config     longtext                                not null comment 'DAG配置(JSON格式,包含节点、连线、参数配置)',
    default_params text                                    null comment '默认参数配置(JSON格式)',
    icon           varchar(500)                            null comment '模板图标URL',
    tags           varchar(500)                            null comment '标签(逗号分隔)',
    use_count      int           default 0                 null comment '使用次数',
    rating         decimal(3, 2) default 0.00              null comment '评分(0-5)',
    is_preset      tinyint(1)    default 0                 null comment '是否预置模板(0-否, 1-是)',
    status         varchar(20)   default 'ACTIVE'          null comment '模板状态: ACTIVE(启用), INACTIVE(禁用)',
    creator        varchar(64)                             null comment '创建者',
    creator_name   varchar(128)                            null comment '创建者名称',
    create_time    datetime      default CURRENT_TIMESTAMP not null comment '创建时间',
    updater        varchar(64)                             null comment '更新者',
    updater_name   varchar(128)                            null comment '更新者名称',
    update_time    datetime      default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted        tinyint(1)    default 0                 null comment '逻辑删除标识(0-未删除, 1-已删除)',
    constraint uk_template_code
        unique (template_code, deleted)
)
    comment '爬虫模板表' collate = utf8mb4_unicode_ci
                         row_format = DYNAMIC;

create index idx_category
    on data_crawler_template (category);

create index idx_create_time
    on data_crawler_template (create_time);

create index idx_deleted
    on data_crawler_template (deleted);

create index idx_difficulty
    on data_crawler_template (difficulty);

create index idx_status
    on data_crawler_template (status);

create table data_lineage
(
    id                  varchar(64)                   not null comment '主键ID'
        primary key,
    name                varchar(500)                  null comment '血缘关系名称',
    source_type         varchar(50)                   null comment '源端类型（MySQL/PostgreSQL/Kafka/File等）',
    source_connector_id varchar(64)                   null comment '源端连接器ID',
    source_database     varchar(200)                  null comment '源端数据库名',
    source_table        varchar(200)                  null comment '源端表名/Topic名/文件路径',
    source_fields       text                          null comment '源端字段列表（JSON格式）',
    target_type         varchar(50)                   null comment '目标端类型',
    target_connector_id varchar(64)                   null comment '目标端连接器ID',
    target_database     varchar(200)                  null comment '目标端数据库名',
    target_table        varchar(200)                  null comment '目标端表名/Topic名/文件路径',
    target_fields       text                          null comment '目标端字段列表（JSON格式）',
    field_mapping       text                          null comment '字段映射关系（JSON格式）',
    transform_logic     text                          null comment '数据转换逻辑（JSON格式）',
    dag_execution_id    varchar(64)                   null comment '关联的DAG执行ID',
    dag_definition_id   varchar(64)                   null comment '关联的DAG定义ID',
    node_id             varchar(100)                  null comment '关联的节点ID',
    node_name           varchar(200)                  null comment '节点名称',
    record_count        bigint      default 0         null comment '处理的记录数',
    quality_score       int                           null comment '数据质量得分（0-100）',
    status              varchar(20) default 'RUNNING' null comment '执行状态（SUCCESS/FAILED/RUNNING）',
    start_time          datetime                      null comment '开始时间',
    end_time            datetime                      null comment '结束时间',
    duration_ms         bigint                        null comment '执行耗时（毫秒）',
    error_message       text                          null comment '错误信息',
    lineage_level       int         default 0         null comment '血缘层级（0表示原始数据源）',
    parent_lineage_id   varchar(64)                   null comment '父血缘ID',
    remark              text                          null comment '备注',
    deleted             tinyint                       null comment '删除标识  0：正常   1：已删除',
    creator             bigint                        null comment '创建者',
    create_time         datetime                      null comment '创建时间',
    updater             bigint                        null comment '更新者',
    update_time         datetime                      null comment '更新时间'
)
    comment '数据血缘关系表' collate = utf8mb4_unicode_ci
                             row_format = DYNAMIC;

create index idx_dag_definition
    on data_lineage (dag_definition_id);

create index idx_dag_execution
    on data_lineage (dag_execution_id);

create index idx_lineage_level
    on data_lineage (lineage_level);

create index idx_parent_lineage
    on data_lineage (parent_lineage_id);

create index idx_source
    on data_lineage (source_type, source_database, source_table);

create index idx_start_time
    on data_lineage (start_time);

create index idx_status
    on data_lineage (status);

create index idx_target
    on data_lineage (target_type, target_database, target_table);

create table data_lineage_column
(
    id               varchar(64)                           not null comment '主键ID'
        primary key,
    table_id         varchar(64)                           not null comment '表ID',
    column_name      varchar(200)                          not null comment '字段名称',
    column_type      varchar(100)                          null comment '字段类型',
    column_length    int                                   null comment '字段长度',
    column_scale     int                                   null comment '字段精度(小数位数)',
    nullable         tinyint(1)  default 1                 null comment '是否可空',
    primary_key      tinyint(1)  default 0                 null comment '是否主键',
    default_value    varchar(500)                          null comment '默认值',
    column_comment   varchar(500)                          null comment '字段注释',
    ordinal_position int                                   null comment '字段位置',
    status           varchar(20) default 'ACTIVE'          null comment '状态(ACTIVE/INACTIVE/DELETED)',
    creator          varchar(64)                           null comment '创建者',
    creator_name     varchar(100)                          null comment '创建者名称',
    create_time      datetime    default CURRENT_TIMESTAMP null comment '创建时间',
    updater          varchar(64)                           null comment '更新者',
    updater_name     varchar(100)                          null comment '更新者名称',
    last_update_time datetime    default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '最后更新时间'
)
    comment '血缘字段节点表' charset = utf8mb4
                             row_format = DYNAMIC;

create index idx_column_name
    on data_lineage_column (column_name);

create index idx_status
    on data_lineage_column (status);

create index idx_table_id
    on data_lineage_column (table_id);

create table data_lineage_datasource
(
    id               varchar(64)                           not null comment '主键ID'
        primary key,
    name             varchar(200)                          not null comment '数据源名称',
    type             varchar(50)                           not null comment '数据源类型(MySQL/Oracle/PostgreSQL/Hive/StarRocks/Neo4j等)',
    connector_id     varchar(64)                           null comment '连接器ID(关联connector表)',
    description      varchar(500)                          null comment '数据源描述',
    config           text                                  null comment '数据源配置(JSON)',
    status           varchar(20) default 'ACTIVE'          null comment '状态(ACTIVE/INACTIVE/DELETED)',
    creator          varchar(64)                           null comment '创建者',
    creator_name     varchar(100)                          null comment '创建者名称',
    create_time      datetime    default CURRENT_TIMESTAMP null comment '创建时间',
    updater          varchar(64)                           null comment '更新者',
    updater_name     varchar(100)                          null comment '更新者名称',
    last_update_time datetime    default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '最后更新时间'
)
    comment '血缘数据源节点表' charset = utf8mb4
                               row_format = DYNAMIC;

create index idx_connector_id
    on data_lineage_datasource (connector_id);

create index idx_status
    on data_lineage_datasource (status);

create index idx_type
    on data_lineage_datasource (type);

create table data_lineage_relation
(
    id               varchar(64)                           not null comment '主键ID'
        primary key,
    source_id        varchar(64)                           not null comment '源节点ID(表ID或字段ID)',
    source_type      varchar(20)                           not null comment '源节点类型(DATASOURCE/TABLE/COLUMN)',
    target_id        varchar(64)                           not null comment '目标节点ID(表ID或字段ID)',
    target_type      varchar(20)                           not null comment '目标节点类型(DATASOURCE/TABLE/COLUMN)',
    lineage_type     varchar(20)                           not null comment '血缘类型(READ/WRITE/TRANSFORM)',
    transform_rule   text                                  null comment '转换规则(JSON,记录字段转换逻辑)',
    dag_execution_id varchar(64)                           null comment '关联的DAG任务ID',
    `sql`            text                                  null comment '关联的SQL语句',
    source_from      varchar(50)                           null comment '血缘来源(SQL_PARSE/MANUAL/SEATUNNEL/FLINK/DAG)',
    audit_status     varchar(20) default 'APPROVED'        null comment '审核状态(PENDING/APPROVED/REJECTED)',
    confidence       int         default 100               null comment '置信度(0-100,自动采集的血缘可能需要确认)',
    remark           varchar(500)                          null comment '备注',
    status           varchar(20) default 'ACTIVE'          null comment '状态(ACTIVE/INACTIVE/DELETED)',
    creator          varchar(64)                           null comment '创建者',
    creator_name     varchar(100)                          null comment '创建者名称',
    create_time      datetime    default CURRENT_TIMESTAMP null comment '创建时间',
    updater          varchar(64)                           null comment '更新者',
    updater_name     varchar(100)                          null comment '更新者名称',
    last_update_time datetime    default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '最后更新时间'
)
    comment '血缘关系表' charset = utf8mb4
                         row_format = DYNAMIC;

create index idx_dag_execution_id
    on data_lineage_relation (dag_execution_id);

create index idx_lineage_type
    on data_lineage_relation (lineage_type);

create index idx_source
    on data_lineage_relation (source_id, source_type);

create index idx_source_from
    on data_lineage_relation (source_from);

create index idx_status
    on data_lineage_relation (status);

create index idx_target
    on data_lineage_relation (target_id, target_type);

create table data_lineage_storage_config
(
    id               varchar(64)                           not null comment '主键ID'
        primary key,
    name             varchar(200)                          not null comment '配置名称',
    storage_type     varchar(50)                           not null comment '存储类型(NEO4J/MYSQL/JANUSGRAPH)',
    connector_id     varchar(64)                           not null comment '连接器ID(关联connector表)',
    enabled          tinyint(1)  default 1                 null comment '是否启用',
    is_default       tinyint(1)  default 0                 null comment '是否为默认存储',
    description      varchar(500)                          null comment '描述',
    ext_config       text                                  null comment '扩展配置(JSON)',
    status           varchar(20) default 'ACTIVE'          null comment '状态(ACTIVE/INACTIVE/DELETED)',
    creator          varchar(64)                           null comment '创建者',
    creator_name     varchar(100)                          null comment '创建者名称',
    create_time      datetime    default CURRENT_TIMESTAMP null comment '创建时间',
    updater          varchar(64)                           null comment '更新者',
    updater_name     varchar(100)                          null comment '更新者名称',
    last_update_time datetime    default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '最后更新时间'
)
    comment '血缘存储配置表' charset = utf8mb4
                             row_format = DYNAMIC;

create index idx_connector_id
    on data_lineage_storage_config (connector_id);

create index idx_is_default
    on data_lineage_storage_config (is_default);

create index idx_status
    on data_lineage_storage_config (status);

create index idx_storage_type
    on data_lineage_storage_config (storage_type);

create table data_lineage_table
(
    id               varchar(64)                           not null comment '主键ID'
        primary key,
    datasource_id    varchar(64)                           not null comment '数据源ID',
    database_name    varchar(200)                          null comment '数据库名称',
    schema_name      varchar(200)                          null comment 'Schema名称(PostgreSQL/Oracle等使用)',
    table_name       varchar(200)                          not null comment '表名',
    table_type       varchar(50) default 'TABLE'           null comment '表类型(TABLE/VIEW/MATERIALIZED_VIEW等)',
    table_comment    varchar(500)                          null comment '表注释/描述',
    partition_keys   varchar(500)                          null comment '分区字段(如果是分区表)',
    metadata         text                                  null comment '表元数据(JSON,包含字段列表、索引等)',
    status           varchar(20) default 'ACTIVE'          null comment '状态(ACTIVE/INACTIVE/DELETED)',
    creator          varchar(64)                           null comment '创建者',
    creator_name     varchar(100)                          null comment '创建者名称',
    create_time      datetime    default CURRENT_TIMESTAMP null comment '创建时间',
    updater          varchar(64)                           null comment '更新者',
    updater_name     varchar(100)                          null comment '更新者名称',
    last_update_time datetime    default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '最后更新时间'
)
    comment '血缘表节点表' charset = utf8mb4
                           row_format = DYNAMIC;

create index idx_database_table
    on data_lineage_table (database_name, table_name);

create index idx_datasource_id
    on data_lineage_table (datasource_id);

create index idx_status
    on data_lineage_table (status);

create index idx_table_name
    on data_lineage_table (table_name);

create table data_log_alert_history
(
    id                  bigint auto_increment comment '主键ID'
        primary key,
    rule_id             bigint                             not null comment '规则ID',
    rule_name           varchar(100)                       not null comment '规则名称',
    alert_time          datetime                           not null comment '告警时间',
    alert_content       text                               not null comment '告警内容',
    trigger_value       decimal(10, 2)                     null comment '触发值',
    notification_status varchar(20)                        not null comment '通知状态: SUCCESS/FAILED',
    create_time         datetime default CURRENT_TIMESTAMP not null comment '创建时间'
)
    comment '告警历史表' charset = utf8mb4
                         row_format = DYNAMIC;

create index idx_alert_time
    on data_log_alert_history (alert_time);

create index idx_rule_id
    on data_log_alert_history (rule_id);

create table data_log_alert_rule
(
    id                    bigint auto_increment comment '主键ID'
        primary key,
    rule_name             varchar(100)                         not null comment '规则名称',
    rule_type             varchar(50)                          not null comment '规则类型: EXCEPTION_COUNT/ERROR_RATE/NEW_EXCEPTION',
    service_name          varchar(100)                         null comment '监控服务(空表示全部)',
    threshold_value       decimal(10, 2)                       not null comment '阈值',
    time_window           int                                  not null comment '时间窗口(分钟)',
    silence_period        int        default 30                not null comment '静默期(分钟)',
    notification_channels text                                 null comment '通知渠道配置(JSON)',
    enabled               tinyint(1) default 1                 not null comment '是否启用',
    create_time           datetime   default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time           datetime   default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间'
)
    comment '告警规则表' charset = utf8mb4
                         row_format = DYNAMIC;

create index idx_enabled
    on data_log_alert_rule (enabled);

create index idx_service
    on data_log_alert_rule (service_name);

create table data_log_config
(
    id           bigint auto_increment comment '主键ID'
        primary key,
    config_key   varchar(100)                          not null comment '配置键',
    config_value text                                  null comment '配置值',
    value_type   varchar(20) default 'STRING'          not null comment '值类型: STRING/INT/BOOLEAN/JSON',
    description  varchar(500)                          null comment '配置说明',
    create_time  datetime    default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time  datetime    default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    constraint uk_config_key
        unique (config_key)
)
    comment '日志管理系统配置表' charset = utf8mb4
                                 row_format = DYNAMIC;

create table data_log_exception_detail
(
    id          bigint auto_increment comment '主键ID'
        primary key,
    group_id    bigint                               null comment '关联分组ID',
    fingerprint varchar(64)                          not null comment '堆栈指纹(用于聚合)',
    log_time    datetime                             not null comment '日志时间',
    trace_id    varchar(100)                         null comment 'SkyWalking TraceID',
    stack_trace text                                 null comment '堆栈信息',
    raw_log     text                                 null comment '原始日志',
    aggregated  tinyint(1) default 0                 not null comment '是否已聚合',
    create_time datetime   default CURRENT_TIMESTAMP not null comment '创建时间'
)
    comment '异常详情表' charset = utf8mb4
                         row_format = DYNAMIC;

create index idx_aggregated
    on data_log_exception_detail (aggregated);

create index idx_fingerprint
    on data_log_exception_detail (fingerprint);

create index idx_group_id
    on data_log_exception_detail (group_id);

create index idx_log_time
    on data_log_exception_detail (log_time);

create index idx_trace_id
    on data_log_exception_detail (trace_id);

create table data_log_exception_group
(
    id                bigint auto_increment comment '主键ID'
        primary key,
    fingerprint       varchar(64)                           not null comment '堆栈指纹(MD5)',
    exception_type    varchar(255)                          not null comment '异常类型',
    exception_message text                                  null comment '异常消息',
    stack_trace       text                                  null comment '堆栈信息',
    service_name      varchar(100)                          not null comment '服务名称',
    first_time        datetime                              not null comment '首次发生时间',
    last_time         datetime                              not null comment '最后发生时间',
    occur_count       int         default 1                 not null comment '发生次数',
    status            varchar(20) default 'NEW'             not null comment '状态: NEW/FIXED/IGNORED/REOPENED',
    create_time       datetime    default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time       datetime    default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    constraint uk_fingerprint
        unique (fingerprint)
)
    comment '异常分组表' charset = utf8mb4
                         row_format = DYNAMIC;

create index idx_last_time
    on data_log_exception_group (last_time);

create index idx_service_status
    on data_log_exception_group (service_name, status);

create table data_log_mask_rule
(
    id            bigint auto_increment comment '主键ID'
        primary key,
    rule_name     varchar(100)                         not null comment '规则名称',
    rule_type     varchar(50)                          not null comment '规则类型: REGEX/FIELD/KEYWORD',
    match_pattern varchar(500)                         not null comment '匹配模式（正则表达式或字段名）',
    replace_type  varchar(50)                          not null comment '替换方式: MASK/REPLACE/REMOVE',
    replace_value varchar(500)                         null comment '替换值（如果是REPLACE类型）',
    enabled       tinyint(1) default 1                 not null comment '是否启用',
    sort_order    int        default 999               not null comment '规则顺序',
    description   varchar(500)                         null comment '规则说明',
    create_time   datetime   default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time   datetime   default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间'
)
    comment '日志脱敏规则表' charset = utf8mb4
                             row_format = DYNAMIC;

create index idx_enabled
    on data_log_mask_rule (enabled);

create index idx_sort_order
    on data_log_mask_rule (sort_order);

create table data_log_parse_rule
(
    id            bigint auto_increment comment '主键ID'
        primary key,
    rule_name     varchar(100)                         not null comment '规则名称',
    log_format    varchar(50)                          not null comment '日志格式: JSON/TEXT/CUSTOM',
    field_mapping text                                 not null comment '字段映射配置(JSON格式)',
    enabled       tinyint(1) default 1                 not null comment '是否启用',
    create_time   datetime   default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time   datetime   default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间'
)
    comment '日志解析规则表' charset = utf8mb4
                             row_format = DYNAMIC;

create index idx_enabled
    on data_log_parse_rule (enabled);

create table data_log_statistics
(
    id              bigint auto_increment comment '主键ID'
        primary key,
    service_name    varchar(100)                            not null comment '服务名称',
    stat_time       datetime                                not null comment '统计时间(小时级)',
    total_count     int           default 0                 not null comment '总日志数',
    error_count     int           default 0                 not null comment '错误数',
    warn_count      int           default 0                 not null comment '警告数',
    info_count      int           default 0                 not null comment '信息数',
    exception_count int           default 0                 not null comment '异常数',
    error_rate      decimal(5, 2) default 0.00              not null comment '错误率(%)',
    create_time     datetime      default CURRENT_TIMESTAMP not null comment '创建时间',
    constraint uk_service_time
        unique (service_name, stat_time)
)
    comment '日志统计表' charset = utf8mb4
                         row_format = DYNAMIC;

create index idx_stat_time
    on data_log_statistics (stat_time);

create table data_python_backup
(
    id           varchar(64)                          not null comment '备份ID'
        primary key,
    workspace_id varchar(64)                          not null comment 'Workspace ID',
    remark       varchar(500)                         null comment '备注说明',
    backup_path  varchar(500)                         not null comment '备份文件路径',
    file_count   int        default 0                 null comment '备份文件数量',
    creator      varchar(64)                          null comment '创建者ID',
    creator_name varchar(100)                         null comment '创建者名称',
    create_time  datetime   default CURRENT_TIMESTAMP null comment '创建时间',
    deleted      tinyint(1) default 0                 null comment '逻辑删除标识(0-未删除, 1-已删除)'
)
    comment 'Python 版本备份表' charset = utf8mb4;

create index idx_deleted
    on data_python_backup (deleted);

create index idx_workspace_id
    on data_python_backup (workspace_id);

create table data_python_script
(
    id               varchar(64)                          not null comment '脚本ID'
        primary key,
    workspace_id     varchar(64)                          not null comment 'Workspace ID',
    name             varchar(100)                         not null comment '脚本名称',
    file_path        varchar(500)                         not null comment '文件相对路径',
    content          longtext                             null comment '脚本内容（可选，主要存文件）',
    is_published     tinyint(1) default 0                 null comment '是否已发布为服务',
    publish_endpoint varchar(200)                         null comment '发布后的 endpoint 路径',
    creator          varchar(64)                          null comment '创建者ID',
    creator_name     varchar(100)                         null comment '创建者名称',
    create_time      datetime   default CURRENT_TIMESTAMP null comment '创建时间',
    updater          varchar(64)                          null comment '更新者ID',
    updater_name     varchar(100)                         null comment '更新者名称',
    update_time      datetime   default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted          tinyint(1) default 0                 null comment '逻辑删除标识(0-未删除, 1-已删除)'
)
    comment 'Python 脚本文件表' charset = utf8mb4;

create index idx_deleted
    on data_python_script (deleted);

create index idx_workspace_id
    on data_python_script (workspace_id);

create table data_python_service
(
    id              varchar(64)                           not null comment '服务ID'
        primary key,
    workspace_id    varchar(64)                           not null comment 'Workspace ID',
    script_name     varchar(100)                          not null comment '脚本文件名（如 main.py）',
    service_name    varchar(100)                          not null comment '服务名称（显示用）',
    description     varchar(500)                          null comment '服务描述',
    api_key         varchar(64)                           not null comment 'API Key（调用时需在 Header 中传递）',
    status          varchar(20) default 'ACTIVE'          null comment '状态：ACTIVE(有效)/INACTIVE(停用)',
    effective_start datetime                              null comment '生效开始时间（NULL 表示立即生效）',
    effective_end   datetime                              null comment '生效结束时间（NULL 表示永久有效）',
    creator         varchar(64)                           null comment '创建者ID',
    creator_name    varchar(100)                          null comment '创建者名称',
    create_time     datetime    default CURRENT_TIMESTAMP null comment '创建时间',
    updater         varchar(64)                           null comment '更新者ID',
    updater_name    varchar(100)                          null comment '更新者名称',
    update_time     datetime    default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted         tinyint(1)  default 0                 null comment '逻辑删除标识(0-未删除, 1-已删除)',
    publish_as_mcp  tinyint(1)  default 0                 not null comment '是否发布为 MCP 工具（1=是 0=否）',
    mcp_tool_name   varchar(128)                          null comment 'MCP 工具名（英文，如 process_data）',
    constraint uk_api_key
        unique (api_key)
)
    comment 'Python 发布服务表' charset = utf8mb4;

create index idx_deleted
    on data_python_service (deleted);

create index idx_status
    on data_python_service (status);

create index idx_workspace_id
    on data_python_service (workspace_id);

create table data_python_workspace
(
    id                 varchar(64)                           not null comment 'Workspace ID'
        primary key,
    user_id            varchar(64)                           not null comment '用户ID',
    name               varchar(100)                          not null comment 'Workspace 名称',
    description        varchar(500)                          null comment '描述',
    workspace_path     varchar(500)                          not null comment '工作目录路径',
    kernel_id          varchar(64)                           null comment 'Kernel ID（启动后填充）',
    status             varchar(20) default 'INACTIVE'        null comment '状态：ACTIVE(运行中)/INACTIVE(未启动)/ERROR(异常)',
    kernel_gateway_url varchar(200)                          null comment 'KernelGateway 地址',
    creator            varchar(64)                           null comment '创建者ID',
    creator_name       varchar(100)                          null comment '创建者名称',
    create_time        datetime    default CURRENT_TIMESTAMP null comment '创建时间',
    updater            varchar(64)                           null comment '更新者ID',
    updater_name       varchar(100)                          null comment '更新者名称',
    update_time        datetime    default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted            tinyint(1)  default 0                 null comment '逻辑删除标识(0-未删除, 1-已删除)',
    constraint uk_user_name
        unique (user_id, name)
)
    comment 'Python Workspace 表' charset = utf8mb4;

create index idx_deleted
    on data_python_workspace (deleted);

create index idx_status
    on data_python_workspace (status);

create index idx_user_id
    on data_python_workspace (user_id);

create table data_sync_action
(
    id            varchar(32)  not null
        primary key,
    namespace     varchar(100) not null,
    code          varchar(100) not null,
    name          varchar(100) not null,
    description   varchar(200) null,
    version       varchar(15)  null,
    clazz         varchar(100) not null,
    param_clazz   varchar(100) not null,
    jar_name      varchar(100) null,
    author        varchar(20)  null,
    author_name   varchar(50)  null,
    register_time datetime     null,
    update_time   datetime     null,
    status        int          null,
    fst_category  varchar(20)  null,
    snd_category  varchar(20)  null,
    trd_category  varchar(20)  null,
    fth_category  varchar(20)  null,
    constraint data_sync_action_uk
        unique (namespace, code)
)
    row_format = DYNAMIC;

create table data_sync_action_param
(
    clazz            varchar(100)    not null,
    name             varchar(50)     not null,
    title            varchar(100)    not null,
    is_required      int             null,
    value_type       varchar(50)     null,
    component_type   varchar(50)     null,
    component_config text            null,
    default_value    varchar(1000)   null comment '默认值',
    is_hidden        tinyint         null comment '是否隐藏',
    description      varchar(1024)   null,
    position         int default 999 null comment '字段排序位置，用于控制表单字段的显示顺序，数值越小越靠前',
    primary key (clazz, name),
    constraint data_sync_action_param_uk
        unique (clazz, name)
)
    row_format = DYNAMIC;

create table data_sync_connector
(
    id               varchar(64) charset utf8mb3  not null comment '数据源标识',
    name             varchar(200) charset utf8mb3 not null comment '数据源名称',
    description      varchar(512) charset utf8mb3 null comment '数据源业务描述',
    category         varchar(20) charset utf8mb3  not null comment '数据源分类',
    tags             varchar(50) charset utf8mb3  null comment '数据源标签',
    product          varchar(100) charset utf8mb3 not null comment '数据源产品',
    version          varchar(30) charset utf8mb3  null comment '数据源产品版本',
    icon             varchar(30) charset utf8mb3  null comment '数据源产品图标',
    impl_class       varchar(200) charset utf8mb3 not null comment '实现类',
    status           varchar(20) charset utf8mb3  not null comment '数据源状态',
    connector_params text                         null comment '连接参数',
    creator          varchar(20) charset utf8mb3  null comment '创建人',
    creator_name     varchar(100) charset utf8mb3 null comment '创建人姓名',
    create_time      datetime                     null comment '创建时间',
    updater          varchar(20) charset utf8mb3  null comment '修改人',
    updater_name     varchar(100) charset utf8mb3 null comment '修改人姓名',
    last_update_time datetime                     null comment '最后更新时间'
)
    row_format = DYNAMIC;

create table data_sync_connector_alert_history
(
    id             varchar(64)          not null comment '告警ID'
        primary key,
    rule_id        varchar(64)          null comment '规则ID',
    rule_name      varchar(200)         null comment '规则名称',
    connector_id   varchar(64)          not null comment '连接器ID',
    connector_name varchar(200)         null comment '连接器名称',
    alert_type     varchar(50)          not null comment '告警类型',
    alert_level    varchar(20)          not null comment '告警级别',
    alert_title    varchar(500)         null comment '告警标题',
    alert_content  text                 null comment '告警内容',
    trigger_time   datetime             not null comment '触发时间',
    resolved       tinyint(1) default 0 null comment '是否已解决',
    resolve_time   datetime             null comment '解决时间',
    resolve_type   varchar(20)          null comment '解决方式(AUTO/MANUAL)',
    resolver       varchar(64)          null comment '解决人ID',
    resolver_name  varchar(100)         null comment '解决人姓名',
    resolve_remark text                 null comment '解决备注',
    notify_status  varchar(20)          null comment '通知状态(PENDING/SENT/FAILED)',
    notify_time    datetime             null comment '通知时间',
    notify_error   text                 null comment '通知失败原因',
    details        text                 null comment '详细信息(JSON格式)'
)
    comment '连接器告警历史表' charset = utf8mb4
                               row_format = DYNAMIC;

create index idx_alert_type
    on data_sync_connector_alert_history (alert_type);

create index idx_connector_resolved
    on data_sync_connector_alert_history (connector_id, resolved);

create index idx_trigger_time
    on data_sync_connector_alert_history (trigger_time);

create table data_sync_connector_alert_rule
(
    id                varchar(64)                          not null comment '规则ID'
        primary key,
    rule_name         varchar(200)                         not null comment '规则名称',
    connector_id      varchar(64)                          null comment '连接器ID(为空表示全局规则)',
    alert_type        varchar(50)                          not null comment '告警类型',
    alert_level       varchar(20)                          not null comment '告警级别',
    enabled           tinyint(1) default 1                 null comment '是否启用',
    trigger_condition text                                 null comment '触发条件(JSON格式)',
    silence_period    int        default 300               null comment '防抖动时间(秒)',
    notify_channels   varchar(200)                         null comment '通知方式(EMAIL/WEBHOOK/SMS)',
    notify_receivers  text                                 null comment '通知接收人(多个逗号分隔)',
    webhook_url       varchar(500)                         null comment 'Webhook地址',
    create_time       datetime   default CURRENT_TIMESTAMP null comment '创建时间',
    creator           varchar(64)                          null comment '创建人ID',
    creator_name      varchar(100)                         null comment '创建人姓名',
    last_update_time  datetime   default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '最后更新时间',
    updater           varchar(64)                          null comment '更新人ID',
    updater_name      varchar(100)                         null comment '更新人姓名'
)
    comment '连接器告警规则表' charset = utf8mb4
                               row_format = DYNAMIC;

create index idx_alert_type
    on data_sync_connector_alert_rule (alert_type);

create index idx_connector_enabled
    on data_sync_connector_alert_rule (connector_id, enabled);

create table data_sync_connector_health_config
(
    id               varchar(64)                           not null comment '配置ID'
        primary key,
    connector_id     varchar(64)                           not null comment '连接器ID',
    enabled          tinyint(1)  default 1                 null comment '是否启用健康检查',
    check_interval   int         default 60000             null comment '检查间隔(毫秒)',
    timeout          int         default 5000              null comment '超时时间(毫秒)',
    retry_count      int         default 3                 null comment '失败重试次数',
    check_level      varchar(20) default 'STANDARD'        null comment '检查级别:QUICK/STANDARD/DEEP',
    alert_enabled    tinyint(1)  default 1                 null comment '是否启用告警',
    alert_threshold  int         default 3                 null comment '连续失败多少次触发告警',
    auto_reconnect   tinyint(1)  default 1                 null comment '是否自动重连',
    priority         varchar(20) default 'MEDIUM'          null comment '优先级:HIGH/MEDIUM/LOW',
    create_time      datetime    default CURRENT_TIMESTAMP null comment '创建时间',
    creator          varchar(64)                           null comment '创建人ID',
    creator_name     varchar(100)                          null comment '创建人姓名',
    last_update_time datetime    default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '最后更新时间',
    updater          varchar(64)                           null comment '更新人ID',
    updater_name     varchar(100)                          null comment '更新人姓名',
    constraint connector_id
        unique (connector_id)
)
    comment '连接器健康检查配置表' charset = utf8mb4
                                   row_format = DYNAMIC;

create index idx_enabled_priority
    on data_sync_connector_health_config (enabled, priority);

create table data_sync_connector_health_history
(
    id                   varchar(64)   not null comment '记录ID'
        primary key,
    connector_id         varchar(64)   not null comment '连接器ID',
    connector_name       varchar(200)  null comment '连接器名称',
    check_time           datetime      not null comment '检查时间',
    healthy              tinyint(1)    not null comment '是否健康',
    response_time        bigint        null comment '响应时间(毫秒)',
    check_level          varchar(20)   null comment '检查级别',
    error_message        text          null comment '错误消息',
    error_stack          text          null comment '错误堆栈',
    details              text          null comment '详细信息(JSON格式)',
    connector_status     varchar(50)   null comment '连接器状态',
    consecutive_failures int default 0 null comment '连续失败次数'
)
    comment '连接器健康检查历史表' charset = utf8mb4
                                   row_format = DYNAMIC;

create index idx_check_time
    on data_sync_connector_health_history (check_time);

create index idx_connector_time
    on data_sync_connector_health_history (connector_id, check_time);

create index idx_healthy
    on data_sync_connector_health_history (healthy);

create table data_sync_connector_metrics_hourly
(
    id                varchar(64)                        not null comment '记录ID'
        primary key,
    connector_id      varchar(64)                        not null comment '连接器ID',
    connector_name    varchar(200)                       null comment '连接器名称',
    stat_hour         datetime                           not null comment '统计时间(小时)',
    total_checks      int      default 0                 null comment '检查总次数',
    success_count     int      default 0                 null comment '成功次数',
    failure_count     int      default 0                 null comment '失败次数',
    success_rate      decimal(5, 2)                      null comment '成功率(%)',
    avg_response_time bigint                             null comment '平均响应时间(毫秒)',
    min_response_time bigint                             null comment '最小响应时间(毫秒)',
    max_response_time bigint                             null comment '最大响应时间(毫秒)',
    p99_response_time bigint                             null comment 'P99响应时间(毫秒)',
    total_online_time bigint                             null comment '总在线时长(毫秒)',
    online_rate       decimal(5, 2)                      null comment '在线率(%)',
    create_time       datetime default CURRENT_TIMESTAMP null comment '创建时间',
    constraint uk_connector_hour
        unique (connector_id, stat_hour)
)
    comment '连接器指标小时级聚合表' charset = utf8mb4
                                     row_format = DYNAMIC;

create index idx_stat_hour
    on data_sync_connector_metrics_hourly (stat_hour);

create table data_sync_dag_execution
(
    id                 varchar(64)                  not null comment '主键ID（执行记录ID）'
        primary key,
    dag_id             varchar(64)                  not null comment 'DAG ID（业务标识）',
    dag_name           varchar(255)                 null comment 'DAG名称',
    description        varchar(500)                 null comment 'DAG描述',
    status             varchar(32) default 'INIT'   not null comment '执行状态：INIT/RUNNING/PAUSED/SUCCESS/FAILED/CANCELLED',
    progress           int         default 0        null comment '执行进度（0-100）',
    total_nodes        int         default 0        null comment '总节点数',
    completed_nodes    int         default 0        null comment '已完成节点数',
    failed_nodes       int         default 0        null comment '失败节点数',
    start_time         datetime                     null comment '开始时间',
    end_time           datetime                     null comment '结束时间',
    duration           bigint                       null comment '执行耗时（毫秒）',
    error_message      text                         null comment '错误信息',
    execution_logs     longtext                     null comment '执行日志（文本格式，换行分隔）',
    trigger_type       varchar(20) default 'MANUAL' null comment '触发类型（MANUAL-手动触发, SCHEDULE-调度触发）',
    schedule_id        bigint                       null comment '调度配置ID（如果是调度触发，记录对应的触发器ID）',
    error_stack        longtext                     null comment '错误堆栈',
    last_executed_node varchar(64)                  null comment '最后执行的节点ID',
    dag_config         longtext                     null comment 'DAG配置（JSON）',
    execution_context  longtext                     null comment '执行上下文（JSON）',
    collapsed_nodes    longtext                     null comment '收拢节点映射（JSON）',
    creator            varchar(64)                  null comment '创建者',
    creator_name       varchar(128)                 null comment '创建者名称',
    create_time        datetime                     not null comment '创建时间',
    updater            varchar(64)                  null comment '更新者',
    updater_name       varchar(128)                 null comment '更新者名称',
    last_update_time   datetime                     not null comment '最后更新时间'
)
    comment 'DAG执行记录' collate = utf8mb4_general_ci
                          row_format = DYNAMIC;

create index idx_create_time
    on data_sync_dag_execution (create_time);

create index idx_dag_id
    on data_sync_dag_execution (dag_id);

create index idx_schedule_id
    on data_sync_dag_execution (schedule_id);

create index idx_status
    on data_sync_dag_execution (status);

create index idx_trigger_type
    on data_sync_dag_execution (trigger_type);

create table data_sync_dag_execution_crawler
(
    id                  varchar(64)                        not null comment '主键ID'
        primary key,
    dag_execution_id    varchar(64)                        not null comment '关联的DAG执行ID',
    url_count           int      default 0                 null comment '爬取的URL数量',
    success_url_count   int      default 0                 null comment '成功爬取的URL数量',
    failed_url_count    int      default 0                 null comment '失败的URL数量',
    record_count        bigint   default 0                 null comment '提取的数据记录数',
    stored_record_count bigint   default 0                 null comment '存储的数据记录数',
    create_time         datetime default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time         datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    constraint uk_dag_execution_id
        unique (dag_execution_id)
)
    comment '爬虫执行历史扩展表' collate = utf8mb4_unicode_ci
                                 row_format = DYNAMIC;

create index idx_create_time
    on data_sync_dag_execution_crawler (create_time);

create table data_sync_dag_node_execution
(
    id                   varchar(64)                   not null comment '主键ID（UUID）'
        primary key,
    dag_execution_id     varchar(64)                   not null comment 'DAG执行记录ID',
    node_id              varchar(64)                   not null comment '节点ID',
    node_name            varchar(255)                  null comment '节点名称',
    node_type            varchar(128)                  null comment '节点类型（算子类型）',
    status               varchar(32) default 'PENDING' not null comment '状态：PENDING/RUNNING/SUCCESS/FAILED/SKIPPED',
    execute_order        int                           null comment '执行顺序',
    retry_count          int         default 0         null comment '重试次数',
    start_time           datetime                      null comment '开始时间',
    end_time             datetime                      null comment '结束时间',
    duration             bigint                        null comment '耗时（毫秒）',
    input_params         longtext                      null comment '输入参数（JSON）',
    output_result        longtext                      null comment '输出结果（JSON配置片段或引用）',
    error_message        text                          null comment '错误信息',
    error_stack          longtext                      null comment '错误堆栈',
    metadata             longtext                      null comment '元数据（JSON，包含收拢信息等）',
    create_time          datetime                      not null comment '创建时间',
    last_update_time     datetime                      not null comment '最后更新时间',
    external_job_id      varchar(100)                  null comment '外部任务ID(SeaTunnel/Flink)',
    external_job_status  varchar(50)                   null comment '外部任务状态',
    external_job_url     varchar(500)                  null comment '外部任务监控URL',
    external_metrics     text                          null comment '外部任务指标JSON',
    external_engine_type varchar(20)                   null comment '外部引擎类型(SEATUNNEL/FLINK)'
)
    comment 'DAG节点执行记录' collate = utf8mb4_general_ci
                              row_format = DYNAMIC;

create index idx_dag_exec
    on data_sync_dag_node_execution (dag_execution_id);

create index idx_exec_order
    on data_sync_dag_node_execution (execute_order);

create index idx_node_id
    on data_sync_dag_node_execution (node_id);

create index idx_status
    on data_sync_dag_node_execution (status);

create table data_sync_flow
(
    id             bigint auto_increment comment '主键id'
        primary key,
    name           varchar(255)                 not null comment '流程名称',
    description    varchar(500)                 null comment '流程描述',
    flow_data      text                         null comment '流程图数据(JSON格式)',
    dag_data       text                         null comment 'dag执行数据',
    status         varchar(20) default 'DRAFT'  null comment '流程状态: DRAFT-草稿, RUNNING-运行中, STOPPED-已停止, FAILED-失败',
    execution_mode varchar(20) default 'http'   null comment '执行模式: http(同步) 或 mq(异步)',
    task_source    varchar(50) default 'MANUAL' null comment '任务来源: MANUAL(手动创建), CRAWLER(爬虫), ETL(数据集成), API(接口调度)',
    ext_config     text                         null comment '扩展配置(JSON格式，存储各类任务的特有配置)',
    creator_name   varchar(100)                 null comment '创建人',
    deleted        tinyint     default 0        null comment '删除标识  0：正常   1：已删除',
    creator        bigint                       null comment '创建者',
    create_time    datetime                     null comment '创建时间',
    updater        bigint                       null comment '更新者',
    updater_name   varchar(128)                 null comment '更新者名称',
    update_time    datetime                     null comment '更新时间'
)
    comment '流程编排表' charset = utf8mb4
                         row_format = DYNAMIC;

create index idx_create_time
    on data_sync_flow (create_time);

create index idx_deleted
    on data_sync_flow (deleted);

create index idx_name
    on data_sync_flow (name);

create index idx_status
    on data_sync_flow (status);

create index idx_task_source
    on data_sync_flow (task_source);

create index idx_update_time
    on data_sync_flow (update_time);

create table data_sync_flow_crawler
(
    id                  bigint auto_increment comment '主键ID'
        primary key,
    flow_id             bigint                                not null comment '关联的流程ID',
    task_type           varchar(20) default 'SINGLE'          null comment '任务类型: SINGLE(单次), SCHEDULED(定时), MANUAL(手动)',
    target_url          varchar(500)                          null comment '目标URL或URL模式',
    template_id         varchar(64)                           null comment '模板ID(如果基于模板创建)',
    template_name       varchar(200)                          null comment '模板名称',
    enabled             tinyint(1)  default 0                 null comment '是否启用',
    cron_expression     varchar(100)                          null comment '调度表达式(Cron格式)',
    next_execution_time datetime                              null comment '下次执行时间',
    retry_count         int         default 3                 null comment '重试次数',
    timeout             int         default 300               null comment '超时时间(秒)',
    concurrency         int         default 1                 null comment '并发数',
    total_executions    bigint      default 0                 null comment '总执行次数',
    success_executions  bigint      default 0                 null comment '成功执行次数',
    failed_executions   bigint      default 0                 null comment '失败执行次数',
    last_execution_time datetime                              null comment '最后执行时间',
    creator             varchar(64)                           null comment '创建者',
    creator_name        varchar(128)                          null comment '创建者名称',
    create_time         datetime    default CURRENT_TIMESTAMP not null comment '创建时间',
    updater             varchar(64)                           null comment '更新者',
    updater_name        varchar(128)                          null comment '更新者名称',
    update_time         datetime    default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted             tinyint(1)  default 0                 null comment '逻辑删除标识(0-未删除, 1-已删除)',
    constraint uk_flow_id
        unique (flow_id)
)
    comment '爬虫任务扩展表' collate = utf8mb4_unicode_ci
                             row_format = DYNAMIC;

create index idx_deleted
    on data_sync_flow_crawler (deleted);

create index idx_enabled
    on data_sync_flow_crawler (enabled);

create index idx_next_execution_time
    on data_sync_flow_crawler (next_execution_time);

create index idx_template_id
    on data_sync_flow_crawler (template_id);

create table data_sync_gateway_dead_letter
(
    id               bigint auto_increment comment '主键ID'
        primary key,
    gateway_id       bigint                                not null comment '网关ID',
    original_message json                                  null comment '原始消息内容',
    failure_reason   text                                  null comment '失败原因',
    failure_time     timestamp   default CURRENT_TIMESTAMP null comment '失败时间',
    retry_count      int         default 0                 null comment '重试次数',
    max_retry_count  int         default 3                 null comment '最大重试次数',
    last_retry_time  timestamp                             null comment '最后重试时间',
    status           varchar(20) default 'PENDING'         null comment '状态:PENDING,REPLAYED,ARCHIVED',
    handled_by       varchar(100)                          null comment '处理人',
    handled_time     timestamp                             null comment '处理时间'
)
    comment '死信队列表' charset = utf8mb4
                         row_format = DYNAMIC;

create index idx_failure_time
    on data_sync_gateway_dead_letter (failure_time);

create index idx_gateway
    on data_sync_gateway_dead_letter (gateway_id);

create index idx_status
    on data_sync_gateway_dead_letter (status);

create table data_sync_gateway_log
(
    id              bigint auto_increment comment '主键ID'
        primary key,
    gateway_id      bigint                              not null comment '网关ID',
    log_level       varchar(20)                         not null comment '日志级别:INFO,WARN,ERROR',
    log_message     text                                null comment '日志内容',
    exception_stack text                                null comment '异常堆栈',
    current_tps     int                                 null comment '当前TPS',
    error_rate      decimal(5, 2)                       null comment '错误率(%)',
    kafka_lag       bigint                              null comment 'Kafka消费延迟',
    log_time        timestamp default CURRENT_TIMESTAMP null comment '日志时间'
)
    comment '网关运行日志表' charset = utf8mb4
                             row_format = DYNAMIC;

create index idx_gateway_time
    on data_sync_gateway_log (gateway_id, log_time);

create index idx_log_level
    on data_sync_gateway_log (log_level);

create index idx_log_time
    on data_sync_gateway_log (log_time);

create table data_sync_protocol_gateway
(
    id                     bigint auto_increment comment '主键ID'
        primary key,
    name                   varchar(200)                          not null comment '网关名称',
    source_connector_id    varchar(64)                           not null comment '源连接器ID',
    protocol_type          varchar(50)                           not null comment '协议类型:MODBUS,COAP,OPCUA,TCP,UDP,MQTT',
    kafka_connector_id     varchar(64)                           not null comment 'Kafka连接器ID',
    kafka_topic            varchar(500)                          not null comment 'Kafka主题',
    partition_strategy     varchar(50) default 'BY_DEVICE_ID'    null comment '分区策略',
    polling_interval       int         default 1000              null comment '轮询间隔(ms)',
    status                 varchar(20) default 'STOPPED'         null comment '状态:STOPPED,RUNNING,ERROR',
    auto_start             tinyint(1)  default 0                 null comment '系统启动时自动启动',
    max_tps                int         default 1000              null comment '最大TPS限流',
    backpressure_strategy  varchar(20) default 'BLOCK'           null comment '背压策略:DROP,BLOCK,BUFFER',
    enable_circuit_breaker tinyint(1)  default 1                 null comment '启用熔断器',
    failure_threshold      int         default 50                null comment '熔断失败率阈值(%)',
    circuit_sleep_window   int         default 60000             null comment '熔断恢复窗口(ms)',
    memory_buffer_size     int         default 10000             null comment '内存缓冲大小',
    disk_buffer_enabled    tinyint(1)  default 1                 null comment '启用磁盘缓冲',
    disk_buffer_path       varchar(500)                          null comment '磁盘缓冲路径',
    max_retry_count        int         default 3                 null comment '最大重试次数',
    message_count          bigint      default 0                 null comment '累计消息数',
    error_count            bigint      default 0                 null comment '累计错误数',
    last_active_time       timestamp                             null comment '最后活跃时间',
    created_by             varchar(100)                          null comment '创建人',
    created_time           timestamp   default CURRENT_TIMESTAMP null comment '创建时间',
    updated_by             varchar(100)                          null comment '更新人',
    updated_time           timestamp   default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted                tinyint(1)  default 0                 null comment '逻辑删除'
)
    comment '协议网关配置表' charset = utf8mb4
                             row_format = DYNAMIC;

create table data_sync_gateway_read_rule
(
    id            bigint auto_increment comment '主键ID'
        primary key,
    gateway_id    bigint                               not null comment '网关ID',
    rule_name     varchar(200)                         not null comment '规则名称',
    rule_type     varchar(50)                          not null comment '规则类型:MODBUS_REGISTER,COAP_RESOURCE,OPCUA_NODE',
    rule_config   json                                 null comment '规则配置(JSON格式)',
    field_name    varchar(100)                         null comment '字段名称',
    field_type    varchar(50)                          null comment '字段类型',
    default_value varchar(500)                         null comment '默认值',
    sort_order    int        default 0                 null comment '排序',
    priority      int        default 50                null comment '优先级（数字越小优先级越高）',
    description   varchar(500)                         null comment '描述',
    enabled       tinyint(1) default 1                 null comment '启用状态',
    created_by    varchar(100)                         null comment '创建人',
    created_time  timestamp  default CURRENT_TIMESTAMP null comment '创建时间',
    updated_by    varchar(100)                         null comment '更新人',
    updated_time  timestamp  default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    constraint data_sync_gateway_read_rule_ibfk_1
        foreign key (gateway_id) references data_sync_protocol_gateway (id)
            on delete cascade
)
    comment '网关读取规则表' charset = utf8mb4
                             row_format = DYNAMIC;

create index idx_enabled
    on data_sync_gateway_read_rule (enabled);

create index idx_gateway_id
    on data_sync_gateway_read_rule (gateway_id);

create index idx_created_time
    on data_sync_protocol_gateway (created_time);

create index idx_protocol
    on data_sync_protocol_gateway (protocol_type);

create index idx_status
    on data_sync_protocol_gateway (status);

create table data_sync_slow_query
(
    id                 bigint auto_increment comment '主键ID'
        primary key,
    query_id           varchar(64)                           null comment '查询ID(由执行引擎生成)',
    sql_fingerprint    varchar(255)                          not null comment 'SQL指纹(去除参数后的SQL模板)',
    sql_text           text                                  not null comment '实际执行的SQL语句',
    sql_type           varchar(20)                           null comment 'SQL类型:SELECT/INSERT/UPDATE/DELETE/DDL',
    database_name      varchar(200)                          null comment '数据库名',
    table_names        varchar(500)                          null comment '涉及的表名(多表用逗号分隔)',
    execution_time     bigint                                not null comment '执行耗时(毫秒)',
    rows_examined      bigint                                null comment '扫描行数',
    rows_sent          bigint                                null comment '返回行数',
    lock_time          bigint                                null comment '锁等待时间(毫秒)',
    start_time         datetime                              not null comment '执行开始时间',
    end_time           datetime                              null comment '执行结束时间',
    source_type        varchar(50)                           null comment '来源类型:QUERY_MODULE/DAG_NODE/CONNECTOR',
    source_id          varchar(64)                           null comment '来源ID(模块ID或节点ID)',
    connector_id       varchar(64)                           null comment '连接器ID',
    user_name          varchar(100)                          null comment '执行用户',
    client_host        varchar(100)                          null comment '客户端地址',
    cpu_time           bigint                                null comment 'CPU时间(毫秒)',
    memory_used        bigint                                null comment '内存使用(KB)',
    disk_io            bigint                                null comment '磁盘IO次数',
    index_suggestion   text                                  null comment '索引优化建议',
    optimization_level varchar(20) default 'MEDIUM'          null comment '优化紧急程度:HIGH/MEDIUM/LOW',
    status             varchar(20) default 'PENDING'         null comment '处理状态:PENDING/REVIEWED/OPTIMIZED/IGNORED',
    reviewed_by        varchar(100)                          null comment '审阅人',
    reviewed_time      datetime                              null comment '审阅时间',
    review_notes       text                                  null comment '审阅备注',
    create_time        timestamp   default CURRENT_TIMESTAMP null comment '创建时间'
)
    comment '慢查询监控记录表' charset = utf8mb4
                               row_format = DYNAMIC;

create index idx_connector
    on data_sync_slow_query (connector_id);

create index idx_database
    on data_sync_slow_query (database_name);

create index idx_execution_time
    on data_sync_slow_query (execution_time);

create index idx_fingerprint
    on data_sync_slow_query (sql_fingerprint);

create index idx_optimization_level
    on data_sync_slow_query (optimization_level);

create index idx_source
    on data_sync_slow_query (source_type, source_id);

create index idx_start_time
    on data_sync_slow_query (start_time);

create index idx_status
    on data_sync_slow_query (status);

create table data_sync_slow_query_config
(
    id             bigint auto_increment comment '主键ID'
        primary key,
    threshold_ms   bigint     default 5000              not null comment '慢查询阈值(毫秒)',
    enabled        tinyint(1) default 1                 not null comment '是否启用慢查询监控:0-禁用/1-启用',
    alert_enabled  tinyint(1) default 0                 not null comment '是否启用告警:0-禁用/1-启用',
    retention_days int        default 30                not null comment '数据保留天数',
    create_time    timestamp  default CURRENT_TIMESTAMP null comment '创建时间',
    update_time    timestamp  default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间'
)
    comment '慢查询监控配置表' charset = utf8mb4
                               row_format = DYNAMIC;

create table ds_catalog_config
(
    id                       bigint auto_increment comment '主键ID'
        primary key,
    catalog_name             varchar(100)                          not null comment 'Catalog名称',
    star_rocks_connector_id  varchar(50)                           not null comment 'StarRocks连接器ID',
    data_source_type         varchar(50)                           not null comment '数据源类型',
    data_source_connector_id varchar(50)                           not null comment '数据源连接器ID',
    driver_url               varchar(500)                          null comment 'JDBC驱动URL',
    status                   varchar(20) default 'ACTIVE'          null comment '状态: ACTIVE/ERROR/DELETED',
    creator                  varchar(50)                           null comment '创建者ID',
    creator_name             varchar(100)                          null comment '创建者名称',
    create_time              datetime    default CURRENT_TIMESTAMP null comment '创建时间',
    updater                  varchar(50)                           null comment '更新者ID',
    updater_name             varchar(100)                          null comment '更新者名称',
    update_time              datetime    default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    constraint catalog_name
        unique (catalog_name)
)
    comment 'Catalog配置表' charset = utf8mb4
                            row_format = DYNAMIC;

create index idx_sr_connector
    on ds_catalog_config (star_rocks_connector_id);

create index idx_status
    on ds_catalog_config (status);

create table ds_query_history
(
    id                      bigint auto_increment comment '主键ID'
        primary key,
    user_id                 varchar(50)                        null comment '用户ID',
    `sql`                   text                               not null comment 'SQL语句',
    star_rocks_connector_id varchar(50)                        null comment 'StarRocks连接器ID',
    execute_time            bigint                             null comment '执行时长(毫秒)',
    success                 tinyint(1)                         null comment '是否成功',
    error_message           text                               null comment '错误信息',
    result_rows             bigint                             null comment '结果行数',
    execute_at              datetime default CURRENT_TIMESTAMP null comment '执行时间'
)
    comment '查询历史表' charset = utf8mb4
                         row_format = DYNAMIC;

create index idx_execute_at
    on ds_query_history (execute_at);

create index idx_user_id
    on ds_query_history (user_id);

create table ds_sql_api
(
    id                      bigint auto_increment comment '主键ID'
        primary key,
    api_path                varchar(200)                          not null comment 'API路径',
    api_name                varchar(100)                          not null comment 'API名称',
    description             varchar(500)                          null comment 'API描述',
    sql_template            text                                  not null comment 'SQL模板(支持{{param}}占位符)',
    star_rocks_connector_id varchar(50)                           not null comment 'StarRocks连接器ID',
    method                  varchar(10) default 'POST'            null comment '请求方法: GET/POST',
    parameters              text                                  null comment '参数定义(JSON格式)',
    enabled                 tinyint(1)  default 1                 null comment '是否启用',
    timeout                 int         default 30                null comment '超时时间(秒)',
    max_rows                int         default 1000              null comment '最大返回行数',
    creator                 varchar(50)                           null comment '创建者',
    create_time             datetime    default CURRENT_TIMESTAMP null comment '创建时间',
    update_time             datetime    default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    publish_as_mcp          int         default 0                 not null comment '是否发布为MCP工具(0=否 1=是)',
    mcp_tool_name           varchar(100)                          null comment 'MCP工具名(英文,如query_user_list)',
    constraint api_path
        unique (api_path)
)
    comment 'SQL API配置表' charset = utf8mb4
                            row_format = DYNAMIC;

create index idx_api_path
    on ds_sql_api (api_path);

create index idx_enabled
    on ds_sql_api (enabled);

create table flink_catalog_config
(
    id             bigint auto_increment comment '主键ID'
        primary key,
    user_id        varchar(64)                           not null comment '用户ID',
    catalog_name   varchar(255)                          not null comment 'Catalog名称',
    catalog_type   varchar(50)                           not null comment 'Catalog类型:jdbc/hive/paimon/iceberg/generic',
    connector_id   varchar(64)                           null comment '关联的连接器ID(可选)',
    catalog_config json                                  not null comment '连接配置JSON',
    is_default     tinyint(1)  default 0                 null comment '是否默认Catalog:0-否/1-是',
    status         varchar(20) default 'ACTIVE'          null comment '状态:ACTIVE/INACTIVE/ERROR',
    create_time    datetime    default CURRENT_TIMESTAMP null comment '创建时间',
    creator        varchar(64)                           null comment '创建人id',
    creator_name   varchar(100)                          null comment '创建人姓名',
    update_time    datetime    default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    updater        varchar(64)                           null comment '更新人id',
    updater_name   varchar(100)                          null comment '更新人姓名',
    constraint uk_user_catalog
        unique (user_id, catalog_name)
)
    comment 'Flink Catalog配置表' charset = utf8mb4
                                  row_format = DYNAMIC;

create index idx_connector_id
    on flink_catalog_config (connector_id);

create index idx_status
    on flink_catalog_config (status);

create index idx_user_id
    on flink_catalog_config (user_id);

create table flink_config
(
    id                  bigint auto_increment comment 'id'
        primary key,
    name                varchar(100) collate utf8mb4_general_ci not null comment '集群名称',
    flink_version       varchar(20)                             null comment 'flink版本',
    type                int                                     null comment '类型',
    job_manager_address varchar(50)                             null comment 'jobManager地址',
    job_manager_port    int                                     null comment 'jobManager端口',
    configurations      text collate utf8mb4_general_ci         null comment '自定义参数',
    config              text                                    null comment '参数配置',
    active              tinyint default 0                       null comment '链接是否有效',
    summary             varchar(300) collate utf8mb4_general_ci null comment '描述',
    deleted             tinyint                                 null comment '删除标识  0：正常   1：已删除',
    creator             bigint                                  null comment '创建者',
    create_time         datetime                                null comment '创建时间',
    updater             bigint                                  null comment '更新者',
    update_time         datetime                                null comment '更新时间'
)
    comment 'Flink集群配置' charset = utf8mb4
                            row_format = DYNAMIC;

create table flink_directory
(
    id          bigint auto_increment comment 'id'
        primary key,
    pid         bigint       null comment '上级ID',
    name        varchar(100) null comment '目录名称',
    deleted     tinyint      null comment '删除标识  0：正常   1：已删除',
    creator     bigint       null comment '创建者',
    create_time datetime     null comment '创建时间',
    updater     bigint       null comment '更新者',
    update_time datetime     null comment '更新时间'
)
    comment 'Flink目录' charset = utf8mb4
                        row_format = DYNAMIC;

create table flink_global_config
(
    id             bigint auto_increment comment 'id'
        primary key,
    type           int                             null comment '类型',
    configurations text collate utf8mb4_general_ci null comment '配置参数',
    deleted        tinyint                         null comment '删除标识  0：正常   1：已删除',
    creator        bigint                          null comment '创建者',
    create_time    datetime                        null comment '创建时间',
    updater        bigint                          null comment '更新者',
    update_time    datetime                        null comment '更新时间'
)
    comment 'flink全局配置' charset = utf8mb4
                            row_format = DYNAMIC;

create table flink_global_parameter
(
    id              bigint auto_increment comment 'id'
        primary key,
    parameter_key   varchar(120) null comment '参数key',
    parameter_type  int          null comment '参数类型 1：自定义 2:数据源 3:表达式',
    source_id       bigint       null comment '数据源ID',
    parameter_value varchar(120) null comment '参数值',
    remarks         varchar(500) null comment '描述',
    is_system       int          null comment '是否系统参数',
    deleted         tinyint      null comment '删除标识  0：正常   1：已删除',
    creator         bigint       null comment '创建者',
    create_time     datetime     null comment '创建时间',
    updater         bigint       null comment '更新者',
    update_time     datetime     null comment '更新时间'
)
    comment 'flink全局参数' charset = utf8mb4
                            row_format = DYNAMIC;

create table flink_sql_history
(
    id                bigint auto_increment comment '主键ID'
        primary key,
    user_id           varchar(64)                          not null comment '用户ID',
    connector_id      varchar(64)                          not null comment 'Flink连接器ID',
    sql_content       text                                 not null comment 'SQL内容',
    sql_type          varchar(20)                          null comment 'SQL类型:SELECT/INSERT/CREATE_TABLE/CREATE_CATALOG/DDL',
    execute_mode      varchar(20)                          null comment '执行模式:SYNC/ASYNC/STREAMING',
    execute_status    varchar(20)                          null comment '执行状态:SUCCESS/FAILED/RUNNING/CANCELLED',
    session_id        varchar(255)                         null comment 'SQL Gateway Session ID',
    operation_handle  varchar(255)                         null comment 'Operation Handle',
    job_id            varchar(64)                          null comment 'Flink JobID',
    result_rows       bigint                               null comment '结果行数',
    execute_time      bigint                               null comment '执行耗时(ms)',
    start_time        datetime                             null comment '开始时间',
    end_time          datetime                             null comment '结束时间',
    error_message     text                                 null comment '错误信息',
    error_stack       text                                 null comment '错误堆栈',
    is_favorite       tinyint(1) default 0                 null comment '是否收藏:0-否/1-是',
    favorite_category varchar(100)                         null comment '收藏分类',
    remark            varchar(500)                         null comment '备注',
    create_time       datetime   default CURRENT_TIMESTAMP null comment '创建时间'
)
    comment 'Flink SQL执行历史表' charset = utf8mb4
                                  row_format = DYNAMIC;

create index idx_connector_id
    on flink_sql_history (connector_id);

create index idx_create_time
    on flink_sql_history (create_time);

create index idx_execute_status
    on flink_sql_history (execute_status);

create index idx_favorite
    on flink_sql_history (user_id, is_favorite);

create index idx_job_id
    on flink_sql_history (job_id);

create index idx_user_id
    on flink_sql_history (user_id);

create table flink_sql_session
(
    id                 bigint auto_increment comment '主键ID'
        primary key,
    user_id            varchar(64)                        not null comment '用户ID',
    connector_id       varchar(64)                        not null comment 'Flink连接器ID',
    session_id         varchar(255)                       not null comment 'SQL Gateway Session ID',
    session_name       varchar(255)                       null comment 'Session名称',
    session_type       varchar(20)                        null comment 'Session类型:TEMPORARY/PERSISTENT',
    operation_handle   varchar(255)                       null comment 'Operation Handle',
    job_id             varchar(64)                        null comment 'Flink JobID',
    job_name           varchar(255)                       null comment '任务名称',
    status             varchar(20)                        null comment '状态:ACTIVE/CLOSED/EXPIRED/ERROR',
    create_time        datetime default CURRENT_TIMESTAMP null comment '创建时间',
    last_activity_time datetime                           null comment '最后活跃时间',
    expired_at         datetime                           null comment '过期时间',
    close_time         datetime                           null comment '关闭时间'
)
    comment 'Flink SQL Session管理表' charset = utf8mb4
                                      row_format = DYNAMIC;

create index idx_expired_at
    on flink_sql_session (expired_at);

create index idx_job_id
    on flink_sql_session (job_id);

create index idx_session_id
    on flink_sql_session (session_id);

create index idx_status
    on flink_sql_session (status);

create index idx_user_id
    on flink_sql_session (user_id);

create table flink_sql_snippet
(
    id              bigint auto_increment comment '主键ID'
        primary key,
    user_id         varchar(64)                        not null comment '用户ID',
    snippet_name    varchar(255)                       not null comment '片段名称',
    snippet_key     varchar(100)                       null comment '快捷键(@开头)',
    snippet_content text                               not null comment '片段内容',
    description     varchar(500)                       null comment '描述',
    tags            varchar(200)                       null comment '标签(多个用逗号分隔)',
    usage_count     int      default 0                 null comment '使用次数',
    create_time     datetime default CURRENT_TIMESTAMP null comment '创建时间',
    update_time     datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    constraint uk_user_snippet_key
        unique (user_id, snippet_key)
)
    comment 'Flink SQL片段管理表' charset = utf8mb4
                                  row_format = DYNAMIC;

create index idx_usage_count
    on flink_sql_snippet (usage_count);

create index idx_user_id
    on flink_sql_snippet (user_id);

create table flink_sql_template
(
    id                bigint auto_increment comment '主键ID'
        primary key,
    template_name     varchar(255)                         not null comment '模板名称',
    template_category varchar(50)                          null comment '模板分类:DDL/WINDOW/JOIN/ADVANCED',
    sub_category      varchar(50)                          null comment '子分类',
    template_content  text                                 not null comment '模板内容',
    description       varchar(500)                         null comment '模板说明',
    variables         json                                 null comment '变量定义JSON',
    tags              varchar(200)                         null comment '标签(多个用逗号分隔)',
    is_system         tinyint(1) default 0                 null comment '是否系统预置:0-否/1-是',
    usage_count       int        default 0                 null comment '使用次数',
    create_time       datetime   default CURRENT_TIMESTAMP null comment '创建时间',
    creator           varchar(64)                          null comment '创建人id',
    creator_name      varchar(100)                         null comment '创建人姓名',
    update_time       datetime   default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间'
)
    comment 'Flink SQL模板库' charset = utf8mb4
                              row_format = DYNAMIC;

create index idx_category
    on flink_sql_template (template_category, sub_category);

create index idx_is_system
    on flink_sql_template (is_system);

create index idx_usage_count
    on flink_sql_template (usage_count);

create table flink_sql_version
(
    id          bigint auto_increment comment 'id'
        primary key,
    task_id     bigint                          not null comment '任务ID',
    execute_sql text collate utf8mb4_general_ci null comment '变动后SQL',
    begin_sql   text                            null comment '变动前SQL',
    deleted     tinyint                         null comment '删除标识  0：正常   1：已删除',
    creator     bigint                          null comment '创建者',
    create_time datetime                        null comment '创建时间',
    updater     bigint                          null comment '更新者',
    update_time datetime                        null comment '更新时间'
)
    comment 'Flink SQL历史版本' charset = utf8mb4
                                row_format = DYNAMIC;

create index task_id
    on flink_sql_version (task_id, create_time);

create table flink_task
(
    id               bigint auto_increment comment 'id'
        primary key,
    pid              bigint                                  null comment '所属目录ID',
    flink_type       int                                     null comment 'flink类型',
    config_id        bigint                                  null comment '执行集群ID',
    scheduler_job_id bigint                                  null comment '调度执行ID',
    alarm_type       int                                     null comment '告警类型',
    alarm_id         bigint                                  null comment '告警ID',
    name             varchar(100) collate utf8mb4_general_ci not null comment '作业名称',
    type             int                                     null comment '作业类型',
    execute_sql      text collate utf8mb4_general_ci         null comment '执行SQL',
    configurations   text collate utf8mb4_general_ci         null comment '作业配置参数',
    config           text                                    null comment '配置',
    status           int                                     null comment '状态 0：新建 1：审核中 2：已发布',
    publish_date     datetime                                null comment '发布日期',
    execute_status   int                                     null comment '状态 0：未执行 1：执行中',
    execute_date     datetime                                null comment '上次执行时间',
    summary          varchar(300) collate utf8mb4_general_ci null comment '描述',
    deleted          tinyint                                 null comment '删除标识  0：正常   1：已删除',
    creator          bigint                                  null comment '创建者',
    create_time      datetime                                null comment '创建时间',
    updater          bigint                                  null comment '更新者',
    update_time      datetime                                null comment '更新时间'
)
    comment 'Flink任务表' charset = utf8mb4
                          row_format = DYNAMIC;

create table flink_task_log
(
    id                bigint auto_increment comment 'id'
        primary key,
    trigger_id        bigint                                  null comment '任务ID',
    job_id            varchar(100) collate utf8mb4_general_ci null comment 'flink job id',
    job               longtext collate utf8mb4_general_ci     null comment 'job',
    exception         longtext collate utf8mb4_general_ci     null comment 'exception',
    checkpoint_config longtext collate utf8mb4_general_ci     null comment 'checkpoint_config',
    checkpoint        longtext collate utf8mb4_general_ci     null comment 'checkpoint',
    stdout            longtext collate utf8mb4_general_ci     null comment 'stdout',
    thread_dump       longtext collate utf8mb4_general_ci     null comment 'thread_dump',
    logs              longtext collate utf8mb4_general_ci     null comment 'logs',
    deleted           tinyint                                 null comment '删除标识  0：正常   1：已删除',
    creator           bigint                                  null comment '创建者',
    create_time       datetime                                null comment '创建时间',
    updater           bigint                                  null comment '更新者',
    update_time       datetime                                null comment '更新时间'
)
    comment 'Flink任务记录表' charset = utf8mb4
                              row_format = DYNAMIC;

create index triggerId
    on flink_task_log (trigger_id);

create table flink_task_triggers
(
    id           bigint auto_increment comment 'id'
        primary key,
    task_id      bigint                                  null comment '任务ID',
    job_id       varchar(100) collate utf8mb4_general_ci null comment 'flink job id',
    status       int                                     null comment '状态 0：执行中 1：执行成功 2：执行失败 ',
    execute_type int                                     null comment '执行类型 1：手动 2：调度',
    begin_date   datetime                                null comment '执行开始时间',
    end_date     datetime                                null comment '执行结束时间',
    log_content  longtext collate utf8mb4_general_ci     null comment '执行日志',
    err_message  text collate utf8mb4_general_ci         null comment '错误日志',
    deleted      tinyint                                 null comment '删除标识  0：正常   1：已删除',
    creator      bigint                                  null comment '创建者',
    create_time  datetime                                null comment '创建时间',
    updater      bigint                                  null comment '更新者',
    update_time  datetime                                null comment '更新时间'
)
    comment 'Flink任务实例表' charset = utf8mb4
                              row_format = DYNAMIC;

create index beginDate
    on flink_task_triggers (begin_date);

create index jobId
    on flink_task_triggers (job_id);

create index status
    on flink_task_triggers (status);

create index taskId
    on flink_task_triggers (task_id);

create table lineage_sql_parse_history
(
    id                   bigint auto_increment comment '主键ID'
        primary key,
    `sql`                text                               not null comment 'SQL语句',
    database_type        varchar(50)                        not null comment '数据库类型',
    default_database     varchar(200)                       null comment '默认数据库',
    default_schema       varchar(200)                       null comment '默认Schema',
    sql_type             varchar(50)                        null comment 'SQL类型(SELECT/INSERT/UPDATE/DELETE等)',
    source_table_count   int      default 0                 null comment '源表数量',
    target_table_count   int      default 0                 null comment '目标表数量',
    table_lineage_count  int      default 0                 null comment '表血缘数量',
    column_lineage_count int      default 0                 null comment '字段血缘数量',
    parse_result_json    text                               null comment '解析结果JSON',
    create_time          datetime default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time          datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间'
)
    comment 'SQL解析历史表' charset = utf8mb4
                            row_format = DYNAMIC;

create index idx_create_time
    on lineage_sql_parse_history (create_time);

create index idx_database_type
    on lineage_sql_parse_history (database_type);

create table sys_menu
(
    id          bigint auto_increment comment 'id'
        primary key,
    pid         bigint        null comment '上级ID，一级菜单为0',
    name        varchar(200)  null comment '菜单标识',
    url         varchar(200)  null comment '菜单URL',
    en_name     varchar(255)  null comment '菜单英文名称',
    cn_name     varchar(255)  null comment '菜单中文名称',
    type        int default 1 null comment '菜单系统类型 1:dgp 2:portal',
    authority   varchar(500)  null comment '授权标识(多个用逗号分隔，如：sys:menu:list,sys:menu:save)',
    icon        varchar(50)   null comment '菜单图标',
    sort        int           null comment '排序',
    deleted     tinyint       null comment '删除标识  0：正常   1：已删除',
    creator     bigint        null comment '创建者',
    create_time datetime      null comment '创建时间',
    updater     bigint        null comment '更新者',
    update_time datetime      null comment '更新时间'
)
    comment '菜单管理' charset = utf8mb4
                       row_format = DYNAMIC;

create index idx_pid
    on sys_menu (pid);

create table sys_org
(
    id          bigint auto_increment comment 'id'
        primary key,
    pid         bigint      null comment '上级ID',
    name        varchar(50) null comment '机构名称',
    sort        int         null comment '排序',
    deleted     tinyint     null comment '删除标识  0：正常   1：已删除',
    creator     bigint      null comment '创建者',
    create_time datetime    null comment '创建时间',
    updater     bigint      null comment '更新者',
    update_time datetime    null comment '更新时间'
)
    comment '机构管理' charset = utf8mb4
                       row_format = DYNAMIC;

create index idx_pid
    on sys_org (pid);

create table sys_role
(
    id          bigint auto_increment comment 'id'
        primary key,
    name        varchar(50)  null comment '角色名称',
    remark      varchar(100) null comment '备注',
    deleted     tinyint      null comment '删除标识  0：正常   1：已删除',
    creator     bigint       null comment '创建者',
    create_time datetime     null comment '创建时间',
    updater     bigint       null comment '更新者',
    update_time datetime     null comment '更新时间'
)
    comment '角色管理' charset = utf8mb4
                       row_format = DYNAMIC;

create table sys_role_menu
(
    id          bigint auto_increment comment 'id'
        primary key,
    role_id     bigint   null comment '角色ID',
    menu_id     bigint   null comment '菜单ID',
    deleted     tinyint  null comment '删除标识  0：正常   1：已删除',
    creator     bigint   null comment '创建者',
    create_time datetime null comment '创建时间',
    updater     bigint   null comment '更新者',
    update_time datetime null comment '更新时间'
)
    comment '角色菜单关系' charset = utf8mb4
                           row_format = DYNAMIC;

create index idx_menu_id
    on sys_role_menu (menu_id);

create index idx_role_id
    on sys_role_menu (role_id);

create table sys_user
(
    id          bigint auto_increment comment 'id'
        primary key,
    username    varchar(50)  not null comment '用户名',
    password    varchar(100) null comment '密码',
    real_name   varchar(50)  null comment '姓名',
    avatar      varchar(200) null comment '头像',
    gender      tinyint      null comment '性别   0：男   1：女   2：未知',
    email       varchar(100) null comment '邮箱',
    mobile      varchar(20)  null comment '手机号',
    org_id      bigint       null comment '机构ID',
    super_admin tinyint      null comment '超级管理员   0：否   1：是',
    status      tinyint      null comment '状态  0：停用   1：正常',
    deleted     tinyint      null comment '删除标识  0：正常   1：已删除',
    creator     bigint       null comment '创建者',
    create_time datetime     null comment '创建时间',
    updater     bigint       null comment '更新者',
    update_time datetime     null comment '更新时间'
)
    comment '用户管理' charset = utf8mb4
                       row_format = DYNAMIC;

create table sys_user_role
(
    id          bigint auto_increment comment 'id'
        primary key,
    role_id     bigint   null comment '角色ID',
    user_id     bigint   null comment '用户ID',
    deleted     tinyint  null comment '删除标识  0：正常   1：已删除',
    creator     bigint   null comment '创建者',
    create_time datetime null comment '创建时间',
    updater     bigint   null comment '更新者',
    update_time datetime null comment '更新时间'
)
    comment '用户角色关系' charset = utf8mb4
                           row_format = DYNAMIC;

create index idx_role_id
    on sys_user_role (role_id);

create index idx_user_id
    on sys_user_role (user_id);

create table worker_alert_rule
(
    id             bigint auto_increment
        primary key,
    name           varchar(128)                          not null comment '规则名称',
    type           varchar(64)                           not null comment '规则类型：node_offline,cpu_high,memory_high,task_failure_rate等',
    metric         varchar(64)                           null comment '监控指标',
    threshold      decimal(10, 2)                        null comment '阈值',
    operator       varchar(16)                           null comment '比较运算符：>,<,>=,<=,=',
    duration       int                                   null comment '持续时间（秒）',
    level          varchar(32)                           not null comment '告警级别：CRITICAL,WARNING,INFO',
    scope          varchar(32) default 'GLOBAL'          null comment '范围：GLOBAL,NODE,TAG',
    scope_value    varchar(256)                          null comment '范围值（节点ID或标签）',
    silence_period int         default 300               null comment '静默期（秒）',
    enabled        tinyint(1)  default 1                 null comment '是否启用',
    description    text                                  null comment '规则描述',
    create_time    datetime    default CURRENT_TIMESTAMP null comment '创建时间',
    update_time    datetime    default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间'
)
    comment 'Worker告警规则表' charset = utf8mb4
                               row_format = DYNAMIC;

create index idx_enabled
    on worker_alert_rule (enabled);

create index idx_type
    on worker_alert_rule (type);

create table worker_heartbeat
(
    id                    bigint auto_increment
        primary key,
    worker_id             varchar(64)                        not null comment 'Worker节点ID',
    heartbeat_time        datetime                           not null comment '心跳时间',
    active_tasks          int      default 0                 null comment '活跃任务数',
    cpu_usage             decimal(5, 2)                      null comment 'CPU使用率(%)',
    memory_usage          decimal(5, 2)                      null comment '内存使用率(%)',
    jvm_heap_usage        decimal(5, 2)                      null comment 'JVM堆内存使用率(%)',
    disk_usage            decimal(5, 2)                      null comment '磁盘使用率(%)',
    system_load           decimal(10, 2)                     null comment '系统负载',
    thread_count          int                                null comment '线程数',
    gc_count              bigint                             null comment 'GC次数',
    gc_time               bigint                             null comment 'GC总耗时(ms)',
    jvm_non_heap_usage    decimal(5, 2)                      null comment 'JVM非堆内存使用率(%)',
    network_receive_rate  decimal(10, 2)                     null comment '网络接收速率(MB/s)',
    network_send_rate     decimal(10, 2)                     null comment '网络发送速率(MB/s)',
    disk_read_rate        decimal(10, 2)                     null comment '磁盘读取速率(MB/s)',
    disk_write_rate       decimal(10, 2)                     null comment '磁盘写入速率(MB/s)',
    open_file_descriptors bigint                             null comment '打开的文件描述符数',
    tcp_connections       int                                null comment 'TCP连接数',
    avg_response_time     bigint                             null comment '平均响应时间(ms)',
    status                varchar(32)                        null comment '状态',
    response_time         int                                null comment '响应时间(ms)',
    create_time           datetime default CURRENT_TIMESTAMP null comment '创建时间'
)
    comment 'Worker心跳记录表' charset = utf8mb4
                               row_format = DYNAMIC;

create index idx_time
    on worker_heartbeat (heartbeat_time);

create index idx_worker_time
    on worker_heartbeat (worker_id, heartbeat_time);

create table worker_metrics
(
    id           bigint auto_increment
        primary key,
    worker_id    varchar(64)                        not null comment 'Worker节点ID',
    metric_type  varchar(64)                        not null comment '指标类型：cpu,memory,jvm_heap等',
    metric_value decimal(10, 2)                     not null comment '指标值',
    metric_unit  varchar(16)                        null comment '单位：%,MB,count',
    tags         json                               null comment '标签',
    collect_time datetime                           not null comment '采集时间',
    create_time  datetime default CURRENT_TIMESTAMP null comment '创建时间'
)
    comment 'Worker监控指标表' charset = utf8mb4
                               row_format = DYNAMIC;

create index idx_time
    on worker_metrics (collect_time);

create index idx_worker_type_time
    on worker_metrics (worker_id, metric_type, collect_time);

create table worker_node
(
    id                   varchar(64)                          not null comment 'Worker节点ID'
        primary key,
    name                 varchar(128)                         not null comment 'Worker名称',
    host                 varchar(128)                         not null comment '主机地址',
    port                 int                                  not null comment '端口号',
    version              varchar(32)                          null comment 'Worker版本',
    status               varchar(32)                          not null comment '状态：ONLINE,OFFLINE,DISABLED,ABNORMAL',
    max_concurrent_tasks int        default 50                null comment '最大并发任务数',
    heartbeat_interval   int        default 15                null comment '心跳间隔（秒）',
    active_tasks         int        default 0                 null comment '当前活跃任务数',
    weight               int        default 100               null comment '负载均衡权重（数值越大优先级越高）',
    register_time        datetime                             null comment '注册时间',
    last_heartbeat_time  datetime                             null comment '最后心跳时间',
    enabled              tinyint(1) default 1                 null comment '是否启用',
    tags                 json                                 null comment '标签（数组）',
    metadata             json                                 null comment '扩展元数据',
    create_time          datetime   default CURRENT_TIMESTAMP null comment '创建时间',
    update_time          datetime   default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间'
)
    comment 'Worker节点信息表' charset = utf8mb4
                               row_format = DYNAMIC;

create index idx_heartbeat
    on worker_node (last_heartbeat_time);

create index idx_host_port
    on worker_node (host, port);

create index idx_status
    on worker_node (status);

create table worker_task_history
(
    id            bigint auto_increment
        primary key,
    task_id       varchar(64)                        not null comment '任务ID',
    worker_id     varchar(64)                        not null comment 'Worker节点ID',
    action_code   varchar(128)                       null comment 'Action编码',
    dag_name      varchar(256)                       null comment 'DAG名称',
    action_class  varchar(256)                       null comment 'Action类名',
    status        varchar(32)                        not null comment '任务状态：CREATED,RUNNING,COMPLETED,FAILED,TIMED_OUT',
    start_time    datetime                           null comment '开始时间',
    end_time      datetime                           null comment '结束时间',
    duration      bigint                             null comment '执行时长(ms)',
    success       tinyint(1)                         null comment '是否成功',
    error_message text                               null comment '错误信息',
    error_code    varchar(32)                        null comment '错误码',
    trace_id      varchar(64)                        null comment 'SkyWalking TraceId',
    params        json                               null comment '任务参数',
    result        json                               null comment '执行结果',
    create_time   datetime default CURRENT_TIMESTAMP null comment '创建时间',
    update_time   datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间'
)
    comment 'Worker任务历史表' charset = utf8mb4
                               row_format = DYNAMIC;

create index idx_status
    on worker_task_history (status);

create index idx_task
    on worker_task_history (task_id);

create index idx_time
    on worker_task_history (start_time);

create index idx_trace
    on worker_task_history (trace_id);

create index idx_worker
    on worker_task_history (worker_id);

create definer = root@`%` view api_test_view as
select `bigprime`.`api_test`.`id`           AS `id`,
       `bigprime`.`api_test`.`chinese_name` AS `chinese_name`,
       `bigprime`.`api_test`.`id_card`      AS `id_card`,
       `bigprime`.`api_test`.`fixed_phone`  AS `fixed_phone`,
       `bigprime`.`api_test`.`mobile_phone` AS `mobile_phone`,
       `bigprime`.`api_test`.`address`      AS `address`,
       `bigprime`.`api_test`.`email`        AS `email`,
       `bigprime`.`api_test`.`password`     AS `password`,
       `bigprime`.`api_test`.`bank_card`    AS `bank_card`,
       `bigprime`.`api_test`.`regex`        AS `regex`,
       `bigprime`.`api_test`.`md5`          AS `md5`,
       `bigprime`.`api_test`.`sha1`         AS `sha1`,
       `bigprime`.`api_test`.`sha256`       AS `sha256`,
       `bigprime`.`api_test`.`sha512`       AS `sha512`,
       `bigprime`.`api_test`.`des`          AS `des`,
       `bigprime`.`api_test`.`aes`          AS `aes`
from `bigprime`.`api_test`;

-- comment on column api_test_view.id not supported: id

-- comment on column api_test_view.chinese_name not supported: 中文名

-- comment on column api_test_view.id_card not supported: 身份证

-- comment on column api_test_view.fixed_phone not supported: 座机号

-- comment on column api_test_view.mobile_phone not supported: 手机号

-- comment on column api_test_view.address not supported: 地址

-- comment on column api_test_view.email not supported: 电子邮件

-- comment on column api_test_view.password not supported: 密码

-- comment on column api_test_view.bank_card not supported: 银行卡

-- comment on column api_test_view.regex not supported: 正则替换

-- comment on column api_test_view.md5 not supported: md5

-- comment on column api_test_view.sha1 not supported: sha1

-- comment on column api_test_view.sha256 not supported: sha256

-- comment on column api_test_view.sha512 not supported: sha512

-- comment on column api_test_view.des not supported: des

-- comment on column api_test_view.aes not supported: aes

