-- ============================================================
-- bigprime-ai Phase 1 建表 SQL
-- AI 基础设施：提供商、模型、MCP 服务器
-- ============================================================

-- AI 提供商表
CREATE TABLE IF NOT EXISTS `ai_provider` (
    `id`           VARCHAR(64)  NOT NULL COMMENT '主键 ID（雪花）',
    `name`         VARCHAR(128) NOT NULL COMMENT '提供商名称（用户自定义）',
    `type`         VARCHAR(32)  NOT NULL COMMENT '类型：OPENAI/ANTHROPIC/OLLAMA/DEEPSEEK/CUSTOM',
    `api_endpoint` VARCHAR(512)          COMMENT 'API 地址（Ollama/自定义必填）',
    `api_key`      VARCHAR(512)          COMMENT 'API Key（AES-256 加密存储）',
    `status`       TINYINT      NOT NULL DEFAULT 1 COMMENT '状态：1-启用 0-禁用',
    `sort_order`   INT          NOT NULL DEFAULT 0 COMMENT '排序权重',
    `creator`      VARCHAR(64)           COMMENT '创建人 ID',
    `creator_name` VARCHAR(128)          COMMENT '创建人名称',
    `create_time`  DATETIME              COMMENT '创建时间',
    `updater`      VARCHAR(64)           COMMENT '更新人 ID',
    `updater_name` VARCHAR(128)          COMMENT '更新人名称',
    `update_time`  DATETIME              COMMENT '更新时间',
    `deleted`      TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'AI 提供商表';

-- AI 模型表
CREATE TABLE IF NOT EXISTS `ai_model` (
    `id`               VARCHAR(64)  NOT NULL COMMENT '主键 ID（雪花）',
    `provider_id`      VARCHAR(64)  NOT NULL COMMENT '所属提供商 ID',
    `model_type`       VARCHAR(32)  NOT NULL DEFAULT 'CHAT' COMMENT '模型类型：CHAT/EMBEDDING/RERANK/IMAGE',
    `model_name`       VARCHAR(128) NOT NULL COMMENT '模型标识（如 gpt-4o、llama3）',
    `display_name`     VARCHAR(128)          COMMENT '展示名称',
    `max_tokens`       INT                   COMMENT '最大 Token 数',
    `supports_vision`  TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '是否支持视觉（多模态）',
    `supports_tools`   TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '是否支持工具调用',
    `supports_stream`  TINYINT(1)   NOT NULL DEFAULT 1 COMMENT '是否支持流式输出',
    `input_price_per_k`  DECIMAL(10,6)        COMMENT '输入 Token 单价（美元/1K）',
    `output_price_per_k` DECIMAL(10,6)        COMMENT '输出 Token 单价（美元/1K）',
    `status`           TINYINT      NOT NULL DEFAULT 1 COMMENT '状态：1-启用 0-禁用',
    `sort_order`       INT          NOT NULL DEFAULT 0 COMMENT '排序权重',
    `creator`          VARCHAR(64)           COMMENT '创建人 ID',
    `creator_name`     VARCHAR(128)          COMMENT '创建人名称',
    `create_time`      DATETIME              COMMENT '创建时间',
    `updater`          VARCHAR(64)           COMMENT '更新人 ID',
    `updater_name`     VARCHAR(128)          COMMENT '更新人名称',
    `update_time`      DATETIME              COMMENT '更新时间',
    `deleted`          TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    PRIMARY KEY (`id`),
    KEY `idx_provider_id` (`provider_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'AI 模型表';

-- MCP 服务器表
CREATE TABLE IF NOT EXISTS `ai_mcp_server` (
    `id`             VARCHAR(64)  NOT NULL COMMENT '主键 ID（雪花）',
    `name`           VARCHAR(128) NOT NULL COMMENT '服务器名称',
    `description`    TEXT                  COMMENT '描述',
    `icon_url`       VARCHAR(512)          COMMENT '图标 URL',
    `type`           VARCHAR(32)  NOT NULL COMMENT '类型：BUILTIN/MARKET/CUSTOM',
    `transport`      VARCHAR(32)  NOT NULL COMMENT '传输协议：STDIO/SSE/HTTP',
    `endpoint`       VARCHAR(512)          COMMENT '连接地址（SSE/HTTP 使用）',
    `command`        VARCHAR(512)          COMMENT '命令（STDIO 使用）',
    `args`           TEXT                  COMMENT '命令参数（JSON 数组）',
    `env_vars`       TEXT                  COMMENT '环境变量（JSON 对象）',
    `config_schema`  TEXT                  COMMENT '配置 Schema（JSON Schema）',
    `config_values`  TEXT                  COMMENT '用户配置值（JSON 对象，加密）',
    `is_configured`  TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '是否已完成配置',
    `status`         TINYINT      NOT NULL DEFAULT 1 COMMENT '状态：1-启用 0-禁用',
    `creator`        VARCHAR(64)           COMMENT '创建人 ID',
    `creator_name`   VARCHAR(128)          COMMENT '创建人名称',
    `create_time`    DATETIME              COMMENT '创建时间',
    `updater`        VARCHAR(64)           COMMENT '更新人 ID',
    `updater_name`   VARCHAR(128)          COMMENT '更新人名称',
    `update_time`    DATETIME              COMMENT '更新时间',
    `deleted`        TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'MCP 服务器表';

-- ============================================================
-- AI 中心菜单初始化
-- sys_menu 表字段: id(bigint auto_increment), name, cn_name, en_name, url, icon, pid, sort, type, authority
-- type=3 表示前端菜单
-- pid=0 表示一级菜单
-- 注意: 执行前请先查询现有最大ID，避免冲突
-- 建议: 通过系统管理->菜单管理界面手动录入，或执行以下 SQL
-- ============================================================

-- AI 中心 - 父菜单（pid=0 一级菜单，sort=90）
INSERT IGNORE INTO `sys_menu` (`name`, `cn_name`, `en_name`, `url`, `icon`, `pid`, `sort`, `type`, `authority`, `creator`, `create_time`, `deleted`)
VALUES ('menu.ai', 'AI 中心', 'AI Center', NULL, 'IconStar', 0, 90, 3, NULL, 1, NOW(), 0);

-- AI 中心 - 模型服务子菜单
INSERT IGNORE INTO `sys_menu` (`name`, `cn_name`, `en_name`, `url`, `icon`, `pid`, `sort`, `type`, `authority`, `creator`, `create_time`, `deleted`)
SELECT 'menu.ai.provider', 'AI 模型服务', 'AI Model Service', 'ai/provider-list', 'IconSetting', id, 1, 3, NULL, 1, NOW(), 0
FROM `sys_menu` WHERE `name` = 'menu.ai' LIMIT 1;

-- AI 中心 - MCP 服务器子菜单
INSERT IGNORE INTO `sys_menu` (`name`, `cn_name`, `en_name`, `url`, `icon`, `pid`, `sort`, `type`, `authority`, `creator`, `create_time`, `deleted`)
SELECT 'menu.ai.mcp', 'MCP 服务器', 'MCP Servers', 'ai/mcp-server-list', 'IconSetting', id, 2, 3, NULL, 1, NOW(), 0
FROM `sys_menu` WHERE `name` = 'menu.ai' LIMIT 1;

-- AI 中心 - AI 对话子菜单
INSERT IGNORE INTO `sys_menu` (`name`, `cn_name`, `en_name`, `url`, `icon`, `pid`, `sort`, `type`, `authority`, `creator`, `create_time`, `deleted`)
SELECT 'menu.ai.chat', 'AI 对话', 'AI Chat', 'ai/chat', 'IconChat', id, 3, 3, NULL, 1, NOW(), 0
FROM `sys_menu` WHERE `name` = 'menu.ai' LIMIT 1;

-- AI 中心 - AI 助手子菜单
INSERT IGNORE INTO `sys_menu` (`name`, `cn_name`, `en_name`, `url`, `icon`, `pid`, `sort`, `type`, `authority`, `creator`, `create_time`, `deleted`)
SELECT 'menu.ai.assistant', 'AI 助手', 'AI Assistant', 'ai/assistant-list', 'IconHelpCircle', id, 4, 3, NULL, 1, NOW(), 0
FROM `sys_menu` WHERE `name` = 'menu.ai' LIMIT 1;

-- ============================================================
-- Phase 2: AI 对话系统建表 SQL
-- ai_session / ai_message / ai_assistant
-- ============================================================

-- AI 对话会话表
CREATE TABLE IF NOT EXISTS `ai_session` (
    `id`            VARCHAR(64)  NOT NULL COMMENT '主键 ID（雪花）',
    `title`         VARCHAR(256)          COMMENT '会话标题（自动从第一条消息截取）',
    `assistant_id`  VARCHAR(64)           COMMENT '关联助手 ID（为空使用默认设置）',
    `model_id`      VARCHAR(64)  NOT NULL COMMENT '使用的模型 ID',
    `system_prompt` TEXT                  COMMENT '系统提示词（覆盖助手默认设置）',
    `temperature`   DOUBLE                COMMENT '温度参数（0.0-2.0）',
    `max_tokens`    INT                   COMMENT '最大 Token 数',
    `message_count` INT          NOT NULL DEFAULT 0 COMMENT '消息数量（冗余）',
    `status`        TINYINT      NOT NULL DEFAULT 1 COMMENT '状态：1-活跃 0-归档',
    `creator`       VARCHAR(64)           COMMENT '创建人 ID',
    `creator_name`  VARCHAR(128)          COMMENT '创建人名称',
    `create_time`   DATETIME              COMMENT '创建时间',
    `updater`       VARCHAR(64)           COMMENT '更新人 ID',
    `updater_name`  VARCHAR(128)          COMMENT '更新人名称',
    `update_time`   DATETIME              COMMENT '更新时间',
    `deleted`       TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    PRIMARY KEY (`id`),
    KEY `idx_creator` (`creator`),
    KEY `idx_model_id` (`model_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'AI 对话会话表';

-- AI 对话消息表
CREATE TABLE IF NOT EXISTS `ai_message` (
    `id`            VARCHAR(64)  NOT NULL COMMENT '主键 ID（雪花）',
    `session_id`    VARCHAR(64)  NOT NULL COMMENT '所属会话 ID',
    `role`          VARCHAR(32)  NOT NULL COMMENT '消息角色：USER / ASSISTANT / SYSTEM',
    `content`       LONGTEXT              COMMENT '消息内容（支持 Markdown）',
    `input_tokens`  INT                   COMMENT '消耗的输入 Token 数',
    `output_tokens` INT                   COMMENT '消耗的输出 Token 数',
    `sequence`      INT          NOT NULL DEFAULT 0 COMMENT '消息序号（会话内有序）',
    `model_id`      VARCHAR(64)           COMMENT '实际使用的模型 ID',
    `finish_time`   DATETIME              COMMENT '完成时间（流式结束时间）',
    `creator`       VARCHAR(64)           COMMENT '创建人 ID',
    `creator_name`  VARCHAR(128)          COMMENT '创建人名称',
    `create_time`   DATETIME              COMMENT '创建时间',
    `updater`       VARCHAR(64)           COMMENT '更新人 ID',
    `updater_name`  VARCHAR(128)          COMMENT '更新人名称',
    `update_time`   DATETIME              COMMENT '更新时间',
    `deleted`       TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    PRIMARY KEY (`id`),
    KEY `idx_session_id` (`session_id`),
    KEY `idx_session_seq` (`session_id`, `sequence`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'AI 对话消息表';

-- AI 助手配置表
CREATE TABLE IF NOT EXISTS `ai_assistant` (
    `id`                VARCHAR(64)  NOT NULL COMMENT '主键 ID（雪花）',
    `name`              VARCHAR(128) NOT NULL COMMENT '助手名称',
    `alias`             VARCHAR(128) UNIQUE      COMMENT '别名（唯一英文标识，供其他模块调用）',
    `enabled_mcp_servers` TEXT                   COMMENT '已启用的 MCP 服务器 ID 列表（JSON 数组）',
    `enabled_skills`    TEXT                     COMMENT '已启用的技能 ID 列表（JSON 数组）',
    `knowledge_base_ids` TEXT                    COMMENT '绑定的知识库 ID 列表（JSON 数组）',
    `memory_enabled`    TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '是否启用记忆：0-禁用 1-启用',
    `description`       TEXT                     COMMENT '描述',
    `avatar`            VARCHAR(512)             COMMENT '头像 URL 或 emoji',
    `model_id`          VARCHAR(64)  NOT NULL    COMMENT '绑定的模型 ID',
    `system_prompt`     TEXT                     COMMENT '系统提示词',
    `opening_message`   TEXT                     COMMENT '开场白',
    `temperature`       DOUBLE                   COMMENT '温度参数（0.0-2.0）',
    `max_tokens`        INT                      COMMENT '最大 Token 数',
    `is_public`         TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '是否公开：0-私有 1-公开',
    `status`            TINYINT      NOT NULL DEFAULT 1 COMMENT '状态：1-启用 0-禁用',
    `sort_order`        INT          NOT NULL DEFAULT 0 COMMENT '排序权重',
    `category`          VARCHAR(32)  NOT NULL DEFAULT 'general' COMMENT '助手分类：general(通用)/code(代码)/data(数据)',
    `creator`           VARCHAR(64)              COMMENT '创建人 ID',
    `creator_name`      VARCHAR(128)             COMMENT '创建人名称',
    `create_time`       DATETIME                 COMMENT '创建时间',
    `updater`           VARCHAR(64)              COMMENT '更新人 ID',
    `updater_name`      VARCHAR(128)             COMMENT '更新人名称',
    `update_time`       DATETIME                 COMMENT '更新时间',
    `deleted`           TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    PRIMARY KEY (`id`),
    KEY `idx_model_id` (`model_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'AI 助手配置表';

-- ============================================================
-- Phase 2 补充菜单
-- ============================================================

-- AI 中心 - 助手管理子菜单
INSERT IGNORE INTO `sys_menu` (`name`, `cn_name`, `en_name`, `url`, `icon`, `pid`, `sort`, `type`, `authority`, `creator`, `create_time`, `deleted`)
SELECT 'menu.ai.assistant', 'AI 助手', 'AI Assistant', 'ai/assistant-list', 'IconRobot', id, 4, 3, NULL, 1, NOW(), 0
FROM `sys_menu` WHERE `name` = 'menu.ai' LIMIT 1;

-- AI 中心 - 提示词库子菜单
INSERT IGNORE INTO `sys_menu` (`name`, `cn_name`, `en_name`, `url`, `icon`, `pid`, `sort`, `type`, `authority`, `creator`, `create_time`, `deleted`)
SELECT 'menu.ai.prompt', '提示词库', 'Prompt Library', 'ai/prompt-list', 'IconEdit', id, 5, 3, NULL, 1, NOW(), 0
FROM `sys_menu` WHERE `name` = 'menu.ai' LIMIT 1;

-- ============================================================
-- Phase 4: 提示词管理建表
-- ============================================================

-- 提示词表
CREATE TABLE IF NOT EXISTS `ai_prompt` (
    `id`           VARCHAR(64)  NOT NULL COMMENT '主键 ID（雪花）',
    `title`        VARCHAR(256) NOT NULL COMMENT '提示词标题',
    `description`  VARCHAR(512)          COMMENT '提示词描述',
    `variables`    VARCHAR(512)          COMMENT '变量列表（JSON 数组，如 ["name","lang"]）',
    `content`      LONGTEXT     NOT NULL COMMENT '提示词内容（支持变量 {{变量名}}）',
    `category`     VARCHAR(64)           COMMENT '分类（如：写作/编程/分析/翻译）',
    `tags`         VARCHAR(512)          COMMENT '标签（JSON 数组）',
    `is_public`    TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '是否公开：0-私有 1-公开',
    `usage_count`  INT          NOT NULL DEFAULT 0 COMMENT '使用次数',
    `sort_order`   INT          NOT NULL DEFAULT 0 COMMENT '排序权重',
    `status`       TINYINT      NOT NULL DEFAULT 1 COMMENT '状态：1-启用 0-禁用',
    `creator`      VARCHAR(64)           COMMENT '创建人 ID',
    `creator_name` VARCHAR(128)          COMMENT '创建人名称',
    `create_time`  DATETIME              COMMENT '创建时间',
    `updater`      VARCHAR(64)           COMMENT '更新人 ID',
    `updater_name` VARCHAR(128)          COMMENT '更新人名称',
    `update_time`  DATETIME              COMMENT '更新时间',
    `deleted`      TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    PRIMARY KEY (`id`),
    KEY `idx_category` (`category`),
    KEY `idx_creator` (`creator`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'AI 提示词表';

-- ============================================================
-- Phase 4: 知识库建表
-- ============================================================

-- 知识库表
CREATE TABLE IF NOT EXISTS `ai_knowledge_base` (
    `id`               VARCHAR(64)  NOT NULL COMMENT '主键 ID（雪花）',
    `name`             VARCHAR(128) NOT NULL COMMENT '知识库名称',
    `description`      TEXT                  COMMENT '描述',
    `embedding_model_id` VARCHAR(64)         COMMENT '向量化模型 ID（关联 ai_model，type=EMBEDDING）',
    `rerank_model_id`  VARCHAR(64)           COMMENT '重排序模型 ID（关联 ai_model，type=RERANK）',
    `graph_model_id`   VARCHAR(64)           COMMENT '图谱语义模型 ID（关联 ai_model，type=CHAT）',
    `chunk_size`       INT          NOT NULL DEFAULT 500 COMMENT '分块大小（字符数）',
    `chunk_overlap`    INT          NOT NULL DEFAULT 50  COMMENT '分块重叠字符数',
    `chunk_strategy`   VARCHAR(32)  NOT NULL DEFAULT 'FIXED' COMMENT '分块策略：FIXED/SENTENCE',
    `retrieval_mode`   VARCHAR(32)  NOT NULL DEFAULT 'VECTOR' COMMENT '检索模式：VECTOR/GRAPH/HYBRID',
    `doc_count`        INT          NOT NULL DEFAULT 0 COMMENT '文档数量',
    `status`           TINYINT      NOT NULL DEFAULT 1 COMMENT '状态：1-启用 0-禁用',
    `vector_connector_id` VARCHAR(64)        COMMENT '向量数据库连接器 ID（Milvus）',
    `graph_connector_id`  VARCHAR(64)        COMMENT '图数据库连接器 ID（Neo4j）',
    `creator`          VARCHAR(64)           COMMENT '创建人 ID',
    `creator_name`     VARCHAR(128)          COMMENT '创建人名称',
    `create_time`      DATETIME              COMMENT '创建时间',
    `updater`          VARCHAR(64)           COMMENT '更新人 ID',
    `updater_name`     VARCHAR(128)          COMMENT '更新人名称',
    `update_time`      DATETIME              COMMENT '更新时间',
    `deleted`          TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'AI 知识库表';

-- 知识库文档表
CREATE TABLE IF NOT EXISTS `ai_document` (
    `id`               VARCHAR(64)  NOT NULL COMMENT '主键 ID（雪花）',
    `knowledge_base_id` VARCHAR(64) NOT NULL COMMENT '所属知识库 ID',
    `file_name`        VARCHAR(256) NOT NULL COMMENT '文件名',
    `file_type`        VARCHAR(32)           COMMENT '文件类型（PDF/WORD/MARKDOWN/TXT）',
    `file_size`        BIGINT                COMMENT '文件大小（字节）',
    `file_content`     LONGTEXT              COMMENT '文件文本内容（提取后存储）',
    `chunk_count`      INT          NOT NULL DEFAULT 0 COMMENT '分块数量',
    `graph_node_count` INT          NOT NULL DEFAULT 0 COMMENT '知识图谱节点数量',
    `status`           VARCHAR(32)  NOT NULL DEFAULT 'PENDING' COMMENT '状态：PENDING/PROCESSING/DONE/FAILED',
    `error_msg`        TEXT                  COMMENT '处理错误信息',
    `creator`          VARCHAR(64)           COMMENT '创建人 ID',
    `creator_name`     VARCHAR(128)          COMMENT '创建人名称',
    `create_time`      DATETIME              COMMENT '创建时间',
    `updater`          VARCHAR(64)           COMMENT '更新人 ID',
    `updater_name`     VARCHAR(128)          COMMENT '更新人名称',
    `update_time`      DATETIME              COMMENT '更新时间',
    `deleted`          TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    PRIMARY KEY (`id`),
    KEY `idx_kb_id` (`knowledge_base_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'AI 知识库文档表';

-- 知识库文档分块表（存储分块文本，向量索引在 Milvus 中）
CREATE TABLE IF NOT EXISTS `ai_document_chunk` (
    `id`           VARCHAR(64)  NOT NULL COMMENT '主键 ID（雪花）',
    `document_id`  VARCHAR(64)  NOT NULL COMMENT '所属文档 ID',
    `kb_id`        VARCHAR(64)  NOT NULL COMMENT '所属知识库 ID',
    `content`      LONGTEXT     NOT NULL COMMENT '分块文本内容',
    `chunk_index`  INT          NOT NULL DEFAULT 0 COMMENT '分块序号',
    `create_time`  DATETIME              COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_doc_id` (`document_id`),
    KEY `idx_kb_id` (`kb_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'AI 文档分块表';

-- ============================================================
-- Phase 4: 记忆系统建表
-- ============================================================

-- 用户记忆表
CREATE TABLE IF NOT EXISTS `ai_memory` (
    `id`          VARCHAR(64)  NOT NULL COMMENT '主键 ID（雪花）',
    `user_id`     VARCHAR(64)  NOT NULL COMMENT '用户 ID',
    `type`        VARCHAR(32)  NOT NULL DEFAULT 'LONG' COMMENT '记忆类型：SHORT-短期 / LONG-长期',
    `content`     TEXT         NOT NULL COMMENT '记忆内容',
    `importance`  INT          NOT NULL DEFAULT 5 COMMENT '重要性评分（1-10）',
    `source`      VARCHAR(32)           COMMENT '来源：CHAT/MANUAL',
    `session_id`  VARCHAR(64)           COMMENT '来源会话 ID',
    `expire_at`   DATETIME              COMMENT '过期时间（NULL 表示永久）',
    `create_time` DATETIME              COMMENT '创建时间',
    `deleted`     TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_type` (`type`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '用户 AI 记忆表';

-- ============================================================
-- Phase 4: 用量统计建表
-- ============================================================

-- 用量记录表
CREATE TABLE IF NOT EXISTS `ai_usage_record` (
    `id`               VARCHAR(64)  NOT NULL COMMENT '主键 ID（雪花）',
    `user_id`          VARCHAR(64)  NOT NULL COMMENT '用户 ID',
    `user_name`        VARCHAR(128)          COMMENT '用户名',
    `model_id`         VARCHAR(64)           COMMENT '使用的模型 ID',
    `model_name`       VARCHAR(128)          COMMENT '模型名称',
    `session_id`       VARCHAR(64)           COMMENT '关联会话 ID',
    `prompt_tokens`    INT          NOT NULL DEFAULT 0 COMMENT '输入 Token 数',
    `completion_tokens` INT         NOT NULL DEFAULT 0 COMMENT '输出 Token 数',
    `total_tokens`     INT          NOT NULL DEFAULT 0 COMMENT '总 Token 数',
    `estimated_cost`   DECIMAL(10,6) NOT NULL DEFAULT 0 COMMENT '估算费用（美元）',
    `create_time`      DATETIME              COMMENT '调用时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_model_id` (`model_id`),
    KEY `idx_create_time` (`create_time`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'AI 用量记录表';

-- 用量配额表
CREATE TABLE IF NOT EXISTS `ai_usage_quota` (
    `id`            VARCHAR(64)  NOT NULL COMMENT '主键 ID（雪花）',
    `user_id`       VARCHAR(64)  NOT NULL COMMENT '用户 ID',
    `model_id`      VARCHAR(64)           COMMENT '模型 ID（NULL 表示全局配额）',
    `monthly_limit` BIGINT       NOT NULL DEFAULT 1000000 COMMENT '月度 Token 配额',
    `used_tokens`   BIGINT       NOT NULL DEFAULT 0 COMMENT '已用 Token 数',
    `month`         VARCHAR(7)   NOT NULL COMMENT '月份（yyyy-MM）',
    `create_time`   DATETIME              COMMENT '创建时间',
    `update_time`   DATETIME              COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_model_month` (`user_id`, `model_id`, `month`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'AI 用量配额表';

-- ============================================================
-- Phase 4: API 密钥管理建表
-- ============================================================

-- API 密钥表
CREATE TABLE IF NOT EXISTS `ai_api_key` (
    `id`           VARCHAR(64)  NOT NULL COMMENT '主键 ID（雪花）',
    `name`         VARCHAR(128) NOT NULL COMMENT '密钥名称（用途描述）',
    `key_prefix`   VARCHAR(16)  NOT NULL COMMENT '密钥前缀（明文，用于展示）',
    `key_hash`     VARCHAR(256) NOT NULL COMMENT '密钥哈希（SHA-256，用于验证）',
    `user_id`      VARCHAR(64)  NOT NULL COMMENT '所属用户 ID',
    `rate_limit`   INT          NOT NULL DEFAULT 100 COMMENT '每分钟调用限制',
    `total_calls`  BIGINT       NOT NULL DEFAULT 0 COMMENT '累计调用次数',
    `last_used_at` DATETIME              COMMENT '最后使用时间',
    `expires_at`   DATETIME              COMMENT '过期时间（NULL 表示永不过期）',
    `status`       TINYINT      NOT NULL DEFAULT 1 COMMENT '状态：1-启用 0-禁用',
    `creator`      VARCHAR(64)           COMMENT '创建人 ID',
    `creator_name` VARCHAR(128)          COMMENT '创建人名称',
    `create_time`  DATETIME              COMMENT '创建时间',
    `deleted`      TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_key_hash` (`key_hash`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'AI API 密钥表';

-- API 调用日志表
CREATE TABLE IF NOT EXISTS `ai_api_call_log` (
    `id`               VARCHAR(64)  NOT NULL COMMENT '主键 ID（雪花）',
    `api_key_id`       VARCHAR(64)  NOT NULL COMMENT '使用的 API 密钥 ID',
    `endpoint`         VARCHAR(256)          COMMENT '调用接口路径',
    `request_tokens`   INT          NOT NULL DEFAULT 0 COMMENT '请求 Token 数',
    `response_tokens`  INT          NOT NULL DEFAULT 0 COMMENT '响应 Token 数',
    `latency_ms`       INT          NOT NULL DEFAULT 0 COMMENT '响应耗时（毫秒）',
    `status`           VARCHAR(32)  NOT NULL DEFAULT 'SUCCESS' COMMENT '状态：SUCCESS/ERROR/RATE_LIMITED',
    `error_msg`        TEXT                  COMMENT '错误信息',
    `create_time`      DATETIME              COMMENT '调用时间',
    PRIMARY KEY (`id`),
    KEY `idx_api_key_id` (`api_key_id`),
    KEY `idx_create_time` (`create_time`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'AI API 调用日志表';

-- ============================================================
-- Phase 4: 网络搜索配置建表
-- ============================================================

-- 搜索引擎配置表
CREATE TABLE IF NOT EXISTS `ai_search_config` (
    `id`           VARCHAR(64)  NOT NULL COMMENT '主键 ID（雪花）',
    `engine`       VARCHAR(32)  NOT NULL COMMENT '搜索引擎：BING/BRAVE/SERPAPI',
    `api_key`      VARCHAR(512)          COMMENT 'API Key（AES-256 加密）',
    `endpoint`     VARCHAR(512)          COMMENT 'API 地址（自定义时使用）',
    `max_results`  INT          NOT NULL DEFAULT 10 COMMENT '最大返回结果数',
    `is_default`   TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '是否为默认搜索引擎',
    `status`       TINYINT      NOT NULL DEFAULT 1 COMMENT '状态：1-启用 0-禁用',
    `creator`      VARCHAR(64)           COMMENT '创建人 ID',
    `creator_name` VARCHAR(128)          COMMENT '创建人名称',
    `create_time`  DATETIME              COMMENT '创建时间',
    `updater`      VARCHAR(64)           COMMENT '更新人 ID',
    `updater_name` VARCHAR(128)          COMMENT '更新人名称',
    `update_time`  DATETIME              COMMENT '更新时间',
    `deleted`      TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'AI 网络搜索配置表';

-- ============================================================
-- Phase 4 菜单初始化
-- ============================================================

-- AI 中心 - 知识库子菜单
INSERT IGNORE INTO `sys_menu` (`name`, `cn_name`, `en_name`, `url`, `icon`, `pid`, `sort`, `type`, `authority`, `creator`, `create_time`, `deleted`)
SELECT 'menu.ai.knowledge', '知识库', 'Knowledge Base', 'ai/knowledge-list', 'IconBook', id, 6, 3, NULL, 1, NOW(), 0
FROM `sys_menu` WHERE `name` = 'menu.ai' LIMIT 1;

-- AI 中心 - 记忆管理子菜单
INSERT IGNORE INTO `sys_menu` (`name`, `cn_name`, `en_name`, `url`, `icon`, `pid`, `sort`, `type`, `authority`, `creator`, `create_time`, `deleted`)
SELECT 'menu.ai.memory', '记忆管理', 'Memory', 'ai/memory-list', 'IconStorage', id, 7, 3, NULL, 1, NOW(), 0
FROM `sys_menu` WHERE `name` = 'menu.ai' LIMIT 1;

-- AI 中心 - 用量统计子菜单
INSERT IGNORE INTO `sys_menu` (`name`, `cn_name`, `en_name`, `url`, `icon`, `pid`, `sort`, `type`, `authority`, `creator`, `create_time`, `deleted`)
SELECT 'menu.ai.usage', '用量统计', 'Usage Stats', 'ai/usage-stats', 'IconBarChart', id, 8, 3, NULL, 1, NOW(), 0
FROM `sys_menu` WHERE `name` = 'menu.ai' LIMIT 1;

-- AI 中心 - API 服务器子菜单
INSERT IGNORE INTO `sys_menu` (`name`, `cn_name`, `en_name`, `url`, `icon`, `pid`, `sort`, `type`, `authority`, `creator`, `create_time`, `deleted`)
SELECT 'menu.ai.apikey', 'API 服务器', 'API Server', 'ai/api-key-list', 'IconKey', id, 9, 3, NULL, 1, NOW(), 0
FROM `sys_menu` WHERE `name` = 'menu.ai' LIMIT 1;

-- AI 中心 - 网络搜索子菜单
INSERT IGNORE INTO `sys_menu` (`name`, `cn_name`, `en_name`, `url`, `icon`, `pid`, `sort`, `type`, `authority`, `creator`, `create_time`, `deleted`)
SELECT 'menu.ai.search', '网络搜索', 'Web Search', 'ai/search-config', 'IconSearch', id, 10, 3, NULL, 1, NOW(), 0
FROM `sys_menu` WHERE `name` = 'menu.ai' LIMIT 1;

-- ============================================================
-- 内置 MCP 服务器预置数据
-- ============================================================
INSERT IGNORE INTO `ai_mcp_server` (`id`, `name`, `description`, `type`, `transport`, `endpoint`, `status`, `is_configured`, `creator`, `create_time`, `deleted`)
VALUES
    ('mcp-builtin-filesystem', '文件系统', '读取/写入/列出本地文件系统文件', 'BUILTIN', 'STDIO', NULL, 1, 1, 1, NOW(), 0),
    ('mcp-builtin-fetch',      'HTTP 请求', '发送 HTTP 请求并返回页面内容（fetch）', 'BUILTIN', 'HTTP', NULL, 1, 1, 1, NOW(), 0),
    ('mcp-builtin-browser',    '浏览器操作', '通过 Playwright 控制浏览器（截图/点击/填表）', 'BUILTIN', 'STDIO', NULL, 1, 1, 1, NOW(), 0);

-- 修复内置 MCP 服务器配置状态（历史数据修正）
UPDATE `ai_mcp_server` SET `is_configured` = 1, `endpoint` = NULL
WHERE `id` IN ('mcp-builtin-filesystem', 'mcp-builtin-fetch', 'mcp-builtin-browser') AND `deleted` = 0;

-- ============================================================
-- Phase 4: 技能管理建表
-- ============================================================

-- AI 技能表
CREATE TABLE IF NOT EXISTS `ai_skill` (
    `id`            VARCHAR(64)  NOT NULL COMMENT '主键 ID（雪花）',
    `name`          VARCHAR(128) NOT NULL COMMENT '技能标识（全局唯一）',
    `display_name`  VARCHAR(128)          COMMENT '技能显示名称',
    `description`   TEXT                  COMMENT '技能描述（向 LLM 暴露的功能说明）',
    `category`      VARCHAR(64)           COMMENT '分类（search/compute/data/crawler/other）',
    `input_schema`  TEXT                  COMMENT '输入参数 Schema（JSON Schema）',
    `output_schema` TEXT                  COMMENT '输出结果 Schema（JSON Schema）',
    `source_type`   VARCHAR(32)  NOT NULL DEFAULT 'CUSTOM' COMMENT '来源：BUILTIN/CUSTOM/MARKET',
    `execute_type`  VARCHAR(32)  NOT NULL DEFAULT 'HTTP' COMMENT '执行方式：HOSTED_JAVA/HTTP/SCRIPT',
    `code`          LONGTEXT              COMMENT '技能代码（SCRIPT类型时存储）',
    `endpoint`      VARCHAR(512)          COMMENT '外部接口 URL（HTTP类型）',
    `http_method`   VARCHAR(8)            COMMENT 'HTTP 方法（GET/POST）',
    `headers`       TEXT                  COMMENT '请求头（JSON）',
    `version`       VARCHAR(32)           COMMENT '版本号',
    `icon`          VARCHAR(128)          COMMENT '图标（emoji 或 URL）',
    `tags`          VARCHAR(512)          COMMENT '标签（JSON 数组）',
    `is_public`     TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '是否公开：0-私有 1-公开',
    `status`        TINYINT      NOT NULL DEFAULT 1 COMMENT '状态：1-启用 0-禁用',
    `sort_order`    INT          NOT NULL DEFAULT 0 COMMENT '排序权重',
    `call_count`    BIGINT       NOT NULL DEFAULT 0 COMMENT '调用次数统计',
    `creator`       VARCHAR(64)           COMMENT '创建人 ID',
    `creator_name`  VARCHAR(128)          COMMENT '创建人名称',
    `create_time`   DATETIME              COMMENT '创建时间',
    `updater`       VARCHAR(64)           COMMENT '更新人 ID',
    `updater_name`  VARCHAR(128)          COMMENT '更新人名称',
    `update_time`   DATETIME              COMMENT '更新时间',
    `deleted`       TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_skill_name` (`name`),
    KEY `idx_category` (`category`),
    KEY `idx_source_type` (`source_type`),
    KEY `idx_status` (`status`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'AI 技能表';

-- AI 技能执行记录表
CREATE TABLE IF NOT EXISTS `ai_skill_execution` (
    `id`            VARCHAR(64)  NOT NULL COMMENT '主键 ID（雪花）',
    `skill_id`      VARCHAR(64)           COMMENT '关联的技能 ID',
    `skill_name`    VARCHAR(128)          COMMENT '技能名称快照',
    `session_id`    VARCHAR(64)           COMMENT '关联的会话 ID',
    `assistant_id`  VARCHAR(64)           COMMENT '关联的助手 ID',
    `input`         TEXT                  COMMENT '输入参数（JSON）',
    `output`        TEXT                  COMMENT '执行输出（JSON）',
    `execution_time` BIGINT               COMMENT '执行耗时（毫秒）',
    `success`       TINYINT(1)   NOT NULL DEFAULT 1 COMMENT '是否成功：1-成功 0-失败',
    `error_msg`     TEXT                  COMMENT '错误信息',
    `error_stack`   TEXT                  COMMENT '错误堆栈',
    `creator`       VARCHAR(64)           COMMENT '执行用户 ID',
    `creator_name`  VARCHAR(128)          COMMENT '执行用户名称',
    `create_time`   DATETIME              COMMENT '执行时间',
    `deleted`       TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    PRIMARY KEY (`id`),
    KEY `idx_skill_id` (`skill_id`),
    KEY `idx_session_id` (`session_id`),
    KEY `idx_create_time` (`create_time`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'AI 技能执行记录表';

-- ============================================================
-- 技能菜单初始化
-- ============================================================

-- AI 中心 - 技能管理子菜单
INSERT IGNORE INTO `sys_menu` (`name`, `cn_name`, `en_name`, `url`, `icon`, `pid`, `sort`, `type`, `authority`, `creator`, `create_time`, `deleted`)
SELECT 'menu.ai.skill', '技能管理', 'Skills', 'ai/skill-list', 'IconCode', id, 11, 3, NULL, 1, NOW(), 0
FROM `sys_menu` WHERE `name` = 'menu.ai' LIMIT 1;

-- ============================================================
-- 知识库 Phase 1：新增两张表
-- ============================================================

-- 文本块表（向量化后存 Milvus，MySQL 只存元数据）
CREATE TABLE IF NOT EXISTS `ai_knowledge_chunk` (
    `id`               VARCHAR(64)   NOT NULL COMMENT '主键 ID（雪花）',
    `knowledge_base_id` VARCHAR(64)  NOT NULL COMMENT '所属知识库 ID',
    `document_id`      VARCHAR(64)   NOT NULL COMMENT '所属文档 ID',
    `content`          TEXT          NOT NULL COMMENT '分块文本内容',
    `chunk_index`      INT           NOT NULL DEFAULT 0 COMMENT '分块序号（从0开始）',
    `token_count`      INT                    COMMENT '估算 token 数',
    `milvus_id`        VARCHAR(128)           COMMENT '在 Milvus 中的向量 ID',
    `create_time`      DATETIME               COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_doc_id` (`document_id`),
    KEY `idx_kb_id` (`knowledge_base_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'AI 知识库文本块表';

-- 知识图谱实体表（Neo4j 中存结构，MySQL 存索引）
CREATE TABLE IF NOT EXISTS `ai_knowledge_graph_entity` (
    `id`               VARCHAR(64)   NOT NULL COMMENT '主键 ID（雪花）',
    `knowledge_base_id` VARCHAR(64)  NOT NULL COMMENT '所属知识库 ID',
    `document_id`      VARCHAR(64)            COMMENT '来源文档 ID',
    `entity_name`      VARCHAR(512)  NOT NULL COMMENT '实体名称',
    `entity_type`      VARCHAR(128)           COMMENT '实体类型：PERSON/ORG/CONCEPT/PLACE/EVENT/OTHER',
    `neo4j_node_id`    VARCHAR(128)           COMMENT 'Neo4j 中的节点 ID',
    `create_time`      DATETIME               COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_kb_id` (`knowledge_base_id`),
    KEY `idx_doc_id` (`document_id`),
    KEY `idx_entity_name` (`entity_name`(191))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'AI 知识图谱实体索引表';

-- 知识库菜单
INSERT IGNORE INTO `sys_menu` (`name`, `cn_name`, `en_name`, `url`, `icon`, `pid`, `sort`, `type`, `authority`, `creator`, `create_time`, `deleted`)
SELECT 'menu.ai.knowledge', '知识库', 'Knowledge Base', 'ai/knowledge-list', 'IconBook', id, 6, 3, NULL, 1, NOW(), 0
FROM `sys_menu` WHERE `name` = 'menu.ai' LIMIT 1;

-- Agent 执行台菜单
INSERT IGNORE INTO `sys_menu` (`name`, `cn_name`, `en_name`, `url`, `icon`, `pid`, `sort`, `type`, `authority`, `creator`, `create_time`, `deleted`)
SELECT 'menu.ai.agent', 'Agent 执行台', 'Agent Playground', 'ai/agent-playground', 'IconSend', id, 13, 3, NULL, 1, NOW(), 0
FROM `sys_menu` WHERE `name` = 'menu.ai' LIMIT 1;

-- ==================== G7/G8 爬虫 Agent 重构 ====================

-- data_crawler_task 表补充 AI Agent 相关字段
ALTER TABLE `data_crawler_task`
    ADD COLUMN IF NOT EXISTS `website_url`      VARCHAR(1000) COMMENT '目标网站 URL（AI Agent 爬虫使用）' AFTER `target_url`,
    ADD COLUMN IF NOT EXISTS `login_username`   VARCHAR(255)  COMMENT '登录用户名（可选）' AFTER `website_url`,
    ADD COLUMN IF NOT EXISTS `login_password`   VARCHAR(1000) COMMENT '登录密码（AES-256 加密存储）' AFTER `login_username`,
    ADD COLUMN IF NOT EXISTS `instructions`     TEXT          COMMENT '自然语言爬取指令' AFTER `login_password`,
    ADD COLUMN IF NOT EXISTS `assistant_id`     VARCHAR(64)   COMMENT '绑定的 AI 助手 ID' AFTER `instructions`,
    ADD COLUMN IF NOT EXISTS `playwright_connector_id` VARCHAR(64) COMMENT '绑定的 Playwright Connector ID' AFTER `assistant_id`,
    ADD COLUMN IF NOT EXISTS `model_id`         VARCHAR(64)   COMMENT '使用的 AI 模型 ID（关联 ai_model 表）' AFTER `playwright_connector_id`,
    ADD COLUMN IF NOT EXISTS `task_mode`        VARCHAR(32)   COMMENT '任务模式: DAG（旧）/ AGENT（AI Agent）' AFTER `model_id`;

-- ai_crawler_execution 表：记录 Agent 执行历史（步骤 + 结果数据）
CREATE TABLE IF NOT EXISTS `ai_crawler_execution` (
    `id`            VARCHAR(64)   NOT NULL COMMENT '主键 ID',
    `task_id`       VARCHAR(64)   NOT NULL COMMENT '关联的爬虫任务 ID',
    `task_name`     VARCHAR(255)  COMMENT '任务名称（冗余）',
    `status`        VARCHAR(32)   NOT NULL DEFAULT 'RUNNING' COMMENT '状态: RUNNING / SUCCESS / FAILED / CANCELLED',
    `model_id`      VARCHAR(64)   COMMENT '使用的 AI 模型 ID',
    `website_url`   VARCHAR(1000) COMMENT '爬取的目标 URL',
    `instructions`  TEXT          COMMENT '执行时的自然语言指令',
    `total_steps`   INT           DEFAULT 0 COMMENT '总步骤数',
    `events`        LONGTEXT      COMMENT 'Agent 执行事件列表（JSON 数组，含 THINKING/ACTION/OBSERVATION/RESULT）',
    `result_data`   LONGTEXT      COMMENT '最终提取的数据（JSON）',
    `error_message` TEXT          COMMENT '失败时的错误信息',
    `duration_ms`   BIGINT        COMMENT '执行耗时（毫秒）',
    `started_at`    DATETIME      COMMENT '开始时间',
    `completed_at`  DATETIME      COMMENT '完成时间',
    `creator`       VARCHAR(64)   COMMENT '创建人',
    `create_time`   DATETIME      COMMENT '创建时间',
    `deleted`       TINYINT(1)    NOT NULL DEFAULT 0 COMMENT '逻辑删除: 0-未删除 1-已删除',
    PRIMARY KEY (`id`),
    INDEX `idx_task_id` (`task_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_started_at` (`started_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI 爬虫 Agent 执行记录';

-- 爬虫 Agent 执行监控页菜单（挂载在爬虫管理下）
INSERT IGNORE INTO `sys_menu` (`name`, `cn_name`, `en_name`, `url`, `icon`, `pid`, `sort`, `type`, `authority`, `creator`, `create_time`, `deleted`)
SELECT 'menu.crawler.agentmonitor', 'Agent 执行监控', 'Agent Monitor', 'crawler/agent-monitor', 'IconSend', id, 10, 3, NULL, 1, NOW(), 0
FROM `sys_menu` WHERE `name` = 'menu.crawler' LIMIT 1;

-- ============================================================
-- 外部 Agent 平台接入建表
-- 支持 Dify / Coze / FastGPT 三方平台代理调用
-- ============================================================

-- 外部 Agent 平台配置表
CREATE TABLE IF NOT EXISTS `ai_external_agent` (
    `id`           VARCHAR(64)  NOT NULL COMMENT '主键 ID（雪花）',
    `name`         VARCHAR(128) NOT NULL COMMENT '配置名称，如"我的Dify爬虫Agent"',
    `provider`     VARCHAR(20)  NOT NULL COMMENT '平台类型：DIFY/COZE/FASTGPT',
    `base_url`     VARCHAR(512) NOT NULL COMMENT '平台 API 地址（支持私有化部署）',
    `api_key`      VARCHAR(1024) NOT NULL COMMENT 'API Key（SHA-256 哈希存储，不可逆）',
    `api_key_prefix` VARCHAR(32) COMMENT 'API Key 前缀（明文，用于展示）',
    `agent_id`     VARCHAR(128) COMMENT 'Agent 标识（Coze=bot_id，FastGPT=appId，Dify 不需要）',
    `description`  VARCHAR(500) COMMENT '描述',
    `enabled`      TINYINT(1)   NOT NULL DEFAULT 1 COMMENT '是否启用：1-启用 0-禁用',
    `creator`      VARCHAR(64)           COMMENT '创建人 ID',
    `creator_name` VARCHAR(128)          COMMENT '创建人名称',
    `create_time`  DATETIME              COMMENT '创建时间',
    `updater`      VARCHAR(64)           COMMENT '更新人 ID',
    `updater_name` VARCHAR(128)          COMMENT '更新人名称',
    `update_time`  DATETIME              COMMENT '更新时间',
    `deleted`      TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='外部 Agent 平台配置表';

-- 外部 Agent 会话映射表（本平台 session_id ↔ 三方 conversation_id）
CREATE TABLE IF NOT EXISTS `ai_external_agent_session` (
    `id`                        VARCHAR(64)  NOT NULL COMMENT '主键 ID（雪花）',
    `external_agent_id`         VARCHAR(64)  NOT NULL COMMENT '关联 ai_external_agent.id',
    `local_session_id`          VARCHAR(64)  NOT NULL COMMENT '本平台会话 ID（ai_session.id）',
    `external_conversation_id`  VARCHAR(256) COMMENT '三方平台返回的 conversation_id（首次调用后写入）',
    `create_time`               DATETIME     COMMENT '创建时间',
    `update_time`               DATETIME     COMMENT '最后更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_agent_local_session` (`external_agent_id`, `local_session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='外部 Agent 会话映射表';

-- AI 中心 - 外部 Agent 子菜单
INSERT IGNORE INTO `sys_menu` (`name`, `cn_name`, `en_name`, `url`, `icon`, `pid`, `sort`, `type`, `authority`, `creator`, `create_time`, `deleted`)
SELECT 'menu.ai.external-agent', '外部 Agent', 'External Agent', 'ai/external-agent-list', 'IconLink', id, 12, 3, NULL, 1, NOW(), 0
FROM `sys_menu` WHERE `name` = 'menu.ai' LIMIT 1;

-- ============================================================
-- 存量数据库补丁（已建表环境执行）
-- 说明：以下 ALTER 语句与上方建表语句保持完全一致
--       使用 IF NOT EXISTS 保证幂等，可重复执行
-- ============================================================

-- ai_document 补充 graph_node_count 字段
ALTER TABLE `ai_document`
    ADD COLUMN IF NOT EXISTS `graph_node_count` INT NOT NULL DEFAULT 0
    COMMENT '知识图谱节点数量' AFTER `chunk_count`;

-- ai_document 补充 file_name / file_type / file_size / file_content / error_msg 字段（存量环境可能缺失）
ALTER TABLE `ai_document`
    ADD COLUMN IF NOT EXISTS `file_name`    VARCHAR(256) COMMENT '文件名'                     AFTER `knowledge_base_id`,
    ADD COLUMN IF NOT EXISTS `file_type`    VARCHAR(32)  COMMENT '文件类型'                    AFTER `file_name`,
    ADD COLUMN IF NOT EXISTS `file_size`    BIGINT       COMMENT '文件大小（字节）'             AFTER `file_type`,
    ADD COLUMN IF NOT EXISTS `file_content` LONGTEXT     COMMENT '文件文本内容（提取后存储）'  AFTER `file_size`,
    ADD COLUMN IF NOT EXISTS `error_msg`    TEXT         COMMENT '处理错误信息'                AFTER `status`;

-- ai_prompt 补充 description / variables / sort_order 字段
ALTER TABLE `ai_prompt`
    ADD COLUMN IF NOT EXISTS `description`  VARCHAR(512)  COMMENT '提示词描述' AFTER `title`,
    ADD COLUMN IF NOT EXISTS `variables`    VARCHAR(512)  COMMENT '变量列表（JSON 数组，如 ["name","lang"]）' AFTER `description`,
    ADD COLUMN IF NOT EXISTS `sort_order`   INT NOT NULL DEFAULT 0 COMMENT '排序权重' AFTER `usage_count`;

-- ============================================================
-- 爬虫生态菜单整理（已建表环境执行）
-- 规则：移除旧无用菜单（soft delete），新增 AI 执行历史子菜单
-- ============================================================

-- 移除不再使用的旧爬虫菜单（crawlertemplate/crawlertaskcreate/crawlermonitor/crawlerselector/crawlertest/crawlerconfig/crawlerproxy/crawleraccount）
UPDATE `sys_menu` SET `deleted` = 1
WHERE `name` IN (
    'menu.crawler.crawlertemplate',
    'menu.crawler.crawlertemplatedetail',
    'menu.crawler.crawlertaskcreate',
    'menu.crawler.crawlermonitor',
    'menu.crawler.crawlerselector',
    'menu.crawler.crawlertest',
    'menu.crawler.crawlerconfig',
    'menu.crawler.crawlerproxy',
    'menu.crawler.crawleraccount'
) AND `deleted` = 0;

-- 更新执行历史菜单名称为 "Agent 执行历史"
UPDATE `sys_menu`
SET `cn_name` = 'Agent 执行历史', `en_name` = 'Agent Execution History',
    `url` = 'crawler/execution-list', `sort` = 2
WHERE `name` = 'menu.crawler.crawlerexecution' AND `deleted` = 0;

-- 新增 Agent 执行监控菜单（如果不存在）
INSERT IGNORE INTO `sys_menu` (`name`, `cn_name`, `en_name`, `url`, `icon`, `pid`, `sort`, `type`, `authority`, `creator`, `create_time`, `deleted`)
SELECT 'menu.crawler.agentmonitor', 'Agent 执行监控', 'Agent Monitor', 'crawler/agent-monitor', 'IconSend', id, 3, 3, NULL, 1, NOW(), 0
FROM `sys_menu` WHERE `name` = 'menu.crawler' AND `deleted` = 0 LIMIT 1;

-- ============================================================
-- MCP 服务市场建表
-- ============================================================

-- MCP 市场服务表（预置常用第三方MCP服务）
CREATE TABLE IF NOT EXISTS `ai_mcp_market` (
    `id`            VARCHAR(64)  NOT NULL COMMENT '主键 ID（雪花）',
    `name`          VARCHAR(128) NOT NULL COMMENT '服务名称',
    `description`   TEXT                  COMMENT '服务描述',
    `icon`          VARCHAR(256)          COMMENT '图标 URL 或 emoji',
    `category`      VARCHAR(64)           COMMENT '分类：search/data/dev/weather/other',
    `transport`     VARCHAR(32)  NOT NULL COMMENT '传输协议：STDIO/SSE/HTTP',
    `package_name`  VARCHAR(256)          COMMENT 'npm包名或镜像名（STDIO使用）',
    `command`       VARCHAR(512)          COMMENT '启动命令（STDIO使用）',
    `args`          TEXT                  COMMENT '命令参数 JSON数组',
    `endpoint`      VARCHAR(512)          COMMENT '连接地址（SSE/HTTP使用）',
    `env_vars`      TEXT                  COMMENT '环境变量 JSON对象',
    `config_schema` TEXT                  COMMENT '配置项Schema（JSON Schema）',
    `install_count` BIGINT       NOT NULL DEFAULT 0 COMMENT '安装次数统计',
    `version`       VARCHAR(32)           COMMENT '版本号',
    `author`        VARCHAR(128)          COMMENT '作者',
    `source_url`    VARCHAR(512)          COMMENT '源代码/文档地址',
    `is_official`   TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '是否官方推荐：0-否 1-是',
    `status`        TINYINT      NOT NULL DEFAULT 1 COMMENT '状态：1-上架 0-下架',
    `sort_order`    INT          NOT NULL DEFAULT 0 COMMENT '排序权重',
    `creator`       VARCHAR(64)           COMMENT '创建人 ID',
    `create_time`   DATETIME              COMMENT '创建时间',
    `updater`       VARCHAR(64)           COMMENT '更新人 ID',
    `update_time`   DATETIME              COMMENT '更新时间',
    `deleted`       TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    PRIMARY KEY (`id`),
    KEY `idx_category` (`category`),
    KEY `idx_transport` (`transport`),
    KEY `idx_status` (`status`),
    KEY `idx_is_official` (`is_official`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'MCP 服务市场表';

-- ============================================================
-- 预置常用 MCP 市场服务
-- ============================================================
INSERT IGNORE INTO `ai_mcp_market` (`id`, `name`, `description`, `icon`, `category`, `transport`, `package_name`, `command`, `args`, `config_schema`, `version`, `author`, `source_url`, `is_official`, `status`, `sort_order`, `creator`, `create_time`, `deleted`)
VALUES
-- 搜索类
('mcp-market-brave-search', 'Brave Search', '使用 Brave Search API 进行网页搜索', '🔍', 'search', 'STDIO', '@modelcontextprotocol/server-brave-search', 'npx', '["-y", "@modelcontextprotocol/server-brave-search"]', '{"type": "object", "properties": {"BRAVE_API_KEY": {"type": "string", "description": "Brave Search API Key"}}, "required": ["BRAVE_API_KEY"]}', '1.0.0', 'Anthropic', 'https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search', 1, 1, 1, 1, NOW(), 0),
('mcp-market-fetch', 'Fetch', '获取和处理网页内容，支持HTML转Markdown', '🌐', 'search', 'STDIO', '@modelcontextprotocol/server-fetch', 'npx', '["-y", "@modelcontextprotocol/server-fetch"]', NULL, '1.0.0', 'Anthropic', 'https://github.com/modelcontextprotocol/servers/tree/main/src/fetch', 1, 1, 2, 1, NOW(), 0),

-- 数据库类
('mcp-market-postgres', 'PostgreSQL', '连接PostgreSQL数据库进行查询和操作', '💾', 'data', 'STDIO', '@modelcontextprotocol/server-postgres', 'npx', '["-y", "@modelcontextprotocol/server-postgres", "postgresql://localhost/mydb"]', '{"type": "object", "properties": {"connectionString": {"type": "string", "description": "PostgreSQL连接字符串"}}, "required": ["connectionString"]}', '1.0.0', 'Anthropic', 'https://github.com/modelcontextprotocol/servers/tree/main/src/postgres', 1, 1, 10, 1, NOW(), 0),
('mcp-market-sqlite', 'SQLite', '连接SQLite数据库进行查询和操作', '📂', 'data', 'STDIO', '@modelcontextprotocol/server-sqlite', 'npx', '["-y", "@modelcontextprotocol/server-sqlite", "/path/to/db.sqlite"]', '{"type": "object", "properties": {"dbPath": {"type": "string", "description": "SQLite数据库文件路径"}}, "required": ["dbPath"]}', '1.0.0', 'Anthropic', 'https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite', 1, 1, 11, 1, NOW(), 0),

-- 文件系统类
('mcp-market-filesystem', 'Filesystem', '访问和操作本地文件系统', '📁', 'dev', 'STDIO', '@modelcontextprotocol/server-filesystem', 'npx', '["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/dir"]', '{"type": "object", "properties": {"allowedPath": {"type": "string", "description": "允许访问的目录路径"}}, "required": ["allowedPath"]}', '1.0.0', 'Anthropic', 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem', 1, 1, 20, 1, NOW(), 0),
('mcp-market-github', 'GitHub', '访问GitHub API进行代码仓库操作', '🐈', 'dev', 'STDIO', '@modelcontextprotocol/server-github', 'npx', '["-y", "@modelcontextprotocol/server-github"]', '{"type": "object", "properties": {"GITHUB_PERSONAL_ACCESS_TOKEN": {"type": "string", "description": "GitHub Personal Access Token"}}, "required": ["GITHUB_PERSONAL_ACCESS_TOKEN"]}', '1.0.0', 'Anthropic', 'https://github.com/modelcontextprotocol/servers/tree/main/src/github', 1, 1, 21, 1, NOW(), 0),
('mcp-market-git', 'Git', '执行Git命令进行版本控制', '🔖', 'dev', 'STDIO', '@modelcontextprotocol/server-git', 'npx', '["-y", "@modelcontextprotocol/server-git"]', NULL, '1.0.0', 'Anthropic', 'https://github.com/modelcontextprotocol/servers/tree/main/src/git', 1, 1, 22, 1, NOW(), 0),

-- 工具类
('mcp-market-puppeteer', 'Puppeteer', '使用Puppeteer控制浏览器', '🦮', 'dev', 'STDIO', '@modelcontextprotocol/server-puppeteer', 'npx', '["-y", "@modelcontextprotocol/server-puppeteer"]', NULL, '1.0.0', 'Anthropic', 'https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer', 1, 1, 30, 1, NOW(), 0),
('mcp-market-slack', 'Slack', '发送消息和管理Slack频道', '💬', 'dev', 'STDIO', '@modelcontextprotocol/server-slack', 'npx', '["-y", "@modelcontextprotocol/server-slack"]', '{"type": "object", "properties": {"SLACK_BOT_TOKEN": {"type": "string", "description": "Slack Bot Token"}, "SLACK_TEAM_ID": {"type": "string", "description": "Slack Team ID"}}, "required": ["SLACK_BOT_TOKEN", "SLACK_TEAM_ID"]}', '1.0.0', 'Anthropic', 'https://github.com/modelcontextprotocol/servers/tree/main/src/slack', 1, 1, 31, 1, NOW(), 0),

-- 天气类
('mcp-market-weather', 'Weather', '获取全球城市天气信息', '☀️', 'weather', 'STDIO', '@modelcontextprotocol/server-weather', 'npx', '["-y", "@modelcontextprotocol/server-weather"]', '{"type": "object", "properties": {"OPENWEATHER_API_KEY": {"type": "string", "description": "OpenWeather API Key"}}, "required": ["OPENWEATHER_API_KEY"]}', '1.0.0', 'Community', 'https://github.com/modelcontextprotocol/servers', 0, 1, 40, 1, NOW(), 0),

-- 数据库扩展
('mcp-market-mysql', 'MySQL', '连接 MySQL 数据库，支持查询、插入、更新等操作', '🐬', 'data', 'STDIO', '@benborla29/mcp-server-mysql', 'npx', '["-y", "@benborla29/mcp-server-mysql"]', '{"type":"object","properties":{"MYSQL_HOST":{"type":"string","description":"MySQL 主机地址"},"MYSQL_PORT":{"type":"string","description":"端口，默认 3306"},"MYSQL_USER":{"type":"string","description":"用户名"},"MYSQL_PASS":{"type":"string","description":"密码"},"MYSQL_DB":{"type":"string","description":"数据库名"}},"required":["MYSQL_HOST","MYSQL_USER","MYSQL_PASS","MYSQL_DB"]}', '1.0.0', 'benborla29', 'https://github.com/benborla29/mcp-server-mysql', 0, 1, 12, 1, NOW(), 0),
('mcp-market-redis', 'Redis', '连接 Redis 进行缓存读写、发布订阅等操作', '🔴', 'data', 'STDIO', 'mcp-server-redis', 'npx', '["-y", "mcp-server-redis"]', '{"type":"object","properties":{"REDIS_URL":{"type":"string","description":"Redis 连接 URL，如 redis://localhost:6379"}},"required":["REDIS_URL"]}', '1.0.0', 'Community', 'https://github.com/modelcontextprotocol/servers', 0, 1, 13, 1, NOW(), 0),
('mcp-market-elasticsearch', 'Elasticsearch', '连接 Elasticsearch 进行全文检索和数据分析', '🔎', 'data', 'STDIO', '@elastic/mcp-server-elasticsearch', 'npx', '["-y", "@elastic/mcp-server-elasticsearch"]', '{"type":"object","properties":{"ES_URL":{"type":"string","description":"Elasticsearch 连接地址"},"ES_API_KEY":{"type":"string","description":"API Key（可选）"}},"required":["ES_URL"]}', '1.0.0', 'Elastic', 'https://github.com/elastic/mcp-server-elasticsearch', 1, 1, 14, 1, NOW(), 0),
('mcp-market-mongodb', 'MongoDB', '连接 MongoDB 进行文档数据库操作', '🍃', 'data', 'STDIO', 'mongodb-mcp-server', 'npx', '["-y", "mongodb-mcp-server"]', '{"type":"object","properties":{"connectionString":{"type":"string","description":"MongoDB 连接字符串，如 mongodb://localhost:27017"}},"required":["connectionString"]}', '1.0.0', 'Community', 'https://github.com/kiliczsh/mcp-mongo-server', 0, 1, 15, 1, NOW(), 0),

-- 开发工具扩展
('mcp-market-gitlab', 'GitLab', '访问 GitLab API，管理仓库、MR、Issue 等', '🦊', 'dev', 'STDIO', '@modelcontextprotocol/server-gitlab', 'npx', '["-y", "@modelcontextprotocol/server-gitlab"]', '{"type":"object","properties":{"GITLAB_PERSONAL_ACCESS_TOKEN":{"type":"string","description":"GitLab Personal Access Token"},"GITLAB_API_URL":{"type":"string","description":"GitLab API 地址，默认 https://gitlab.com/api/v4"}},"required":["GITLAB_PERSONAL_ACCESS_TOKEN"]}', '1.0.0', 'Anthropic', 'https://github.com/modelcontextprotocol/servers/tree/main/src/gitlab', 1, 1, 23, 1, NOW(), 0),
('mcp-market-jira', 'Jira', '连接 Atlassian Jira，管理项目、Issue 和工作流', '📋', 'dev', 'STDIO', 'mcp-atlassian', 'npx', '["-y", "mcp-atlassian"]', '{"type":"object","properties":{"JIRA_URL":{"type":"string","description":"Jira 站点 URL"},"JIRA_USERNAME":{"type":"string","description":"用户名/邮箱"},"JIRA_API_TOKEN":{"type":"string","description":"Jira API Token"}},"required":["JIRA_URL","JIRA_USERNAME","JIRA_API_TOKEN"]}', '1.0.0', 'Community', 'https://github.com/sooperset/mcp-atlassian', 0, 1, 24, 1, NOW(), 0),
('mcp-market-docker', 'Docker', '管理 Docker 容器、镜像、网络和卷', '🐳', 'dev', 'STDIO', 'mcp-server-docker', 'npx', '["-y", "mcp-server-docker"]', NULL, '1.0.0', 'Community', 'https://github.com/ckreiling/mcp-server-docker', 0, 1, 25, 1, NOW(), 0),
('mcp-market-kubernetes', 'Kubernetes', '管理 Kubernetes 集群资源，支持 Pod、Service、Deployment 操作', '☸️', 'dev', 'STDIO', 'mcp-server-kubernetes', 'npx', '["-y", "mcp-server-kubernetes"]', NULL, '1.0.0', 'Community', 'https://github.com/Flux159/mcp-server-kubernetes', 0, 1, 26, 1, NOW(), 0),
('mcp-market-aws-kb', 'AWS Knowledge Base', '连接 AWS Bedrock Knowledge Base 进行 RAG 检索', '☁️', 'dev', 'STDIO', '@aws/mcp-server-aws-kb-retrieval', 'npx', '["-y", "@aws/mcp-server-aws-kb-retrieval-server"]', '{"type":"object","properties":{"AWS_ACCESS_KEY_ID":{"type":"string"},"AWS_SECRET_ACCESS_KEY":{"type":"string"},"AWS_REGION":{"type":"string","description":"AWS 区域，如 us-east-1"}},"required":["AWS_ACCESS_KEY_ID","AWS_SECRET_ACCESS_KEY","AWS_REGION"]}', '1.0.0', 'AWS', 'https://github.com/aws-samples/amazon-bedrock-mcp', 1, 1, 27, 1, NOW(), 0),

-- 通讯协作
('mcp-market-gmail', 'Gmail', '读取、发送和管理 Gmail 邮件', '📧', 'other', 'STDIO', '@gongrzhe/server-gmail-autoauth-mcp', 'npx', '["-y", "@gongrzhe/server-gmail-autoauth-mcp"]', '{"type":"object","properties":{"GMAIL_OAUTH_PATH":{"type":"string","description":"OAuth credentials.json 路径"}},"required":["GMAIL_OAUTH_PATH"]}', '1.0.0', 'Community', 'https://github.com/gongrzhe/gmail-mcp-server', 0, 1, 50, 1, NOW(), 0),
('mcp-market-notion', 'Notion', '读取和创建 Notion 页面、数据库内容', '📝', 'other', 'STDIO', '@suekou/mcp-notion-server', 'npx', '["-y", "@suekou/mcp-notion-server"]', '{"type":"object","properties":{"NOTION_API_TOKEN":{"type":"string","description":"Notion Integration Token"}},"required":["NOTION_API_TOKEN"]}', '1.0.0', 'Community', 'https://github.com/suekou/mcp-notion-server', 0, 1, 51, 1, NOW(), 0),
('mcp-market-google-drive', 'Google Drive', '访问 Google Drive 文件，支持搜索、读取和上传', '📂', 'other', 'STDIO', '@modelcontextprotocol/server-gdrive', 'npx', '["-y", "@modelcontextprotocol/server-gdrive"]', '{"type":"object","properties":{"GDRIVE_CREDENTIALS_PATH":{"type":"string","description":"credentials.json 路径"}},"required":["GDRIVE_CREDENTIALS_PATH"]}', '1.0.0', 'Anthropic', 'https://github.com/modelcontextprotocol/servers/tree/main/src/gdrive', 1, 1, 52, 1, NOW(), 0),
('mcp-market-google-calendar', 'Google Calendar', '查看和创建 Google 日历事件', '📅', 'other', 'STDIO', '@nspireit/google-calendar-mcp', 'npx', '["-y", "@nspireit/google-calendar-mcp"]', '{"type":"object","properties":{"GOOGLE_CLIENT_ID":{"type":"string"},"GOOGLE_CLIENT_SECRET":{"type":"string"},"GOOGLE_REFRESH_TOKEN":{"type":"string"}},"required":["GOOGLE_CLIENT_ID","GOOGLE_CLIENT_SECRET","GOOGLE_REFRESH_TOKEN"]}', '1.0.0', 'Community', 'https://github.com/nspire-it/google-calendar-mcp', 0, 1, 53, 1, NOW(), 0),
('mcp-market-discord', 'Discord', '读取 Discord 消息，发送通知到频道', '💬', 'other', 'STDIO', 'mcp-discord', 'npx', '["-y", "mcp-discord"]', '{"type":"object","properties":{"DISCORD_TOKEN":{"type":"string","description":"Discord Bot Token"}},"required":["DISCORD_TOKEN"]}', '1.0.0', 'Community', 'https://github.com/v-3/discordmcp', 0, 1, 54, 1, NOW(), 0),
('mcp-market-telegram', 'Telegram', '通过 Telegram Bot 发送消息和通知', '✈️', 'other', 'STDIO', 'mcp-telegram', 'npx', '["-y", "mcp-telegram"]', '{"type":"object","properties":{"TELEGRAM_BOT_TOKEN":{"type":"string","description":"Telegram Bot Token"},"TELEGRAM_CHAT_ID":{"type":"string","description":"目标 Chat ID"}},"required":["TELEGRAM_BOT_TOKEN","TELEGRAM_CHAT_ID"]}', '1.0.0', 'Community', 'https://github.com/sparfenyuk/mcp-telegram', 0, 1, 55, 1, NOW(), 0),

-- 搜索扩展
('mcp-market-tavily', 'Tavily Search', '为 AI Agent 专门设计的搜索引擎，返回干净结构化结果', '🔍', 'search', 'STDIO', 'tavily-mcp', 'npx', '["-y", "tavily-mcp@0.1.4"]', '{"type":"object","properties":{"TAVILY_API_KEY":{"type":"string","description":"Tavily API Key"}},"required":["TAVILY_API_KEY"]}', '0.1.4', 'Tavily', 'https://github.com/tavily-ai/tavily-mcp', 1, 1, 3, 1, NOW(), 0),
('mcp-market-exa', 'Exa Search', 'Exa 语义搜索，专为 AI 应用优化，支持摘要和全文返回', '⭐', 'search', 'STDIO', 'exa-mcp-server', 'npx', '["-y", "exa-mcp-server"]', '{"type":"object","properties":{"EXA_API_KEY":{"type":"string","description":"Exa API Key"}},"required":["EXA_API_KEY"]}', '1.0.0', 'Exa', 'https://github.com/exa-labs/exa-mcp-server', 1, 1, 4, 1, NOW(), 0),
('mcp-market-serper', 'Serper Google Search', '通过 Serper.dev 调用 Google 搜索，支持网页、新闻、图片搜索', '🌐', 'search', 'STDIO', 'serper-search-mcp-server', 'npx', '["-y", "serper-search-mcp-server"]', '{"type":"object","properties":{"SERPER_API_KEY":{"type":"string","description":"Serper API Key"}},"required":["SERPER_API_KEY"]}', '1.0.0', 'Community', 'https://github.com/iAMX11/serper-search-mcp-server', 0, 1, 5, 1, NOW(), 0),

-- AI / 模型服务
('mcp-market-openai', 'OpenAI', '调用 OpenAI API 进行文本生成、图像生成、嵌入等操作', '🤖', 'dev', 'STDIO', '@llmindset/mcp-openai', 'npx', '["-y", "@llmindset/mcp-openai"]', '{"type":"object","properties":{"OPENAI_API_KEY":{"type":"string","description":"OpenAI API Key"}},"required":["OPENAI_API_KEY"]}', '1.0.0', 'Community', 'https://github.com/llmindset/mcp-openai', 0, 1, 60, 1, NOW(), 0),
('mcp-market-stability', 'Stability AI', '使用 Stability AI 生成图像、视频', '🎨', 'dev', 'STDIO', 'mcp-stability-ai', 'npx', '["-y", "mcp-stability-ai"]', '{"type":"object","properties":{"STABILITY_AI_API_KEY":{"type":"string","description":"Stability AI API Key"}},"required":["STABILITY_AI_API_KEY"]}', '1.0.0', 'Community', 'https://github.com/tadasant/mcp-server-stability-ai', 0, 1, 61, 1, NOW(), 0),

-- 天气扩展
('mcp-market-accuweather', 'AccuWeather', '精准天气预报，支持逐小时/15天预报和气象预警', '🌤️', 'weather', 'STDIO', '@mcpserver/accuweather', 'npx', '["-y", "@mcpserver/accuweather"]', '{"type":"object","properties":{"ACCUWEATHER_API_KEY":{"type":"string","description":"AccuWeather API Key"}},"required":["ACCUWEATHER_API_KEY"]}', '1.0.0', 'Community', 'https://github.com/modelcontextprotocol/servers', 0, 1, 41, 1, NOW(), 0);

-- 新增 MCP 市场菜单
INSERT IGNORE INTO `sys_menu` (`name`, `cn_name`, `en_name`, `url`, `icon`, `pid`, `sort`, `type`, `authority`, `creator`, `create_time`, `deleted`)
SELECT 'menu.ai.mcpmarket', 'MCP 市场', 'MCP Market', 'ai/mcp-market', 'IconShoppingCart', id, 5, 3, NULL, 1, NOW(), 0
FROM `sys_menu` WHERE `name` = 'menu.ai' AND `deleted` = 0 LIMIT 1;

-- ============================================================
-- 知识图谱扩展表（图谱 Schema + 关系索引）
-- ============================================================

-- 图谱实体类型模板表：用户定义实体类型、属性、关系规则供 LLM 抽取使用
CREATE TABLE IF NOT EXISTS `ai_graph_schema` (
    `id`              VARCHAR(64)   NOT NULL COMMENT '主键 ID（雪花）',
    `knowledge_base_id` VARCHAR(64) NOT NULL COMMENT '所属知识库 ID',
    `entity_type`     VARCHAR(128)  NOT NULL COMMENT '实体类型名称，如：人物、公司、产品',
    `description`     VARCHAR(512)           COMMENT '类型说明',
    `attributes`      TEXT                   COMMENT '属性列表（JSON 数组，如 ["姓名","职位","所属公司"]）',
    `relations`       TEXT                   COMMENT '可参与的关系类型（JSON 数组）',
    `extract_prompt`  TEXT                   COMMENT '专项抽取指令（可选，给 LLM 的额外 Prompt）',
    `creator`         VARCHAR(64)            COMMENT '创建人 ID',
    `create_time`     DATETIME               COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_kb_id` (`knowledge_base_id`),
    UNIQUE KEY `uk_kb_type` (`knowledge_base_id`, `entity_type`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'AI 知识图谱实体类型模板表';

-- 图谱关系索引表（MySQL 存关系索引，Neo4j 存实际关系数据）
CREATE TABLE IF NOT EXISTS `ai_knowledge_graph_relation` (
    `id`                  VARCHAR(64)  NOT NULL COMMENT '主键 ID（雪花）',
    `knowledge_base_id`   VARCHAR(64)  NOT NULL COMMENT '所属知识库 ID',
    `document_id`         VARCHAR(64)           COMMENT '来源文档 ID',
    `source_entity_id`    VARCHAR(64)  NOT NULL COMMENT '主体实体 ID（关联 ai_knowledge_graph_entity）',
    `source_entity_name`  VARCHAR(512)          COMMENT '主体实体名称（冗余）',
    `target_entity_id`    VARCHAR(64)  NOT NULL COMMENT '客体实体 ID',
    `target_entity_name`  VARCHAR(512)          COMMENT '客体实体名称（冗余）',
    `relation_type`       VARCHAR(128) NOT NULL COMMENT '关系类型，如：属于、管理、投资',
    `confidence`          DECIMAL(5,4)          COMMENT 'LLM 置信度（0-1）',
    `properties`          TEXT                  COMMENT '关系属性（JSON 对象）',
    `neo4j_edge_id`       VARCHAR(128)          COMMENT 'Neo4j 中的边 ID',
    `document_name`       VARCHAR(512)          COMMENT '来源文档名称（冗余）',
    `create_time`         DATETIME              COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_kb_id` (`knowledge_base_id`),
    KEY `idx_source_entity` (`source_entity_id`),
    KEY `idx_target_entity` (`target_entity_id`),
    KEY `idx_relation_type` (`relation_type`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'AI 知识图谱关系索引表';

-- ai_knowledge_graph_entity 补充 properties、entity_name 字段（存量环境）
ALTER TABLE `ai_knowledge_graph_entity`
    ADD COLUMN IF NOT EXISTS `properties` TEXT COMMENT '实体属性（JSON 对象，LLM 抽取后填充）' AFTER `entity_type`;

-- ai_knowledge_base 新增 CRAG 置信度阈值、graph_connector_id 字段
-- 检索模式名称修正: VECTOR/GRAPH/HYBRID -> 增加 GRAPH_HYBRID
ALTER TABLE `ai_knowledge_base`
    ADD COLUMN IF NOT EXISTS `confidence_threshold` DECIMAL(4,2) DEFAULT 0.50 COMMENT 'CRAG 置信度过滤阈值（0~1，低于此分 Chunk 将被剔除）' AFTER `retrieval_mode`;

-- ====================================================
-- 技能市场预置数据（sourceType=MARKET，不可被用户删除）
-- 若已存在则忽略
-- ====================================================
INSERT IGNORE INTO `ai_skill`(`id`,`name`,`display_name`,`description`,`category`,`source_type`,`execute_type`,`http_method`,`endpoint`,`headers`,`input_schema`,`output_schema`,`version`,`icon`,`is_public`,`status`,`sort_order`,`deleted`)
VALUES
('market-skill-001','web_search_serper','Serper 网络搜索','使用 Serper.dev API 进行 Google 搜索，返回搜索结果摘要','search','MARKET','HTTP','POST','https://google.serper.dev/search','{"X-API-KEY":"your-serper-api-key","Content-Type":"application/json"}','{"type":"object","properties":{"q":{"type":"string","description":"搜索关键词"}},"required":["q"]}','{"type":"object","properties":{"organic":{"type":"array"}}}','1.0.0','🔍',1,1,1,0),
('market-skill-002','web_search_tavily','Tavily AI 搜索','Tavily 专为 AI Agent 设计的搜索 API，支持深度搜索','search','MARKET','HTTP','POST','https://api.tavily.com/search','{"Content-Type":"application/json"}','{"type":"object","properties":{"query":{"type":"string"},"api_key":{"type":"string"}},"required":["query","api_key"]}','{"type":"object","properties":{"results":{"type":"array"}}}','1.0.0','🌐',1,1,2,0),
('market-skill-003','weather_openweather','OpenWeather 天气','获取全球城市实时天气，包括温度、湿度、风速等信息','other','MARKET','HTTP','GET','https://api.openweathermap.org/data/2.5/weather','{}','{"type":"object","properties":{"q":{"type":"string","description":"城市名"},"appid":{"type":"string"},"units":{"type":"string","default":"metric"}},"required":["q","appid"]}','{"type":"object"}','1.0.0','☀️',1,1,3,0),
('market-skill-004','currency_exchange','汇率换算','实时外汇汇率查询，支持全球主要货币换算','data','MARKET','HTTP','GET','https://api.exchangerate-api.com/v4/latest/{base}','{}','{"type":"object","properties":{"base":{"type":"string","description":"基础货币，如 USD"}},"required":["base"]}','{"type":"object","properties":{"rates":{"type":"object"}}}','1.0.0','💱',1,1,4,0),
('market-skill-005','github_search_repo','GitHub 仓库搜索','搜索 GitHub 上的开源仓库，返回 star 数、描述等信息','search','MARKET','HTTP','GET','https://api.github.com/search/repositories','{"Accept":"application/vnd.github.v3+json"}','{"type":"object","properties":{"q":{"type":"string"},"sort":{"type":"string","default":"stars"}},"required":["q"]}','{"type":"object","properties":{"items":{"type":"array"}}}','1.0.0','🐈',1,1,5,0),
('market-skill-006','ip_geolocation','IP 地理位置','查询 IP 地址的地理位置信息，包括国家、城市、运营商','data','MARKET','HTTP','GET','https://ipapi.co/{ip}/json/','{}','{"type":"object","properties":{"ip":{"type":"string","description":"IP 地址"}},"required":["ip"]}','{"type":"object"}','1.0.0','📍',1,1,6,0),
('market-skill-007','web_scraper_jina','Jina 网页读取','使用 Jina Reader 将任意网页转为干净的 Markdown 文本，适合 LLM 阅读','crawler','MARKET','HTTP','GET','https://r.jina.ai/{url}','{"Accept":"application/json"}','{"type":"object","properties":{"url":{"type":"string","description":"目标网页 URL"}},"required":["url"]}','{"type":"object","properties":{"content":{"type":"string"}}}','1.0.0','📄',1,1,7,0),
('market-skill-008','translate_deepl','DeepL 翻译','使用 DeepL API 进行高质量多语言翻译','other','MARKET','HTTP','POST','https://api-free.deepl.com/v2/translate','{"Content-Type":"application/x-www-form-urlencoded"}','{"type":"object","properties":{"text":{"type":"string"},"target_lang":{"type":"string"},"auth_key":{"type":"string"}},"required":["text","target_lang","auth_key"]}','{"type":"object","properties":{"translations":{"type":"array"}}}','1.0.0','🌍',1,1,8,0);

-- ====================================================
-- AI 开放 API Key 表
-- 用于外部 App 以 apikey 方式调用助手对话接口
-- ====================================================
CREATE TABLE IF NOT EXISTS `ai_api_key` (
    `id`            VARCHAR(64)  NOT NULL               COMMENT '主键',
    `name`          VARCHAR(128) NOT NULL               COMMENT 'Key 名称（用途描述）',
    `api_key`       VARCHAR(128) NOT NULL               COMMENT 'API Key（sk- 前缀，唯一）',
    `assistant_id`  VARCHAR(64)  NOT NULL               COMMENT '绑定的助手 ID',
    `allowed_origins` VARCHAR(1024)                     COMMENT '允许的来源域名（逗号分隔，空=不限）',
    `expire_time`   DATETIME                            COMMENT '过期时间（null=永不过期）',
    `rate_limit`    INT          DEFAULT 0              COMMENT '每分钟最大请求数（0=不限）',
    `total_calls`   BIGINT       DEFAULT 0              COMMENT '累计调用次数',
    `status`        TINYINT      DEFAULT 1              COMMENT '状态：1-启用 0-禁用',
    `creator`       VARCHAR(64)                         COMMENT '创建人 ID',
    `creator_name`  VARCHAR(64)                         COMMENT '创建人姓名',
    `create_time`   DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_api_key` (`api_key`),
    KEY `idx_assistant_id` (`assistant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI 开放 API Key 表';

-- ============================================================
-- MCP SQL 工具表：将 SQL 查询发布为 MCP 工具
-- ============================================================
CREATE TABLE IF NOT EXISTS `ai_mcp_sql_tool` (
    `id`               VARCHAR(64)   NOT NULL COMMENT '主键 ID（雪花）',
    `tool_name`        VARCHAR(128)  NOT NULL COMMENT '工具名称（英文，作为 MCP 工具名）',
    `description`      TEXT                   COMMENT '工具描述（供 AI 理解功能）',
    `sql_content`      TEXT          NOT NULL COMMENT 'SQL 语句（支持 :paramName 占位符）',
    `connector_id`     VARCHAR(64)            COMMENT '数据连接器 ID（预留）',
    `connector_name`   VARCHAR(128)           COMMENT '数据连接器名称（冒余）',
    `parameter_schema` TEXT                   COMMENT 'JSON 数组，描述 SQL 参数定义',
    `max_rows`         INT           DEFAULT 100 COMMENT '最大返回行数（默认 100）',
    `status`           TINYINT       NOT NULL DEFAULT 0 COMMENT '状态：1=已发布 0=草稿',
    `creator`          VARCHAR(64)            COMMENT '创建人 ID',
    `creator_name`     VARCHAR(128)           COMMENT '创建人名称',
    `create_time`      DATETIME               COMMENT '创建时间',
    `updater`          VARCHAR(64)            COMMENT '更新人 ID',
    `updater_name`     VARCHAR(128)           COMMENT '更新人名称',
    `update_time`      DATETIME               COMMENT '更新时间',
    `deleted`          TINYINT       NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_tool_name` (`tool_name`),
    KEY `idx_status` (`status`),
    KEY `idx_create_time` (`create_time`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'MCP SQL 工具表';

-- AI 中心 - MCP SQL 工具管理菜单
INSERT IGNORE INTO `sys_menu` (`name`, `cn_name`, `en_name`, `url`, `icon`, `pid`, `sort`, `type`, `authority`, `creator`, `create_time`, `deleted`)
SELECT 'menu.ai.mcpsql', 'SQL 工具', 'SQL Tools', 'ai/mcp-sql-tool', 'IconData', id, 15, 3, NULL, 1, NOW(), 0
FROM `sys_menu` WHERE `name` = 'menu.ai' LIMIT 1;

-- ============================================================
-- Skill 模块重构：旧设计（HTTP工具调用）完全废弃
-- 重建为 SKILL.md 流程规范体系
-- ============================================================

-- 删除旧错误设计的表（无历史数据需要保留）
DROP TABLE IF EXISTS `ai_skill_execution`;
DROP TABLE IF EXISTS `ai_skill`;

-- 重建 ai_skill 表（SKILL.md 流程规范，非工具调用）
CREATE TABLE IF NOT EXISTS `ai_skill` (
    `id`             VARCHAR(64)   NOT NULL COMMENT '主键 ID（雪花）',
    `name`           VARCHAR(128)  NOT NULL COMMENT 'Skill 标识（全局唯一，对应 SKILL.md frontmatter.name）',
    `display_name`   VARCHAR(128)           COMMENT '显示名称',
    `description`    TEXT                   COMMENT '功能描述（向 LLM 暴露，用于助手绑定选择）',
    `skill_md`       LONGTEXT               COMMENT 'SKILL.md 完整内容（YAML frontmatter + Markdown 正文）',
    `category`       VARCHAR(64)            COMMENT '分类（data-sync/search/analysis/custom 等）',
    `tags`           VARCHAR(512)           COMMENT '标签（JSON 数组，如 ["seatunnel","etl"]）',
    `source_type`    VARCHAR(32)   NOT NULL DEFAULT 'CUSTOM' COMMENT '来源：IMPORTED-ZIP导入 / CUSTOM-在线编写 / BUILTIN-系统内置',
    `has_references` TINYINT(1)    NOT NULL DEFAULT 0 COMMENT '是否包含 references 文件（ai_skill_file 表）',
    `has_scripts`    TINYINT(1)    NOT NULL DEFAULT 0 COMMENT '是否包含 scripts 文件（Agent Loop 后可执行）',
    `version`        VARCHAR(32)            COMMENT '版本号（来自 SKILL.md frontmatter，如 1.0.0）',
    `icon`           VARCHAR(128)           COMMENT '图标（emoji 或 URL）',
    `is_public`      TINYINT(1)    NOT NULL DEFAULT 0 COMMENT '是否公开：0-私有 1-公开',
    `status`         TINYINT       NOT NULL DEFAULT 1 COMMENT '状态：1-启用 0-禁用',
    `sort_order`     INT           NOT NULL DEFAULT 0 COMMENT '排序权重',
    `creator`        VARCHAR(64)            COMMENT '创建人 ID',
    `creator_name`   VARCHAR(128)           COMMENT '创建人名称',
    `create_time`    DATETIME               COMMENT '创建时间',
    `updater`        VARCHAR(64)            COMMENT '更新人 ID',
    `updater_name`   VARCHAR(128)           COMMENT '更新人名称',
    `update_time`    DATETIME               COMMENT '更新时间',
    `deleted`        TINYINT       NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_skill_name` (`name`),
    KEY `idx_category` (`category`),
    KEY `idx_source_type` (`source_type`),
    KEY `idx_status` (`status`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'AI Skill 表（SKILL.md 流程规范，非工具调用）';

-- 新增 ai_skill_file 表（存储 references/scripts/assets 文件内容，保留原始目录结构）
CREATE TABLE IF NOT EXISTS `ai_skill_file` (
    `id`           VARCHAR(64)   NOT NULL COMMENT '主键 ID（雪花）',
    `skill_id`     VARCHAR(64)   NOT NULL COMMENT '关联的 Skill ID',
    `file_type`    VARCHAR(16)   NOT NULL COMMENT '文件类型：REFERENCE / SCRIPT / ASSET',
    `file_path`    VARCHAR(512)  NOT NULL COMMENT '相对路径，如 references/connectors/source/mysql-cdc.md',
    `file_name`    VARCHAR(128)  NOT NULL COMMENT '文件名，如 mysql-cdc.md',
    `file_ext`     VARCHAR(32)            COMMENT '扩展名，如 .md / .py / .js',
    `file_content` LONGTEXT      NOT NULL COMMENT '文件内容（UTF-8 文本）',
    `file_size`    INT                    COMMENT '文件大小（字节）',
    `sort_order`   INT           NOT NULL DEFAULT 0 COMMENT '同目录内排序',
    `creator`      VARCHAR(64)            COMMENT '创建人 ID',
    `creator_name` VARCHAR(128)           COMMENT '创建人名称',
    `create_time`  DATETIME               COMMENT '创建时间',
    `deleted`      TINYINT(1)    NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    KEY `idx_skill_id` (`skill_id`),
    KEY `idx_file_type` (`file_type`),
    KEY `idx_skill_file_path` (`skill_id`, `file_path`(191))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'Skill 附件文件表（references/scripts/assets 原始目录结构）';

-- ============================================================
-- Phase 5: 文档库（DocLibrary）建表 SQL
-- ============================================================

-- 文档库表
CREATE TABLE IF NOT EXISTS `ai_doc_library` (
    `id`                VARCHAR(64)   NOT NULL COMMENT '主键 ID（雪花）',
    `name`              VARCHAR(128)  NOT NULL COMMENT '唯一标识名（如 seatunnel-docs，用作工具名前缀）',
    `display_name`      VARCHAR(128)           COMMENT '显示名称（如 SeaTunnel 文档库）',
    `description`       TEXT                   COMMENT '描述',
    `doc_path`          VARCHAR(512)  NOT NULL COMMENT '文档根路径（相对或绝对路径）',
    `file_filter`       VARCHAR(64)            COMMENT '文件过滤模式（如 *.md）',
    `max_read_length`   INT                    COMMENT '单次读取最大字符数（默认 8000）',
    `max_search_results` INT                   COMMENT '关键词搜索最多返回段落数（默认 10）',
    `context_lines`     INT                    COMMENT '搜索每个匹配段落上下文行数（默认 5）',
    `file_count`        INT                    COMMENT '文档数量（自动统计）',
    `icon`              VARCHAR(128)           COMMENT '图标（emoji 或 URL）',
    `category`          VARCHAR(32)            COMMENT '分类（如 data-dev/search/compute）',
    `status`            TINYINT       NOT NULL DEFAULT 1 COMMENT '状态：1-启用 0-禁用',
    `sort_order`        INT           NOT NULL DEFAULT 0 COMMENT '排序权重',
    `creator`           VARCHAR(64)            COMMENT '创建人 ID',
    `creator_name`      VARCHAR(128)           COMMENT '创建人名称',
    `create_time`       DATETIME               COMMENT '创建时间',
    `updater`           VARCHAR(64)            COMMENT '更新人 ID',
    `updater_name`      VARCHAR(128)           COMMENT '更新人名称',
    `update_time`       DATETIME               COMMENT '更新时间',
    `deleted`           TINYINT       NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_doc_lib_name` (`name`),
    KEY `idx_category` (`category`),
    KEY `idx_status` (`status`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '文档库表（DocLibrary，指向文件系统目录，助手绑定后注册 list/read/search 工具）';

-- AI 助手表新增 enabled_doc_libs 字段
ALTER TABLE `ai_assistant` ADD COLUMN IF NOT EXISTS `enabled_doc_libs` TEXT COMMENT '已绑定的文档库 ID 列表（JSON 数组）' AFTER `knowledge_base_ids`;

-- AI 中心 - 文档库子菜单
INSERT IGNORE INTO `sys_menu` (`name`, `cn_name`, `en_name`, `url`, `icon`, `pid`, `sort`, `type`, `authority`, `creator`, `create_time`, `deleted`)
SELECT 'menu.ai.doc-library', '文档库', 'Doc Library', 'ai/doc-library-list', 'IconBook', id, 11, 3, NULL, 1, NOW(), 0
FROM `sys_menu` WHERE `name` = 'menu.ai' LIMIT 1;

-- ai_search_config 表补充 name 和 config_json 字段
ALTER TABLE `ai_search_config`
    ADD COLUMN IF NOT EXISTS `name`        VARCHAR(128) COMMENT '配置名称（如：Bing搜索）' AFTER `id`,
    ADD COLUMN IF NOT EXISTS `config_json` TEXT         COMMENT '附加配置 JSON（如 Google cx 字段：{"cx":"..."}）' AFTER `endpoint`;

-- ai_assistant 表新增 web_search_enabled 字段
ALTER TABLE `ai_assistant` ADD COLUMN IF NOT EXISTS `web_search_enabled` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否启用网络搜索兜底：0-禁用 1-启用' AFTER `memory_enabled`;
