-- ============================================
-- BigPrime数据同步平台 - 数据库初始化脚本
-- ============================================
-- 说明：本脚本包含所有核心业务表的创建语句
-- 创建时间：2026-01-05
-- 最后更新：2026-01-05
-- ============================================

-- ============================================
-- 1. 连接器核心表
-- ============================================

-- 连接器元数据表
CREATE TABLE IF NOT EXISTS `data_sync_connector` (
    `id` VARCHAR(64) NOT NULL PRIMARY KEY COMMENT '连接器ID',
    `name` VARCHAR(200) NOT NULL COMMENT '显示名称',
    `description` VARCHAR(500) COMMENT '描述',
    `category` VARCHAR(50) COMMENT '分类',
    `tags` VARCHAR(200) COMMENT '标签',
    `product` VARCHAR(100) NOT NULL COMMENT '产品类型',
    `version` VARCHAR(50) COMMENT '版本',
    `icon` VARCHAR(200) COMMENT '图标',
    `impl_class` VARCHAR(500) COMMENT '实现类',
    `status` VARCHAR(20) DEFAULT 'ACTIVE' COMMENT '状态：ACTIVE/INACTIVE/ERROR',
    `connector_params` TEXT COMMENT '连接参数（JSON格式）',
    `creator` VARCHAR(64) COMMENT '创建者ID',
    `creator_name` VARCHAR(100) COMMENT '创建者名称',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater` VARCHAR(64) COMMENT '更新者ID',
    `updater_name` VARCHAR(100) COMMENT '更新者名称',
    `last_update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
    INDEX `idx_category` (`category`),
    INDEX `idx_product` (`product`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='连接器元数据表';

-- 连接器健康检查配置表
CREATE TABLE IF NOT EXISTS `data_sync_connector_health_config` (
    `id` VARCHAR(64) PRIMARY KEY COMMENT '配置ID',
    `connector_id` VARCHAR(64) NOT NULL UNIQUE COMMENT '连接器ID',
    `enabled` TINYINT(1) DEFAULT 1 COMMENT '是否启用健康检查',
    `check_interval` INT DEFAULT 60000 COMMENT '检查间隔(毫秒)',
    `timeout` INT DEFAULT 5000 COMMENT '超时时间(毫秒)',
    `retry_count` INT DEFAULT 3 COMMENT '失败重试次数',
    `check_level` VARCHAR(20) DEFAULT 'STANDARD' COMMENT '检查级别:QUICK/STANDARD/DEEP',
    `alert_enabled` TINYINT(1) DEFAULT 1 COMMENT '是否启用告警',
    `alert_threshold` INT DEFAULT 3 COMMENT '连续失败多少次触发告警',
    `auto_reconnect` TINYINT(1) DEFAULT 1 COMMENT '是否自动重连',
    `priority` VARCHAR(20) DEFAULT 'MEDIUM' COMMENT '优先级:HIGH/MEDIUM/LOW',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `creator` VARCHAR(64) COMMENT '创建人ID',
    `creator_name` VARCHAR(100) COMMENT '创建人姓名',
    `last_update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
    `updater` VARCHAR(64) COMMENT '更新人ID',
    `updater_name` VARCHAR(100) COMMENT '更新人姓名',
    INDEX `idx_enabled_priority` (`enabled`, `priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='连接器健康检查配置表';

-- 连接器健康检查历史表
CREATE TABLE IF NOT EXISTS `data_sync_connector_health_history` (
    `id` VARCHAR(64) PRIMARY KEY COMMENT '记录ID',
    `connector_id` VARCHAR(64) NOT NULL COMMENT '连接器ID',
    `connector_name` VARCHAR(200) COMMENT '连接器名称',
    `check_time` DATETIME NOT NULL COMMENT '检查时间',
    `healthy` TINYINT(1) NOT NULL COMMENT '是否健康',
    `response_time` BIGINT COMMENT '响应时间(毫秒)',
    `check_level` VARCHAR(20) COMMENT '检查级别',
    `error_message` TEXT COMMENT '错误消息',
    `error_stack` TEXT COMMENT '错误堆栈',
    `details` TEXT COMMENT '详细信息(JSON格式)',
    `connector_status` VARCHAR(50) COMMENT '连接器状态',
    `consecutive_failures` INT DEFAULT 0 COMMENT '连续失败次数',
    INDEX `idx_connector_time` (`connector_id`, `check_time`),
    INDEX `idx_check_time` (`check_time`),
    INDEX `idx_healthy` (`healthy`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='连接器健康检查历史表';

-- 连接器指标小时级聚合表
CREATE TABLE IF NOT EXISTS `data_sync_connector_metrics_hourly` (
    `id` VARCHAR(64) PRIMARY KEY COMMENT '记录ID',
    `connector_id` VARCHAR(64) NOT NULL COMMENT '连接器ID',
    `connector_name` VARCHAR(200) COMMENT '连接器名称',
    `stat_hour` DATETIME NOT NULL COMMENT '统计时间(小时)',
    `total_checks` INT DEFAULT 0 COMMENT '检查总次数',
    `success_count` INT DEFAULT 0 COMMENT '成功次数',
    `failure_count` INT DEFAULT 0 COMMENT '失败次数',
    `success_rate` DECIMAL(5,2) COMMENT '成功率(%)',
    `avg_response_time` BIGINT COMMENT '平均响应时间(毫秒)',
    `min_response_time` BIGINT COMMENT '最小响应时间(毫秒)',
    `max_response_time` BIGINT COMMENT '最大响应时间(毫秒)',
    `p99_response_time` BIGINT COMMENT 'P99响应时间(毫秒)',
    `total_online_time` BIGINT COMMENT '总在线时长(毫秒)',
    `online_rate` DECIMAL(5,2) COMMENT '在线率(%)',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY `uk_connector_hour` (`connector_id`, `stat_hour`),
    INDEX `idx_stat_hour` (`stat_hour`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='连接器指标小时级聚合表';

-- ============================================
-- 2. Action算子相关表
-- ============================================

-- Action算子表
CREATE TABLE IF NOT EXISTS `data_sync_action` (
    `id` VARCHAR(64) NOT NULL COMMENT 'Action主键',
    `namespace` VARCHAR(100) COMMENT 'Action命名空间，用于区分不同来源的Action实现',
    `code` VARCHAR(100) NOT NULL COMMENT 'Action编码',
    `name` VARCHAR(200) NOT NULL COMMENT 'Action名称',
    `description` VARCHAR(500) COMMENT 'Action描述',
    `fst_category` VARCHAR(50) COMMENT 'Action一级分类',
    `snd_category` VARCHAR(50) COMMENT 'Action二级分类',
    `trd_category` VARCHAR(50) COMMENT 'Action三级分类',
    `fth_category` VARCHAR(50) COMMENT 'Action四级分类',
    `version` VARCHAR(20) COMMENT 'Action版本',
    `clazz` VARCHAR(500) NOT NULL COMMENT 'Action实现类全限定名',
    `param_clazz` VARCHAR(500) COMMENT '参数类全限定名',
    `jar_name` VARCHAR(200) COMMENT '所属jar包名称',
    `author` VARCHAR(100) COMMENT 'Action作者',
    `author_name` VARCHAR(100) COMMENT 'Action作者姓名',
    `register_time` DATETIME COMMENT '注册时间',
    `update_time` DATETIME COMMENT '更新时间',
    `status` TINYINT(1) DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_namespace_code_version` (`namespace`, `code`, `version`),
    INDEX `idx_namespace` (`namespace`),
    INDEX `idx_code` (`code`),
    INDEX `idx_category` (`fst_category`, `snd_category`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Action算子元数据表';

-- Action参数定义表
CREATE TABLE IF NOT EXISTS `data_sync_action_param` (
    `clazz` VARCHAR(500) NOT NULL COMMENT '参数类全限定名，与Action表的param_clazz相同',
    `name` VARCHAR(100) NOT NULL COMMENT '参数名称',
    `title` VARCHAR(200) COMMENT '参数标题',
    `description` VARCHAR(500) COMMENT '参数描述',
    `is_required` TINYINT(1) DEFAULT 0 COMMENT '是否必填：0-否，1-是',
    `value_type` VARCHAR(50) COMMENT '值类型，在实际设置默认值时需要根据该类型转换为参数定义的实际类型',
    `component_type` VARCHAR(50) DEFAULT 'INPUT' COMMENT '控件类型，默认为文本框',
    `component_config` TEXT COMMENT '控件配置（JSON格式）',
    `default_value` VARCHAR(1000) COMMENT '默认值',
    `is_hidden` TINYINT(1) DEFAULT 0 COMMENT '是否隐藏：0-否，1-是',
    `position` INT DEFAULT 999 COMMENT '字段排序位置，用于控制表单字段的显示顺序，数值越小越靠前',
    PRIMARY KEY (`clazz`, `name`),
    INDEX `idx_clazz` (`clazz`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Action参数定义表';

-- ============================================
-- 3. 流程编排相关表
-- ============================================

-- 流程编排表
CREATE TABLE IF NOT EXISTS `data_sync_flow` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键id',
    `name` VARCHAR(255) NOT NULL COMMENT '流程名称',
    `description` VARCHAR(500) COMMENT '流程描述',
    `flow_data` TEXT COMMENT '流程图数据(JSON格式)',
    `status` VARCHAR(20) DEFAULT 'DRAFT' COMMENT '流程状态: DRAFT-草稿, RUNNING-运行中, STOPPED-已停止, FAILED-失败',
    
    -- 执行模式
    `execution_mode` VARCHAR(20) DEFAULT 'http' COMMENT '执行模式: http(同步) 或 mq(异步)',
    
    -- 任务来源（用于区分不同业务场景）
    `task_source` VARCHAR(50) DEFAULT 'MANUAL' COMMENT '任务来源: MANUAL(手动创建), CRAWLER(爬虫), ETL(数据集成), API(接口调度)',
    
    -- 通用字段
    `creator` BIGINT NULL COMMENT '创建者',
    `creator_name` VARCHAR(128) NULL COMMENT '创建者名称',
    `create_time` DATETIME NULL COMMENT '创建时间',
    `updater` BIGINT NULL COMMENT '更新者',
    `updater_name` VARCHAR(128) NULL COMMENT '更新者名称',
    `update_time` DATETIME NULL COMMENT '更新时间',
    `deleted` TINYINT NULL COMMENT '删除标识  0：正常   1：已删除',
    PRIMARY KEY (`id`),
    INDEX `idx_task_source` (`task_source`),
    INDEX `idx_status` (`status`),
    INDEX `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='流程编排表';

-- ============================================
-- 4. DAG执行相关表
-- ============================================

-- DAG执行记录表
CREATE TABLE IF NOT EXISTS `data_sync_dag_execution` (
    `id` VARCHAR(64) NOT NULL COMMENT '主键ID（执行记录ID）',
    `dag_id` VARCHAR(64) NOT NULL COMMENT 'DAG ID（业务标识）',
    `dag_name` VARCHAR(255) DEFAULT NULL COMMENT 'DAG名称',
    `description` VARCHAR(500) DEFAULT NULL COMMENT 'DAG描述',
    `status` VARCHAR(32) NOT NULL DEFAULT 'INIT' COMMENT '执行状态：INIT/RUNNING/PAUSED/SUCCESS/FAILED/CANCELLED',
    `progress` INT DEFAULT 0 COMMENT '执行进度（0-100）',
    `total_nodes` INT DEFAULT 0 COMMENT '总节点数',
    `completed_nodes` INT DEFAULT 0 COMMENT '已完成节点数',
    `failed_nodes` INT DEFAULT 0 COMMENT '失败节点数',
    `start_time` DATETIME DEFAULT NULL COMMENT '开始时间',
    `end_time` DATETIME DEFAULT NULL COMMENT '结束时间',
    `duration` BIGINT DEFAULT NULL COMMENT '执行耗时（毫秒）',
    `error_message` TEXT DEFAULT NULL COMMENT '错误信息',
    `error_stack` LONGTEXT DEFAULT NULL COMMENT '错误堆栈',
    `last_executed_node` VARCHAR(64) DEFAULT NULL COMMENT '最后执行的节点ID',
    `dag_config` LONGTEXT DEFAULT NULL COMMENT 'DAG配置（JSON）',
    `execution_context` LONGTEXT DEFAULT NULL COMMENT '执行上下文（JSON）',
    `collapsed_nodes` LONGTEXT DEFAULT NULL COMMENT '收拢节点映射（JSON）',
    `execution_logs` LONGTEXT DEFAULT NULL COMMENT '执行日志（文本格式，换行分隔）',
    `trigger_type` VARCHAR(20) DEFAULT 'MANUAL' COMMENT '触发类型（MANUAL-手动触发, SCHEDULE-调度触发）',
    `schedule_id` BIGINT DEFAULT NULL COMMENT '调度配置ID（如果是调度触发，记录对应的触发器ID）',
    `creator` VARCHAR(64) DEFAULT NULL COMMENT '创建者',
    `creator_name` VARCHAR(128) DEFAULT NULL COMMENT '创建者名称',
    `create_time` DATETIME NOT NULL COMMENT '创建时间',
    `updater` VARCHAR(64) DEFAULT NULL COMMENT '更新者',
    `updater_name` VARCHAR(128) DEFAULT NULL COMMENT '更新者名称',
    `last_update_time` DATETIME NOT NULL COMMENT '最后更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_dag_id` (`dag_id`),
    KEY `idx_status` (`status`),
    KEY `idx_create_time` (`create_time`),
    KEY `idx_trigger_type` (`trigger_type`),
    KEY `idx_schedule_id` (`schedule_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='DAG执行记录';

-- DAG节点执行记录表
CREATE TABLE IF NOT EXISTS `data_sync_dag_node_execution` (
    `id` VARCHAR(64) NOT NULL COMMENT '主键ID（UUID）',
    `dag_execution_id` VARCHAR(64) NOT NULL COMMENT 'DAG执行记录ID',
    `node_id` VARCHAR(64) NOT NULL COMMENT '节点ID',
    `node_name` VARCHAR(255) DEFAULT NULL COMMENT '节点名称',
    `node_type` VARCHAR(128) DEFAULT NULL COMMENT '节点类型（算子类型）',
    `status` VARCHAR(32) NOT NULL DEFAULT 'PENDING' COMMENT '状态：PENDING/RUNNING/SUCCESS/FAILED/SKIPPED',
    `execute_order` INT DEFAULT NULL COMMENT '执行顺序',
    `retry_count` INT DEFAULT 0 COMMENT '重试次数',
    `start_time` DATETIME DEFAULT NULL COMMENT '开始时间',
    `end_time` DATETIME DEFAULT NULL COMMENT '结束时间',
    `duration` BIGINT DEFAULT NULL COMMENT '耗时（毫秒）',
    `input_params` LONGTEXT COMMENT '输入参数（JSON）',
    `output_result` LONGTEXT COMMENT '输出结果（JSON配置片段或引用）',
    `error_message` TEXT DEFAULT NULL COMMENT '错误信息',
    `error_stack` LONGTEXT COMMENT '错误堆栈',
    `metadata` LONGTEXT COMMENT '元数据（JSON，包含收拢信息等）',
    `external_job_id` VARCHAR(100) DEFAULT NULL COMMENT '外部任务ID(SeaTunnel/Flink)',
    `external_job_status` VARCHAR(50) DEFAULT NULL COMMENT '外部任务状态',
    `external_job_url` VARCHAR(500) DEFAULT NULL COMMENT '外部任务监控URL',
    `external_metrics` TEXT DEFAULT NULL COMMENT '外部任务指标(JSON)',
    `external_engine_type` VARCHAR(20) DEFAULT NULL COMMENT '外部引擎类型(SEATUNNEL/FLINK)',
    `create_time` DATETIME NOT NULL COMMENT '创建时间',
    `last_update_time` DATETIME NOT NULL COMMENT '最后更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_dag_exec` (`dag_execution_id`),
    KEY `idx_node_id` (`node_id`),
    KEY `idx_status` (`status`),
    KEY `idx_exec_order` (`execute_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='DAG节点执行记录';

-- DAG触发器表
CREATE TABLE IF NOT EXISTS `dag_trigger` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `dag_definition_id` VARCHAR(64) NOT NULL COMMENT 'DAG定义ID',
    `name` VARCHAR(100) NOT NULL COMMENT '触发器名称',
    `type` VARCHAR(20) NOT NULL COMMENT '触发器类型: CRON(定时), MANUAL(手动)',
    `cron_expression` VARCHAR(100) COMMENT 'Cron表达式',
    `enabled` TINYINT(1) DEFAULT 0 COMMENT '是否启用',
    `concurrency_policy` VARCHAR(20) DEFAULT 'FORBID' COMMENT '并发策略: FORBID(不允许并发), REPLACE(取消旧的), ALLOW(允许并行)',
    `max_parallel` INT DEFAULT 3 COMMENT '最大并行执行数',
    `dedup_key_expression` VARCHAR(200) COMMENT '去重键表达式',
    `trigger_context` TEXT COMMENT '触发上下文(JSON格式)',
    `next_fire_time` DATETIME COMMENT '下一次触发时间',
    `last_fire_time` DATETIME COMMENT '上一次触发时间',
    `fire_count` BIGINT DEFAULT 0 COMMENT '触发次数统计',
    `owner` VARCHAR(50) COMMENT '触发器所有者',
    `description` VARCHAR(500) COMMENT '描述',
    `deleted` TINYINT NULL COMMENT '删除标识  0：正常   1：已删除',
    `creator` BIGINT NULL COMMENT '创建者',
    `create_time` DATETIME NULL COMMENT '创建时间',
    `updater` BIGINT NULL COMMENT '更新者',
    `update_time` DATETIME NULL COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_dag_definition_id` (`dag_definition_id`),
    INDEX `idx_enabled_type` (`enabled`, `type`),
    INDEX `idx_next_fire_time` (`next_fire_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='DAG触发器配置表';

-- ============================================
-- 5. 数据血缘相关表
-- ============================================

-- 数据血缘关系表
CREATE TABLE IF NOT EXISTS `data_lineage` (
    `id` VARCHAR(64) PRIMARY KEY COMMENT '主键ID',
    `name` VARCHAR(500) COMMENT '血缘关系名称',
    
    -- 源端信息
    `source_type` VARCHAR(50) COMMENT '源端类型（MySQL/PostgreSQL/Kafka/File等）',
    `source_connector_id` VARCHAR(64) COMMENT '源端连接器ID',
    `source_database` VARCHAR(200) COMMENT '源端数据库名',
    `source_table` VARCHAR(200) COMMENT '源端表名/Topic名/文件路径',
    `source_fields` TEXT COMMENT '源端字段列表（JSON格式）',
    
    -- 目标端信息
    `target_type` VARCHAR(50) COMMENT '目标端类型',
    `target_connector_id` VARCHAR(64) COMMENT '目标端连接器ID',
    `target_database` VARCHAR(200) COMMENT '目标端数据库名',
    `target_table` VARCHAR(200) COMMENT '目标端表名/Topic名/文件路径',
    `target_fields` TEXT COMMENT '目标端字段列表（JSON格式）',
    
    -- 转换信息
    `field_mapping` TEXT COMMENT '字段映射关系（JSON格式）',
    `transform_logic` TEXT COMMENT '数据转换逻辑（JSON格式）',
    
    -- DAG执行信息
    `dag_execution_id` VARCHAR(64) COMMENT '关联的DAG执行ID',
    `dag_definition_id` VARCHAR(64) COMMENT '关联的DAG定义ID',
    `node_id` VARCHAR(100) COMMENT '关联的节点ID',
    `node_name` VARCHAR(200) COMMENT '节点名称',
    
    -- 统计信息
    `record_count` BIGINT DEFAULT 0 COMMENT '处理的记录数',
    `quality_score` INT COMMENT '数据质量得分（0-100）',
    `status` VARCHAR(20) DEFAULT 'RUNNING' COMMENT '执行状态（SUCCESS/FAILED/RUNNING）',
    
    -- 执行时间
    `start_time` DATETIME COMMENT '开始时间',
    `end_time` DATETIME COMMENT '结束时间',
    `duration_ms` BIGINT COMMENT '执行耗时（毫秒）',
    `error_message` TEXT COMMENT '错误信息',
    
    -- 血缘层级
    `lineage_level` INT DEFAULT 0 COMMENT '血缘层级（0表示原始数据源）',
    `parent_lineage_id` VARCHAR(64) COMMENT '父血缘ID',
    
    -- 备注
    `remark` TEXT COMMENT '备注',
    
    -- 通用字段
    `create_user` VARCHAR(64) COMMENT '创建人',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_user` VARCHAR(64) COMMENT '更新人',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除标识（0-未删除，1-已删除）',
    
    -- 索引
    INDEX `idx_source` (`source_type`, `source_database`, `source_table`),
    INDEX `idx_target` (`target_type`, `target_database`, `target_table`),
    INDEX `idx_dag_execution` (`dag_execution_id`),
    INDEX `idx_dag_definition` (`dag_definition_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_start_time` (`start_time`),
    INDEX `idx_lineage_level` (`lineage_level`),
    INDEX `idx_parent_lineage` (`parent_lineage_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据血缘关系表';

-- ============================================
-- 6. 爬虫相关表
-- ============================================

-- 爬虫任务扩展表（关联 data_sync_flow 表）
CREATE TABLE IF NOT EXISTS `data_sync_flow_crawler` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `flow_id` BIGINT NOT NULL COMMENT '关联的流程ID',
    
    -- 爬虫特有属性
    `task_type` VARCHAR(20) DEFAULT 'SINGLE' COMMENT '任务类型: SINGLE(单次), SCHEDULED(定时), MANUAL(手动)',
    `target_url` VARCHAR(500) DEFAULT NULL COMMENT '目标URL或URL模式',
    `template_id` VARCHAR(64) DEFAULT NULL COMMENT '模板ID(如果基于模板创建)',
    `template_name` VARCHAR(200) DEFAULT NULL COMMENT '模板名称',
    
    -- 调度配置
    `enabled` TINYINT(1) DEFAULT 0 COMMENT '是否启用',
    `cron_expression` VARCHAR(100) DEFAULT NULL COMMENT '调度表达式(Cron格式)',
    `next_execution_time` DATETIME DEFAULT NULL COMMENT '下次执行时间',
    
    -- 执行配置
    `retry_count` INT DEFAULT 3 COMMENT '重试次数',
    `timeout` INT DEFAULT 300 COMMENT '超时时间(秒)',
    `concurrency` INT DEFAULT 1 COMMENT '并发数',
    
    -- 执行统计
    `total_executions` BIGINT DEFAULT 0 COMMENT '总执行次数',
    `success_executions` BIGINT DEFAULT 0 COMMENT '成功执行次数',
    `failed_executions` BIGINT DEFAULT 0 COMMENT '失败执行次数',
    `last_execution_time` DATETIME DEFAULT NULL COMMENT '最后执行时间',
    
    -- 通用字段
    `creator` VARCHAR(64) DEFAULT NULL COMMENT '创建者',
    `creator_name` VARCHAR(128) DEFAULT NULL COMMENT '创建者名称',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater` VARCHAR(64) DEFAULT NULL COMMENT '更新者',
    `updater_name` VARCHAR(128) DEFAULT NULL COMMENT '更新者名称',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除标识(0-未删除, 1-已删除)',
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_flow_id` (`flow_id`),  -- 一个流程只能有一个爬虫扩展
    KEY `idx_template_id` (`template_id`),
    KEY `idx_enabled` (`enabled`),
    KEY `idx_next_execution_time` (`next_execution_time`),
    KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='爬虫任务扩展表';

-- 爬虫执行历史扩展表（关联 data_sync_dag_execution 表）
CREATE TABLE IF NOT EXISTS `data_sync_dag_execution_crawler` (
    `id` VARCHAR(64) NOT NULL COMMENT '主键ID',
    `dag_execution_id` VARCHAR(64) NOT NULL COMMENT '关联的DAG执行ID',
    
    -- 爬虫特有统计信息
    `url_count` INT DEFAULT 0 COMMENT '爬取的URL数量',
    `success_url_count` INT DEFAULT 0 COMMENT '成功爬取的URL数量',
    `failed_url_count` INT DEFAULT 0 COMMENT '失败的URL数量',
    `record_count` BIGINT DEFAULT 0 COMMENT '提取的数据记录数',
    `stored_record_count` BIGINT DEFAULT 0 COMMENT '存储的数据记录数',
    
    -- 通用字段
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_dag_execution_id` (`dag_execution_id`),  -- 一个DAG执行只能有一个爬虫扩展
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='爬虫执行历史扩展表';

-- Robots协议缓存表
CREATE TABLE IF NOT EXISTS `data_crawler_robots_cache` (
    `id` VARCHAR(64) NOT NULL COMMENT '主键ID',
    `domain` VARCHAR(200) NOT NULL COMMENT '域名',
    `robots_content` LONGTEXT DEFAULT NULL COMMENT 'robots.txt内容',
    `allowed` TINYINT(1) DEFAULT 1 COMMENT '是否允许爬取',
    `crawl_delay` BIGINT DEFAULT 0 COMMENT '爬取延迟(毫秒)',
    `user_agent` VARCHAR(200) DEFAULT 'BigPrime-Crawler/1.0' COMMENT 'User-Agent',
    `robots_url` VARCHAR(500) DEFAULT NULL COMMENT 'robots.txt URL',
    `status_code` INT DEFAULT NULL COMMENT 'HTTP状态码',
    `cache_time` DATETIME DEFAULT NULL COMMENT '缓存时间',
    `expire_time` DATETIME DEFAULT NULL COMMENT '过期时间',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_domain_ua` (`domain`, `user_agent`),
    KEY `idx_domain` (`domain`),
    KEY `idx_expire_time` (`expire_time`),
    KEY `idx_cache_time` (`cache_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Robots协议缓存表';

-- 爬虫账号池表
CREATE TABLE IF NOT EXISTS `data_crawler_account` (
    `id` VARCHAR(64) NOT NULL COMMENT '主键ID',
    `name` VARCHAR(200) NOT NULL COMMENT '账号名称/标识',
    `platform` VARCHAR(100) NOT NULL COMMENT '所属平台/网站',
    `username` VARCHAR(200) NOT NULL COMMENT '登录用户名',
    `password` VARCHAR(500) DEFAULT NULL COMMENT '登录密码(加密存储)',
    `cookies` LONGTEXT DEFAULT NULL COMMENT 'Cookie信息',
    `token` VARCHAR(1000) DEFAULT NULL COMMENT 'Token信息',
    `status` VARCHAR(20) DEFAULT 'ACTIVE' COMMENT '账号状态: ACTIVE(可用), INACTIVE(不可用), COOLING(冷却中), BANNED(已封禁)',
    `login_status` VARCHAR(20) DEFAULT NULL COMMENT '登录状态: LOGGED_IN(已登录), LOGGED_OUT(未登录), LOGIN_FAILED(登录失败)',
    `account_level` VARCHAR(50) DEFAULT NULL COMMENT '账号等级/会员类型',
    `use_count` BIGINT DEFAULT 0 COMMENT '使用次数',
    `success_count` BIGINT DEFAULT 0 COMMENT '成功次数',
    `failure_count` BIGINT DEFAULT 0 COMMENT '失败次数',
    `last_login_time` DATETIME DEFAULT NULL COMMENT '最后登录时间',
    `last_use_time` DATETIME DEFAULT NULL COMMENT '最后使用时间',
    `token_expire_time` DATETIME DEFAULT NULL COMMENT 'Token过期时间',
    `priority` INT DEFAULT 50 COMMENT '优先级(数值越大优先级越高)',
    `remark` VARCHAR(1000) DEFAULT NULL COMMENT '备注',
    `creator` VARCHAR(64) DEFAULT NULL COMMENT '创建者',
    `creator_name` VARCHAR(128) DEFAULT NULL COMMENT '创建者名称',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater` VARCHAR(64) DEFAULT NULL COMMENT '更新者',
    `updater_name` VARCHAR(128) DEFAULT NULL COMMENT '更新者名称',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除标识(0-未删除, 1-已删除)',
    PRIMARY KEY (`id`),
    KEY `idx_platform` (`platform`),
    KEY `idx_status` (`status`),
    KEY `idx_priority` (`priority`),
    KEY `idx_deleted` (`deleted`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='爬虫账号池表';

-- 爬虫代理IP表
CREATE TABLE IF NOT EXISTS `data_crawler_proxy` (
    `id` VARCHAR(64) NOT NULL COMMENT '主键ID',
    `name` VARCHAR(200) NOT NULL COMMENT '代理名称',
    `host` VARCHAR(200) NOT NULL COMMENT '代理服务器地址',
    `port` INT NOT NULL COMMENT '代理服务器端口',
    `proxy_type` VARCHAR(20) DEFAULT 'HTTP' COMMENT '代理类型: HTTP, HTTPS, SOCKS4, SOCKS5',
    `username` VARCHAR(200) DEFAULT NULL COMMENT '用户名(如需认证)',
    `password` VARCHAR(500) DEFAULT NULL COMMENT '密码(如需认证)',
    `status` VARCHAR(20) DEFAULT 'ACTIVE' COMMENT '代理状态: ACTIVE(可用), INACTIVE(不可用), TESTING(检测中)',
    `region` VARCHAR(100) DEFAULT NULL COMMENT '地区/国家',
    `provider` VARCHAR(200) DEFAULT NULL COMMENT '供应商',
    `response_time` INT DEFAULT NULL COMMENT '响应时间(毫秒)',
    `success_count` BIGINT DEFAULT 0 COMMENT '成功次数',
    `failure_count` BIGINT DEFAULT 0 COMMENT '失败次数',
    `last_success_time` DATETIME DEFAULT NULL COMMENT '最后成功时间',
    `last_failure_time` DATETIME DEFAULT NULL COMMENT '最后失败时间',
    `last_check_time` DATETIME DEFAULT NULL COMMENT '最后检测时间',
    `priority` INT DEFAULT 50 COMMENT '优先级(数值越大优先级越高)',
    `remark` VARCHAR(1000) DEFAULT NULL COMMENT '备注',
    `creator` VARCHAR(64) DEFAULT NULL COMMENT '创建者',
    `creator_name` VARCHAR(128) DEFAULT NULL COMMENT '创建者名称',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater` VARCHAR(64) DEFAULT NULL COMMENT '更新者',
    `updater_name` VARCHAR(128) DEFAULT NULL COMMENT '更新者名称',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除标识(0-未删除, 1-已删除)',
    PRIMARY KEY (`id`),
    KEY `idx_host_port` (`host`, `port`),
    KEY `idx_status` (`status`),
    KEY `idx_priority` (`priority`),
    KEY `idx_region` (`region`),
    KEY `idx_deleted` (`deleted`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='爬虫代理IP表';

-- 爬虫配置表 (KV形式)
CREATE TABLE IF NOT EXISTS `data_crawler_config` (
    `id` VARCHAR(64) NOT NULL COMMENT '配置ID',
    `config_key` VARCHAR(100) NOT NULL COMMENT '配置键',
    `config_value` VARCHAR(1000) DEFAULT NULL COMMENT '配置值',
    `extend1` VARCHAR(500) DEFAULT NULL COMMENT '扩展字段1',
    `extend2` VARCHAR(500) DEFAULT NULL COMMENT '扩展字段2',
    `extend3` VARCHAR(500) DEFAULT NULL COMMENT '扩展字段3',
    `description` VARCHAR(1000) DEFAULT NULL COMMENT '配置说明',
    `status` VARCHAR(20) DEFAULT 'ACTIVE' COMMENT '配置状态: ACTIVE(启用), INACTIVE(禁用)',
    `creator` VARCHAR(64) DEFAULT NULL COMMENT '创建者',
    `creator_name` VARCHAR(128) DEFAULT NULL COMMENT '创建者名称',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater` VARCHAR(64) DEFAULT NULL COMMENT '更新者',
    `updater_name` VARCHAR(128) DEFAULT NULL COMMENT '更新者名称',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除标识(0-未删除, 1-已删除)',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_config_key` (`config_key`, `deleted`),
    KEY `idx_status` (`status`),
    KEY `idx_deleted` (`deleted`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='爬虫配置表';

-- 爬虫执行历史表
CREATE TABLE IF NOT EXISTS `data_crawler_execution_history` (
    `id` VARCHAR(64) NOT NULL COMMENT '主键ID',
    `task_id` VARCHAR(64) NOT NULL COMMENT '爬虫任务ID',
    `task_name` VARCHAR(200) DEFAULT NULL COMMENT '任务名称',
    `dag_execution_id` VARCHAR(64) DEFAULT NULL COMMENT 'DAG执行ID(关联DAG执行记录)',
    `status` VARCHAR(20) DEFAULT 'INIT' COMMENT '执行状态: INIT(初始化), RUNNING(运行中), SUCCESS(成功), FAILED(失败), CANCELLED(取消)',
    `start_time` DATETIME DEFAULT NULL COMMENT '开始时间',
    `end_time` DATETIME DEFAULT NULL COMMENT '结束时间',
    `duration` BIGINT DEFAULT NULL COMMENT '执行耗时(毫秒)',
    `url_count` INT DEFAULT 0 COMMENT '爬取的URL数量',
    `success_url_count` INT DEFAULT 0 COMMENT '成功爬取的URL数量',
    `failed_url_count` INT DEFAULT 0 COMMENT '失败的URL数量',
    `record_count` BIGINT DEFAULT 0 COMMENT '提取的数据记录数',
    `stored_record_count` BIGINT DEFAULT 0 COMMENT '存储的数据记录数',
    `progress` INT DEFAULT 0 COMMENT '执行进度(0-100)',
    `error_message` TEXT DEFAULT NULL COMMENT '错误信息',
    `error_stack` LONGTEXT DEFAULT NULL COMMENT '错误堆栈',
    `trigger_type` VARCHAR(20) DEFAULT 'MANUAL' COMMENT '触发方式: MANUAL(手动), SCHEDULED(定时), API(接口)',
    `trigger_user` VARCHAR(128) DEFAULT NULL COMMENT '触发人',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_task_id` (`task_id`),
    KEY `idx_dag_execution_id` (`dag_execution_id`),
    KEY `idx_status` (`status`),
    KEY `idx_start_time` (`start_time`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='爬虫执行历史表';

-- 爬虫模板表
CREATE TABLE IF NOT EXISTS `data_crawler_template` (
    `id` VARCHAR(64) NOT NULL COMMENT '主键ID',
    `template_code` VARCHAR(100) NOT NULL COMMENT '模板编码(唯一标识)',
    `template_name` VARCHAR(200) NOT NULL COMMENT '模板名称',
    `category` VARCHAR(50) NOT NULL COMMENT '模板分类: NEWS(新闻), ECOMMERCE(电商), JOB(招聘), BLOG(博客), WEATHER(天气), STOCK(股票), SOCIAL(社交), API(接口)',
    `description` VARCHAR(1000) DEFAULT NULL COMMENT '模板描述',
    `difficulty` VARCHAR(20) DEFAULT 'EASY' COMMENT '难度等级: EASY(简单), MEDIUM(中等), HARD(困难)',
    `dag_config` LONGTEXT NOT NULL COMMENT 'DAG配置(JSON格式,包含节点、连线、参数配置)',
    `default_params` TEXT DEFAULT NULL COMMENT '默认参数配置(JSON格式)',
    `icon` VARCHAR(500) DEFAULT NULL COMMENT '模板图标URL',
    `tags` VARCHAR(500) DEFAULT NULL COMMENT '标签(逗号分隔)',
    `use_count` INT DEFAULT 0 COMMENT '使用次数',
    `rating` DECIMAL(3,2) DEFAULT 0.00 COMMENT '评分(0-5)',
    `is_preset` TINYINT(1) DEFAULT 0 COMMENT '是否预置模板(0-否, 1-是)',
    `status` VARCHAR(20) DEFAULT 'ACTIVE' COMMENT '模板状态: ACTIVE(启用), INACTIVE(禁用)',
    `creator` VARCHAR(64) DEFAULT NULL COMMENT '创建者',
    `creator_name` VARCHAR(128) DEFAULT NULL COMMENT '创建者名称',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater` VARCHAR(64) DEFAULT NULL COMMENT '更新者',
    `updater_name` VARCHAR(128) DEFAULT NULL COMMENT '更新者名称',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除标识(0-未删除, 1-已删除)',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_template_code` (`template_code`, `deleted`),
    KEY `idx_category` (`category`),
    KEY `idx_difficulty` (`difficulty`),
    KEY `idx_status` (`status`),
    KEY `idx_deleted` (`deleted`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='爬虫模板表';

-- 预置模板数据
INSERT INTO `data_crawler_template` (`id`, `template_code`, `template_name`, `category`, `description`, `difficulty`, `dag_config`, `default_params`, `icon`, `tags`, `use_count`, `rating`, `is_preset`, `status`, `creator`, `creator_name`, `create_time`, `deleted`) VALUES
('tpl_news_001', 'NEWS_LIST_CRAWLER', '新闻列表爬虫', 'NEWS', '用于爬取新闻网站的文章列表，支持分页爬取', 'EASY', '{"nodes":[{"id":"fetch","type":"CRAWLER_FETCH_HTTP"},{"id":"parse","type":"CRAWLER_PARSE_HTML"},{"id":"store","type":"CRAWLER_STORE_DATA"}]}', '{"selector":".news-list .news-item","fields":[{"name":"title","selector":".title"}]}', null, '新闻,列表', 0, 4.50, 1, 'ACTIVE', 'system', '系统', NOW(), 0),
('tpl_ecommerce_001', 'ECOMMERCE_PRODUCT_CRAWLER', '电商商品爬虫', 'ECOMMERCE', '爬取电商平台的商品信息', 'MEDIUM', '{"nodes":[{"id":"fetch","type":"CRAWLER_FETCH_HTTP"},{"id":"parse","type":"CRAWLER_PARSE_HTML"}]}', '{"selector":".product-item"}', null, '电商,商品', 0, 4.20, 1, 'ACTIVE', 'system', '系统', NOW(), 0),
('tpl_job_001', 'JOB_LISTING_CRAWLER', '招聘信息爬虫', 'JOB', '爬取招聘网站的职位信息', 'EASY', '{"nodes":[{"id":"fetch","type":"CRAWLER_FETCH_HTTP"}]}', null, null, '招聘,职位', 0, 4.30, 1, 'ACTIVE', 'system', '系统', NOW(), 0),
('tpl_blog_001', 'BLOG_ARTICLE_CRAWLER', '博客文章爬虫', 'BLOG', '爬取博客文章内容', 'EASY', '{"nodes":[{"id":"fetch","type":"CRAWLER_FETCH_HTTP"}]}', null, null, '博客,文章', 0, 4.10, 1, 'ACTIVE', 'system', '系统', NOW(), 0),
('tpl_weather_001', 'WEATHER_DATA_CRAWLER', '天气数据爬虫', 'WEATHER', '爬取天气预报数据', 'EASY', '{"nodes":[{"id":"fetch","type":"CRAWLER_FETCH_HTTP"}]}', null, null, '天气', 0, 4.00, 1, 'ACTIVE', 'system', '系统', NOW(), 0),
('tpl_stock_001', 'STOCK_DATA_CRAWLER', '股票数据爬虫', 'STOCK', '爬取股票行情数据', 'MEDIUM', '{"nodes":[{"id":"fetch","type":"CRAWLER_FETCH_HTTP"}]}', null, null, '股票,金融', 0, 4.40, 1, 'ACTIVE', 'system', '系统', NOW(), 0),
('tpl_social_001', 'SOCIAL_POST_CRAWLER', '社交媒体爬虫', 'SOCIAL', '爬取社交媒体帖子内容', 'HARD', '{"nodes":[{"id":"render","type":"CRAWLER_RENDER_BROWSER"}]}', null, null, '社交', 0, 3.90, 1, 'ACTIVE', 'system', '系统', NOW(), 0),
('tpl_api_001', 'API_DATA_CRAWLER', 'API接口爬虫', 'API', '爬取RESTful API数据', 'EASY', '{"nodes":[{"id":"fetch","type":"CRAWLER_FETCH_HTTP"}]}', null, null, 'API,JSON', 0, 4.60, 1, 'ACTIVE', 'system', '系统', NOW(), 0);

-- ============================================
-- 7. 查询模块相关表
-- ============================================

-- Catalog配置表
CREATE TABLE IF NOT EXISTS `ds_catalog_config` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `catalog_name` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Catalog名称',
    `star_rocks_connector_id` VARCHAR(50) NOT NULL COMMENT 'StarRocks连接器ID',
    `data_source_type` VARCHAR(50) NOT NULL COMMENT '数据源类型',
    `data_source_connector_id` VARCHAR(50) NOT NULL COMMENT '数据源连接器ID',
    `driver_url` VARCHAR(500) COMMENT 'JDBC驱动URL',
    `status` VARCHAR(20) DEFAULT 'ACTIVE' COMMENT '状态: ACTIVE/ERROR/DELETED',
    `creator` VARCHAR(50) COMMENT '创建者ID',
    `creator_name` VARCHAR(100) COMMENT '创建者名称',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater` VARCHAR(50) COMMENT '更新者ID',
    `updater_name` VARCHAR(100) COMMENT '更新者名称',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_sr_connector` (`star_rocks_connector_id`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Catalog配置表';

-- 查询历史表
CREATE TABLE IF NOT EXISTS `ds_query_history` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `user_id` VARCHAR(50) COMMENT '用户ID',
    `sql` TEXT NOT NULL COMMENT 'SQL语句',
    `star_rocks_connector_id` VARCHAR(50) COMMENT 'StarRocks连接器ID',
    `execute_time` BIGINT COMMENT '执行时长(毫秒)',
    `success` BOOLEAN COMMENT '是否成功',
    `error_message` TEXT COMMENT '错误信息',
    `result_rows` BIGINT COMMENT '结果行数',
    `execute_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '执行时间',
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_execute_at` (`execute_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='查询历史表';

-- SQL API配置表
CREATE TABLE IF NOT EXISTS `ds_sql_api` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `api_path` VARCHAR(200) NOT NULL UNIQUE COMMENT 'API路径',
    `api_name` VARCHAR(100) NOT NULL COMMENT 'API名称',
    `description` VARCHAR(500) COMMENT 'API描述',
    `sql_template` TEXT NOT NULL COMMENT 'SQL模板(支持{{param}}占位符)',
    `star_rocks_connector_id` VARCHAR(50) NOT NULL COMMENT 'StarRocks连接器ID',
    `method` VARCHAR(10) DEFAULT 'POST' COMMENT '请求方法: GET/POST',
    `parameters` TEXT COMMENT '参数定义(JSON格式)',
    `enabled` BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    `timeout` INT DEFAULT 30 COMMENT '超时时间(秒)',
    `max_rows` INT DEFAULT 1000 COMMENT '最大返回行数',
    `creator` VARCHAR(50) COMMENT '创建者',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_api_path` (`api_path`),
    INDEX `idx_enabled` (`enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SQL API配置表';

-- ============================================
-- 8. 血缘模块详细表
-- ============================================

-- 血缘数据源节点表
CREATE TABLE IF NOT EXISTS `data_lineage_datasource` (
    `id` VARCHAR(64) NOT NULL COMMENT '主键ID',
    `name` VARCHAR(200) NOT NULL COMMENT '数据源名称',
    `type` VARCHAR(50) NOT NULL COMMENT '数据源类型(MySQL/Oracle/PostgreSQL/Hive/StarRocks/Neo4j等)',
    `connector_id` VARCHAR(64) DEFAULT NULL COMMENT '连接器ID(关联connector表)',
    `description` VARCHAR(500) DEFAULT NULL COMMENT '数据源描述',
    `config` TEXT DEFAULT NULL COMMENT '数据源配置(JSON)',
    `status` VARCHAR(20) DEFAULT 'ACTIVE' COMMENT '状态(ACTIVE/INACTIVE/DELETED)',
    `creator` VARCHAR(64) DEFAULT NULL COMMENT '创建者',
    `creator_name` VARCHAR(100) DEFAULT NULL COMMENT '创建者名称',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater` VARCHAR(64) DEFAULT NULL COMMENT '更新者',
    `updater_name` VARCHAR(100) DEFAULT NULL COMMENT '更新者名称',
    `last_update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_connector_id` (`connector_id`),
    KEY `idx_type` (`type`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='血缘数据源节点表';

-- 血缘表节点表
CREATE TABLE IF NOT EXISTS `data_lineage_table` (
    `id` VARCHAR(64) NOT NULL COMMENT '主键ID',
    `datasource_id` VARCHAR(64) NOT NULL COMMENT '数据源ID',
    `database_name` VARCHAR(200) DEFAULT NULL COMMENT '数据库名称',
    `schema_name` VARCHAR(200) DEFAULT NULL COMMENT 'Schema名称(PostgreSQL/Oracle等使用)',
    `table_name` VARCHAR(200) NOT NULL COMMENT '表名',
    `table_type` VARCHAR(50) DEFAULT 'TABLE' COMMENT '表类型(TABLE/VIEW/MATERIALIZED_VIEW等)',
    `table_comment` VARCHAR(500) DEFAULT NULL COMMENT '表注释/描述',
    `partition_keys` VARCHAR(500) DEFAULT NULL COMMENT '分区字段(如果是分区表)',
    `metadata` TEXT DEFAULT NULL COMMENT '表元数据(JSON,包含字段列表、索引等)',
    `status` VARCHAR(20) DEFAULT 'ACTIVE' COMMENT '状态(ACTIVE/INACTIVE/DELETED)',
    `creator` VARCHAR(64) DEFAULT NULL COMMENT '创建者',
    `creator_name` VARCHAR(100) DEFAULT NULL COMMENT '创建者名称',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater` VARCHAR(64) DEFAULT NULL COMMENT '更新者',
    `updater_name` VARCHAR(100) DEFAULT NULL COMMENT '更新者名称',
    `last_update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_datasource_id` (`datasource_id`),
    KEY `idx_table_name` (`table_name`),
    KEY `idx_status` (`status`),
    KEY `idx_database_table` (`database_name`, `table_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='血缘表节点表';

-- 血缘字段节点表
CREATE TABLE IF NOT EXISTS `data_lineage_column` (
    `id` VARCHAR(64) NOT NULL COMMENT '主键ID',
    `table_id` VARCHAR(64) NOT NULL COMMENT '表ID',
    `column_name` VARCHAR(200) NOT NULL COMMENT '字段名称',
    `column_type` VARCHAR(100) DEFAULT NULL COMMENT '字段类型',
    `column_length` INT DEFAULT NULL COMMENT '字段长度',
    `column_scale` INT DEFAULT NULL COMMENT '字段精度(小数位数)',
    `nullable` TINYINT(1) DEFAULT 1 COMMENT '是否可空',
    `primary_key` TINYINT(1) DEFAULT 0 COMMENT '是否主键',
    `default_value` VARCHAR(500) DEFAULT NULL COMMENT '默认值',
    `column_comment` VARCHAR(500) DEFAULT NULL COMMENT '字段注释',
    `ordinal_position` INT DEFAULT NULL COMMENT '字段位置',
    `status` VARCHAR(20) DEFAULT 'ACTIVE' COMMENT '状态(ACTIVE/INACTIVE/DELETED)',
    `creator` VARCHAR(64) DEFAULT NULL COMMENT '创建者',
    `creator_name` VARCHAR(100) DEFAULT NULL COMMENT '创建者名称',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater` VARCHAR(64) DEFAULT NULL COMMENT '更新者',
    `updater_name` VARCHAR(100) DEFAULT NULL COMMENT '更新者名称',
    `last_update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_table_id` (`table_id`),
    KEY `idx_column_name` (`column_name`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='血缘字段节点表';

-- 血缘关系表
CREATE TABLE IF NOT EXISTS `data_lineage_relation` (
    `id` VARCHAR(64) NOT NULL COMMENT '主键ID',
    `source_id` VARCHAR(64) NOT NULL COMMENT '源节点ID(表ID或字段ID)',
    `source_type` VARCHAR(20) NOT NULL COMMENT '源节点类型(DATASOURCE/TABLE/COLUMN)',
    `target_id` VARCHAR(64) NOT NULL COMMENT '目标节点ID(表ID或字段ID)',
    `target_type` VARCHAR(20) NOT NULL COMMENT '目标节点类型(DATASOURCE/TABLE/COLUMN)',
    `lineage_type` VARCHAR(20) NOT NULL COMMENT '血缘类型(READ/WRITE/TRANSFORM)',
    `transform_rule` TEXT DEFAULT NULL COMMENT '转换规则(JSON,记录字段转换逻辑)',
    `dag_execution_id` VARCHAR(64) DEFAULT NULL COMMENT '关联的DAG任务ID',
    `sql` TEXT DEFAULT NULL COMMENT '关联的SQL语句',
    `source_from` VARCHAR(50) DEFAULT NULL COMMENT '血缘来源(SQL_PARSE/MANUAL/SEATUNNEL/FLINK/DAG)',
    `audit_status` VARCHAR(20) DEFAULT 'APPROVED' COMMENT '审核状态(PENDING/APPROVED/REJECTED)',
    `confidence` INT DEFAULT 100 COMMENT '置信度(0-100,自动采集的血缘可能需要确认)',
    `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
    `status` VARCHAR(20) DEFAULT 'ACTIVE' COMMENT '状态(ACTIVE/INACTIVE/DELETED)',
    `creator` VARCHAR(64) DEFAULT NULL COMMENT '创建者',
    `creator_name` VARCHAR(100) DEFAULT NULL COMMENT '创建者名称',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater` VARCHAR(64) DEFAULT NULL COMMENT '更新者',
    `updater_name` VARCHAR(100) DEFAULT NULL COMMENT '更新者名称',
    `last_update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_source` (`source_id`, `source_type`),
    KEY `idx_target` (`target_id`, `target_type`),
    KEY `idx_lineage_type` (`lineage_type`),
    KEY `idx_source_from` (`source_from`),
    KEY `idx_dag_execution_id` (`dag_execution_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='血缘关系表';

-- 血缘存储配置表
CREATE TABLE IF NOT EXISTS `data_lineage_storage_config` (
    `id` VARCHAR(64) NOT NULL COMMENT '主键ID',
    `name` VARCHAR(200) NOT NULL COMMENT '配置名称',
    `storage_type` VARCHAR(50) NOT NULL COMMENT '存储类型(NEO4J/MYSQL/JANUSGRAPH)',
    `connector_id` VARCHAR(64) NOT NULL COMMENT '连接器ID(关联connector表)',
    `enabled` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    `is_default` TINYINT(1) DEFAULT 0 COMMENT '是否为默认存储',
    `description` VARCHAR(500) DEFAULT NULL COMMENT '描述',
    `ext_config` TEXT DEFAULT NULL COMMENT '扩展配置(JSON)',
    `status` VARCHAR(20) DEFAULT 'ACTIVE' COMMENT '状态(ACTIVE/INACTIVE/DELETED)',
    `creator` VARCHAR(64) DEFAULT NULL COMMENT '创建者',
    `creator_name` VARCHAR(100) DEFAULT NULL COMMENT '创建者名称',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater` VARCHAR(64) DEFAULT NULL COMMENT '更新者',
    `updater_name` VARCHAR(100) DEFAULT NULL COMMENT '更新者名称',
    `last_update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_connector_id` (`connector_id`),
    KEY `idx_storage_type` (`storage_type`),
    KEY `idx_is_default` (`is_default`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='血缘存储配置表';

-- ============================================
-- 9. 日志管理模块相关表
-- ============================================
-- 说明：所有表名必须以 data_ 开头，符合项目建表规范
-- 创建时间：2026-01-02

-- 1. 系统配置表（Key-Value结构）
CREATE TABLE IF NOT EXISTS `data_log_config` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `config_key` VARCHAR(100) NOT NULL COMMENT '配置键',
    `config_value` TEXT COMMENT '配置值',
    `value_type` VARCHAR(20) NOT NULL DEFAULT 'STRING' COMMENT '值类型: STRING/INT/BOOLEAN/JSON',
    `description` VARCHAR(500) COMMENT '配置说明',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='日志管理系统配置表';

-- 初始化默认配置
INSERT INTO data_log_config (config_key, config_value, value_type, description) VALUES
('loki.connector.id', '', 'STRING', 'Loki连接器ID'),
('redis.connector.id', '', 'STRING', 'Redis连接器ID'),
('query.timeout', '30', 'INT', '查询超时时间(秒)'),
('query.max.limit', '1000', 'INT', '最大查询条数'),
('query.default.time.range', '60', 'INT', '默认时间范围(分钟)'),
('live.refresh.interval', '5', 'INT', 'Live实时刷新间隔(秒)'),
('live.min.refresh.interval', '1', 'INT', '最小刷新间隔(秒)');

-- 2. 日志解析规则表
CREATE TABLE IF NOT EXISTS `data_log_parse_rule` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `rule_name` VARCHAR(100) NOT NULL COMMENT '规则名称',
    `log_format` VARCHAR(50) NOT NULL COMMENT '日志格式: JSON/TEXT/CUSTOM',
    `field_mapping` TEXT NOT NULL COMMENT '字段映射配置(JSON格式)',
    `enabled` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_enabled` (`enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='日志解析规则表';

-- 3. 异常分组表
CREATE TABLE IF NOT EXISTS `data_log_exception_group` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `fingerprint` VARCHAR(64) NOT NULL COMMENT '堆栈指纹(MD5)',
    `exception_type` VARCHAR(255) NOT NULL COMMENT '异常类型',
    `exception_message` TEXT COMMENT '异常消息',
    `stack_trace` TEXT COMMENT '堆栈信息',
    `service_name` VARCHAR(100) NOT NULL COMMENT '服务名称',
    `first_time` DATETIME NOT NULL COMMENT '首次发生时间',
    `last_time` DATETIME NOT NULL COMMENT '最后发生时间',
    `occur_count` INT NOT NULL DEFAULT 1 COMMENT '发生次数',
    `status` VARCHAR(20) NOT NULL DEFAULT 'NEW' COMMENT '状态: NEW/FIXED/IGNORED/REOPENED',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_fingerprint` (`fingerprint`),
    KEY `idx_service_status` (`service_name`, `status`),
    KEY `idx_last_time` (`last_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='异常分组表';

-- 4. 异常详情表
CREATE TABLE IF NOT EXISTS `data_log_exception_detail` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `group_id` BIGINT COMMENT '关联分组ID',
    `fingerprint` VARCHAR(64) NOT NULL COMMENT '堆栈指纹(用于聚合)',
    `log_time` DATETIME NOT NULL COMMENT '日志时间',
    `trace_id` VARCHAR(100) COMMENT 'SkyWalking TraceID',
    `stack_trace` TEXT COMMENT '堆栈信息',
    `raw_log` TEXT COMMENT '原始日志',
    `aggregated` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已聚合',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_group_id` (`group_id`),
    KEY `idx_fingerprint` (`fingerprint`),
    KEY `idx_trace_id` (`trace_id`),
    KEY `idx_log_time` (`log_time`),
    KEY `idx_aggregated` (`aggregated`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='异常详情表';

-- 5. 日志统计表
CREATE TABLE IF NOT EXISTS `data_log_statistics` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `service_name` VARCHAR(100) NOT NULL COMMENT '服务名称',
    `stat_time` DATETIME NOT NULL COMMENT '统计时间(小时级)',
    `total_count` INT NOT NULL DEFAULT 0 COMMENT '总日志数',
    `error_count` INT NOT NULL DEFAULT 0 COMMENT '错误数',
    `warn_count` INT NOT NULL DEFAULT 0 COMMENT '警告数',
    `info_count` INT NOT NULL DEFAULT 0 COMMENT '信息数',
    `exception_count` INT NOT NULL DEFAULT 0 COMMENT '异常数',
    `error_rate` DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '错误率(%)',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_service_time` (`service_name`, `stat_time`),
    KEY `idx_stat_time` (`stat_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='日志统计表';

-- 6. 告警规则表
CREATE TABLE IF NOT EXISTS `data_log_alert_rule` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `rule_name` VARCHAR(100) NOT NULL COMMENT '规则名称',
    `rule_type` VARCHAR(50) NOT NULL COMMENT '规则类型: EXCEPTION_COUNT/ERROR_RATE/NEW_EXCEPTION',
    `service_name` VARCHAR(100) COMMENT '监控服务(空表示全部)',
    `threshold_value` DECIMAL(10,2) NOT NULL COMMENT '阈值',
    `time_window` INT NOT NULL COMMENT '时间窗口(分钟)',
    `silence_period` INT NOT NULL DEFAULT 30 COMMENT '静默期(分钟)',
    `notification_channels` TEXT COMMENT '通知渠道配置(JSON)',
    `enabled` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_enabled` (`enabled`),
    KEY `idx_service` (`service_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='告警规则表';

-- 7. 告警历史表
CREATE TABLE IF NOT EXISTS `data_log_alert_history` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `rule_id` BIGINT NOT NULL COMMENT '规则ID',
    `rule_name` VARCHAR(100) NOT NULL COMMENT '规则名称',
    `alert_time` DATETIME NOT NULL COMMENT '告警时间',
    `alert_content` TEXT NOT NULL COMMENT '告警内容',
    `trigger_value` DECIMAL(10,2) COMMENT '触发值',
    `notification_status` VARCHAR(20) NOT NULL COMMENT '通知状态: SUCCESS/FAILED',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_rule_id` (`rule_id`),
    KEY `idx_alert_time` (`alert_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='告警历史表';

-- 8. 日志脱敏规则表
CREATE TABLE IF NOT EXISTS `data_log_mask_rule` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `rule_name` VARCHAR(100) NOT NULL COMMENT '规则名称',
    `rule_type` VARCHAR(50) NOT NULL COMMENT '规则类型: REGEX/FIELD/KEYWORD',
    `match_pattern` VARCHAR(500) NOT NULL COMMENT '匹配模式（正则表达式或字段名）',
    `replace_type` VARCHAR(50) NOT NULL COMMENT '替换方式: MASK/REPLACE/REMOVE',
    `replace_value` VARCHAR(500) COMMENT '替换值（如果是REPLACE类型）',
    `enabled` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
    `sort_order` INT NOT NULL DEFAULT 999 COMMENT '规则顺序',
    `description` VARCHAR(500) COMMENT '规则说明',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_enabled` (`enabled`),
    KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='日志脱敏规则表';

-- 插入预置脱敏规则
INSERT INTO `data_log_mask_rule` (`rule_name`, `rule_type`, `match_pattern`, `replace_type`, `replace_value`, `enabled`, `sort_order`, `description`) VALUES
('手机号脱敏', 'REGEX', '1[3-9]\\d{9}', 'MASK', NULL, 1, 1, '自动识别并脱敏手机号码'),
('身份证号脱敏', 'REGEX', '[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]', 'MASK', NULL, 1, 2, '自动识别并脱敏身份证号'),
('邮箱脱敏', 'REGEX', '[\\w.-]+@[\\w.-]+\\.\\w+', 'MASK', NULL, 1, 3, '自动识别并脱敏邮箱地址'),
('密码字段脱敏', 'FIELD', 'password', 'REPLACE', '******', 1, 4, '脱敏JSON中的password字段'),
('token字段脱敏', 'FIELD', 'token', 'REPLACE', '******', 1, 5, '脱敏JSON中的token字段');

-- ============================================
-- 10. Worker集群管理相关表
-- ============================================

-- Worker节点信息表
CREATE TABLE IF NOT EXISTS `worker_node` (
    `id` VARCHAR(64) PRIMARY KEY COMMENT 'Worker节点ID',
    `name` VARCHAR(128) NOT NULL COMMENT 'Worker名称',
    `host` VARCHAR(128) NOT NULL COMMENT '主机地址',
    `port` INT NOT NULL COMMENT '端口号',
    `version` VARCHAR(32) COMMENT 'Worker版本',
    `status` VARCHAR(32) NOT NULL COMMENT '状态：ONLINE,OFFLINE,DISABLED,ABNORMAL',
    `max_concurrent_tasks` INT DEFAULT 50 COMMENT '最大并发任务数',
    `heartbeat_interval` INT DEFAULT 15 COMMENT '心跳间隔（秒）',
    `active_tasks` INT DEFAULT 0 COMMENT '当前活跃任务数',
    `weight` INT DEFAULT 100 COMMENT '负载均衡权重（数值越大优先级越高）',
    `register_time` DATETIME COMMENT '注册时间',
    `last_heartbeat_time` DATETIME COMMENT '最后心跳时间',
    `enabled` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    `tags` JSON COMMENT '标签（数组）',
    `metadata` JSON COMMENT '扩展元数据',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_status` (`status`),
    INDEX `idx_host_port` (`host`, `port`),
    INDEX `idx_heartbeat` (`last_heartbeat_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Worker节点信息表';

-- Worker心跳记录表
CREATE TABLE IF NOT EXISTS `worker_heartbeat` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `worker_id` VARCHAR(64) NOT NULL COMMENT 'Worker节点ID',
    `heartbeat_time` DATETIME NOT NULL COMMENT '心跳时间',
    `active_tasks` INT DEFAULT 0 COMMENT '活跃任务数',
    `cpu_usage` DECIMAL(5,2) COMMENT 'CPU使用率(%)',
    `memory_usage` DECIMAL(5,2) COMMENT '内存使用率(%)',
    `jvm_heap_usage` DECIMAL(5,2) COMMENT 'JVM堆内存使用率(%)',
    `disk_usage` DECIMAL(5,2) COMMENT '磁盘使用率(%)',
    `system_load` DECIMAL(10,2) COMMENT '系统负载',
    `thread_count` INT COMMENT '线程数',
    `gc_count` BIGINT COMMENT 'GC次数',
    `gc_time` BIGINT COMMENT 'GC总耗时(ms)',
    `jvm_non_heap_usage` DECIMAL(5,2) COMMENT 'JVM非堆内存使用率(%)',
    `network_receive_rate` DECIMAL(10,2) COMMENT '网络接收速率(MB/s)',
    `network_send_rate` DECIMAL(10,2) COMMENT '网络发送速率(MB/s)',
    `disk_read_rate` DECIMAL(10,2) COMMENT '磁盘读取速率(MB/s)',
    `disk_write_rate` DECIMAL(10,2) COMMENT '磁盘写入速率(MB/s)',
    `open_file_descriptors` BIGINT COMMENT '打开的文件描述符数',
    `tcp_connections` INT COMMENT 'TCP连接数',
    `avg_response_time` BIGINT COMMENT '平均响应时间(ms)',
    `status` VARCHAR(32) COMMENT '状态',
    `response_time` INT COMMENT '响应时间(ms)',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX `idx_worker_time` (`worker_id`, `heartbeat_time`),
    INDEX `idx_time` (`heartbeat_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Worker心跳记录表';

-- Worker监控指标表
CREATE TABLE IF NOT EXISTS `worker_metrics` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `worker_id` VARCHAR(64) NOT NULL COMMENT 'Worker节点ID',
    `metric_type` VARCHAR(64) NOT NULL COMMENT '指标类型：cpu,memory,jvm_heap等',
    `metric_value` DECIMAL(10,2) NOT NULL COMMENT '指标值',
    `metric_unit` VARCHAR(16) COMMENT '单位：%,MB,count',
    `tags` JSON COMMENT '标签',
    `collect_time` DATETIME NOT NULL COMMENT '采集时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX `idx_worker_type_time` (`worker_id`, `metric_type`, `collect_time`),
    INDEX `idx_time` (`collect_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Worker监控指标表';

-- Worker任务历史表
CREATE TABLE IF NOT EXISTS `worker_task_history` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `task_id` VARCHAR(64) NOT NULL COMMENT '任务ID',
    `worker_id` VARCHAR(64) NOT NULL COMMENT 'Worker节点ID',
    `action_code` VARCHAR(128) COMMENT 'Action编码',
    `dag_name` VARCHAR(256) COMMENT 'DAG名称',
    `action_class` VARCHAR(256) COMMENT 'Action类名',
    `status` VARCHAR(32) NOT NULL COMMENT '任务状态：CREATED,RUNNING,COMPLETED,FAILED,TIMED_OUT',
    `start_time` DATETIME COMMENT '开始时间',
    `end_time` DATETIME COMMENT '结束时间',
    `duration` BIGINT COMMENT '执行时长(ms)',
    `success` TINYINT(1) COMMENT '是否成功',
    `error_message` TEXT COMMENT '错误信息',
    `error_code` VARCHAR(32) COMMENT '错误码',
    `trace_id` VARCHAR(64) COMMENT 'SkyWalking TraceId',
    `params` JSON COMMENT '任务参数',
    `result` JSON COMMENT '执行结果',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_worker` (`worker_id`),
    INDEX `idx_task` (`task_id`),
    INDEX `idx_time` (`start_time`),
    INDEX `idx_status` (`status`),
    INDEX `idx_trace` (`trace_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Worker任务历史表';

-- 告警规则表
CREATE TABLE IF NOT EXISTS `worker_alert_rule` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(128) NOT NULL COMMENT '规则名称',
    `type` VARCHAR(64) NOT NULL COMMENT '规则类型：node_offline,cpu_high,memory_high,task_failure_rate等',
    `metric` VARCHAR(64) COMMENT '监控指标',
    `threshold` DECIMAL(10,2) COMMENT '阈值',
    `operator` VARCHAR(16) COMMENT '比较运算符：>,<,>=,<=,=',
    `duration` INT COMMENT '持续时间（秒）',
    `level` VARCHAR(32) NOT NULL COMMENT '告警级别：CRITICAL,WARNING,INFO',
    `scope` VARCHAR(32) DEFAULT 'GLOBAL' COMMENT '范围：GLOBAL,NODE,TAG',
    `scope_value` VARCHAR(256) COMMENT '范围值（节点ID或标签）',
    `silence_period` INT DEFAULT 300 COMMENT '静默期（秒）',
    `enabled` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    `description` TEXT COMMENT '规则描述',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_type` (`type`),
    INDEX `idx_enabled` (`enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Worker告警规则表';

-- 系统配置表
CREATE TABLE IF NOT EXISTS `cluster_management_config` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `config_key` VARCHAR(128) NOT NULL UNIQUE COMMENT '配置键',
    `config_value` TEXT COMMENT '配置值',
    `config_type` VARCHAR(32) COMMENT '配置类型：STRING,JSON,NUMBER,BOOLEAN',
    `description` VARCHAR(256) COMMENT '配置描述',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='集群管理配置表';

-- 插入默认配置
INSERT INTO `cluster_management_config` (`config_key`, `config_value`, `config_type`, `description`) VALUES
('metrics.storage.type', 'mysql', 'STRING', '监控数据存储方式：mysql, prometheus, influxdb'),
('metrics.storage.connector_id', '', 'STRING', '时序数据库连接器ID'),
('metrics.sampling.default_interval', '30', 'NUMBER', '默认采样间隔（秒）'),
('heartbeat.timeout_multiplier', '3', 'NUMBER', '心跳超时倍数'),
('data.retention.metrics_days', '7', 'NUMBER', '监控数据保留天数'),
('data.retention.heartbeat_days', '7', 'NUMBER', '心跳记录保留天数'),
('data.retention.task_history_days', '30', 'NUMBER', '任务历史保留天数')
ON DUPLICATE KEY UPDATE `config_value` = VALUES(`config_value`);

-- ============================================
-- 11. 告警中心相关表
-- ============================================

-- 告警规则表
CREATE TABLE IF NOT EXISTS `data_alert_rule` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '规则ID',
    `rule_name` VARCHAR(200) NOT NULL COMMENT '规则名称',
    `rule_code` VARCHAR(100) NOT NULL UNIQUE COMMENT '规则编码（唯一标识）',
    
    -- 规则归属
    `source_module` VARCHAR(50) NOT NULL COMMENT '所属模块：CONNECTOR/WORKER/LOG/DAG',
    `alert_type` VARCHAR(100) NOT NULL COMMENT '告警类型',
    `alert_level` VARCHAR(20) NOT NULL COMMENT '告警级别：CRITICAL/ERROR/WARNING/INFO',
    
    -- 规则表达式
    `rule_expression` TEXT NOT NULL COMMENT '规则表达式',
    `expression_type` VARCHAR(50) COMMENT '表达式类型：SIMPLE/COMPOSITE/TIME_WINDOW',
    
    -- 规则配置
    `time_window` INT COMMENT '时间窗口（秒）',
    `silence_period` INT DEFAULT 300 COMMENT '静默期（秒）',
    `enabled` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    
    -- 通知配置
    `notification_connectors` TEXT COMMENT '通知连接器ID列表（JSON数组）',
    `receivers` TEXT COMMENT '接收人列表（JSON数组）',
    
    -- 作用范围
    `scope` VARCHAR(50) DEFAULT 'GLOBAL' COMMENT '作用范围：GLOBAL/SPECIFIC',
    `scope_value` VARCHAR(200) COMMENT '作用范围值',
    
    -- 扩展配置
    `description` TEXT COMMENT '规则描述',
    `ext_config` JSON COMMENT '扩展配置',
    
    -- 审计字段
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `creator` VARCHAR(64) COMMENT '创建人ID',
    `creator_name` VARCHAR(100) COMMENT '创建人姓名',
    `updater` VARCHAR(64) COMMENT '更新人ID',
    `updater_name` VARCHAR(100) COMMENT '更新人姓名',
    
    INDEX `idx_module_enabled` (`source_module`, `enabled`),
    INDEX `idx_alert_type` (`alert_type`),
    INDEX `idx_scope` (`scope`, `scope_value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='告警规则表';

-- 告警历史表
CREATE TABLE IF NOT EXISTS `data_alert_history` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `alert_id` VARCHAR(64) UNIQUE NOT NULL COMMENT '告警唯一ID',
    
    -- 来源信息
    `source_module` VARCHAR(50) NOT NULL COMMENT '来源模块：CONNECTOR/WORKER/LOG/DAG',
    `source_id` VARCHAR(100) COMMENT '来源对象ID',
    `source_name` VARCHAR(200) COMMENT '来源对象名称',
    
    -- 告警基本信息
    `alert_type` VARCHAR(100) NOT NULL COMMENT '告警类型',
    `alert_level` VARCHAR(20) NOT NULL COMMENT '告警级别',
    `alert_message` TEXT COMMENT '告警消息',
    `alert_detail` JSON COMMENT '告警详情（JSON）',
    `context_data` TEXT COMMENT '上下文数据（JSON）',
    
    -- 规则信息
    `rule_id` BIGINT COMMENT '触发的规则ID',
    `rule_name` VARCHAR(200) COMMENT '规则名称',
    `rule_code` VARCHAR(100) COMMENT '规则编码',
    `rule_expression` TEXT COMMENT '规则表达式',
    
    -- 触发信息
    `trigger_time` DATETIME NOT NULL COMMENT '触发时间',
    `first_trigger_time` DATETIME COMMENT '首次触发时间（用于聚合）',
    `trigger_count` INT DEFAULT 1 COMMENT '触发次数（聚合场景）',
    
    -- 状态信息
    `status` VARCHAR(20) DEFAULT 'ACTIVE' COMMENT '状态：ACTIVE/PROCESSING/RESOLVED/IGNORED',
    `resolved` TINYINT(1) DEFAULT 0 COMMENT '是否已解决',
    `resolved_time` DATETIME COMMENT '解决时间',
    `resolved_type` VARCHAR(20) COMMENT '解决方式：AUTO/MANUAL',
    `resolved_by` VARCHAR(64) COMMENT '解决人ID',
    `remark` TEXT COMMENT '备注',
    
    -- 通知信息
    `notification_status` VARCHAR(20) COMMENT '通知状态：PENDING/SENT/PARTIAL/FAILED/IGNORED',
    `notification_channels` VARCHAR(200) COMMENT '已发送的通知渠道',
    `notification_time` DATETIME COMMENT '通知时间',
    `notification_error` TEXT COMMENT '通知错误信息',
    
    -- 审计字段
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    INDEX `idx_module_time` (`source_module`, `trigger_time`),
    INDEX `idx_source` (`source_id`, `trigger_time`),
    INDEX `idx_level_status` (`alert_level`, `status`),
    INDEX `idx_trigger_time` (`trigger_time`),
    INDEX `idx_status` (`status`, `trigger_time`),
    INDEX `idx_alert_type` (`alert_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='告警历史表';

-- 告警消息模板表
CREATE TABLE IF NOT EXISTS `data_alert_template` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '模板ID',
    `template_name` VARCHAR(200) NOT NULL COMMENT '模板名称',
    `template_code` VARCHAR(100) NOT NULL UNIQUE COMMENT '模板编码（唯一标识）',
    
    -- 渠道和消息类型
    `channel_type` VARCHAR(20) NOT NULL COMMENT '渠道类型：DINGTALK/WECOM/LARK/MAIL',
    `message_type` VARCHAR(20) NOT NULL COMMENT '消息类型：MARKDOWN/TEXT/ACTIONCARD/CARD/HTML',
    
    -- 适用范围（可为空表示通用）
    `alert_level` VARCHAR(20) COMMENT '告警级别：CRITICAL/ERROR/WARNING/INFO（为空则通用）',
    `source_module` VARCHAR(50) COMMENT '来源模块：CONNECTOR/WORKER/LOG/DAG（为空则通用）',
    
    -- 模板内容
    `title_template` VARCHAR(500) COMMENT '标题模板',
    `content_template` TEXT NOT NULL COMMENT '内容模板（支持变量替换）',
    
    -- 扩展配置
    `ext_config` JSON COMMENT '扩展配置（JSON格式，如按钮配置、@人员配置等）',
    
    -- 状态
    `enabled` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    `is_default` TINYINT(1) DEFAULT 0 COMMENT '是否默认模板',
    `description` TEXT COMMENT '模板描述',
    
    -- 审计字段
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `creator` VARCHAR(64) COMMENT '创建人ID',
    `creator_name` VARCHAR(100) COMMENT '创建人姓名',
    `updater` VARCHAR(64) COMMENT '更新人ID',
    `updater_name` VARCHAR(100) COMMENT '更新人姓名',
    
    INDEX `idx_channel_type` (`channel_type`, `message_type`),
    INDEX `idx_enabled_default` (`enabled`, `is_default`),
    INDEX `idx_level_module` (`alert_level`, `source_module`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='告警消息模板表';

-- 告警策略表
CREATE TABLE IF NOT EXISTS `data_alert_policy` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '策略ID',
    `policy_name` VARCHAR(100) NOT NULL COMMENT '策略名称',
    `policy_type` VARCHAR(50) NOT NULL COMMENT '策略类型：SILENCE/GROUP/SUPPRESS/ESCALATE/TIME_WINDOW/CONVERGE',
    `enabled` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    `priority` INT DEFAULT 100 COMMENT '优先级（越小越优先）',
    
    -- 作用范围
    `scope` VARCHAR(50) COMMENT '作用范围：GLOBAL/MODULE/LEVEL/TYPE',
    `scope_value` VARCHAR(200) COMMENT '范围值',
    
    -- 策略配置（JSON格式，不同类型策略有不同配置）
    `config` JSON COMMENT '策略配置',
    
    `description` TEXT COMMENT '策略描述',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    INDEX `idx_enabled_priority` (`enabled`, `priority`),
    INDEX `idx_type` (`policy_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='告警策略表';

-- 初始化默认策略
INSERT INTO `data_alert_policy` (`policy_name`, `policy_type`, `enabled`, `priority`, `scope`, `config`, `description`) VALUES
('全局静默期策略', 'SILENCE', 1, 10, 'GLOBAL', '{"silencePeriod": 300}', '默认静默期5分钟'),
('全局时间窗口策略', 'TIME_WINDOW', 1, 20, 'GLOBAL', '{"workStart": "09:00", "workEnd": "18:00"}', '工作时间09:00-18:00')
ON DUPLICATE KEY UPDATE `policy_name` = VALUES(`policy_name`);

-- 告警订阅表
CREATE TABLE IF NOT EXISTS `data_alert_subscription` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订阅ID',
    `user_id` VARCHAR(64) NOT NULL COMMENT '用户ID',
    `user_name` VARCHAR(100) COMMENT '用户名称',
    
    -- 订阅配置
    `subscribe_type` VARCHAR(50) NOT NULL COMMENT '订阅类型：MODULE/LEVEL/TYPE/OBJECT',
    `subscribe_config` JSON COMMENT '订阅配置',
    
    -- 通知配置
    `notification_connectors` TEXT COMMENT '通知连接器ID列表',
    `notification_time_range` VARCHAR(100) COMMENT '通知时间段：ALL/WORK_HOURS',
    
    `enabled` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    `description` TEXT COMMENT '订阅描述',
    
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    INDEX `idx_user` (`user_id`, `enabled`),
    INDEX `idx_type` (`subscribe_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='告警订阅表';

-- 通知日志表
CREATE TABLE IF NOT EXISTS `data_alert_notification_log` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    `alert_id` VARCHAR(64) NOT NULL COMMENT '告警ID',
    `alert_history_id` BIGINT COMMENT '告警历史记录ID',
    
    -- 通知信息
    `connector_id` VARCHAR(64) NOT NULL COMMENT '连接器ID',
    `connector_type` VARCHAR(50) COMMENT '连接器类型',
    `receiver` VARCHAR(200) COMMENT '接收人',
    
    -- 发送信息
    `send_time` DATETIME NOT NULL COMMENT '发送时间',
    `status` VARCHAR(20) NOT NULL COMMENT '发送状态：SUCCESS/FAILED',
    `error_message` TEXT COMMENT '错误信息',
    `retry_count` INT DEFAULT 0 COMMENT '重试次数',
    `response_time` INT COMMENT '响应时间（毫秒）',
    
    -- 内容信息
    `notification_content` TEXT COMMENT '通知内容',
    
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    INDEX `idx_alert` (`alert_id`, `send_time`),
    INDEX `idx_connector` (`connector_id`, `send_time`),
    INDEX `idx_status` (`status`, `send_time`),
    INDEX `idx_send_time` (`send_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='告警通知日志表';

-- 指标定义表
CREATE TABLE IF NOT EXISTS `data_alert_metric_definition` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '指标ID',
    `source_module` VARCHAR(50) NOT NULL COMMENT '所属模块',
    
    -- 指标定义
    `metric_name` VARCHAR(100) NOT NULL COMMENT '指标变量名（英文）',
    `display_name` VARCHAR(200) NOT NULL COMMENT '指标显示名（中文）',
    `metric_type` VARCHAR(20) NOT NULL COMMENT '数据类型：INTEGER/LONG/DOUBLE/STRING/BOOLEAN',
    `unit` VARCHAR(20) COMMENT '单位',
    `description` TEXT COMMENT '指标描述',
    
    -- 可用操作符
    `operators` VARCHAR(200) COMMENT '可用操作符（逗号分隔）',
    `example_value` VARCHAR(100) COMMENT '示例值',
    
    `enabled` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    `sort_order` INT DEFAULT 999 COMMENT '排序',
    
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    UNIQUE KEY `uk_module_metric` (`source_module`, `metric_name`),
    INDEX `idx_module` (`source_module`, `enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='告警指标定义表';

-- 告警统计表
CREATE TABLE IF NOT EXISTS `data_alert_statistics` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '统计ID',
    `stat_date` DATE NOT NULL COMMENT '统计日期',
    `stat_hour` INT COMMENT '统计小时（0-23）',
    
    -- 统计维度
    `source_module` VARCHAR(50) COMMENT '模块',
    `alert_level` VARCHAR(20) COMMENT '告警级别',
    `alert_type` VARCHAR(100) COMMENT '告警类型',
    
    -- 统计指标
    `total_count` INT DEFAULT 0 COMMENT '总告警数',
    `resolved_count` INT DEFAULT 0 COMMENT '已解决数',
    `active_count` INT DEFAULT 0 COMMENT '活跃告警数',
    `avg_resolve_time` BIGINT COMMENT '平均解决时间（毫秒）',
    `notification_success_rate` DECIMAL(5,2) COMMENT '通知成功率',
    
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    UNIQUE KEY `uk_stat` (`stat_date`, `stat_hour`, `source_module`, `alert_level`, `alert_type`),
    INDEX `idx_date_module` (`stat_date`, `source_module`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='告警统计表';

-- ============================================
-- 清理重复Worker节点记录（根据 host + port 去重，保留最新的）
-- ============================================
DELETE w1 FROM worker_node w1
INNER JOIN worker_node w2 
WHERE w1.host = w2.host 
  AND w1.port = w2.port 
  AND w1.create_time < w2.create_time;

-- ============================================
-- 协议网关系统表
-- ============================================

-- 网关配置表
CREATE TABLE IF NOT EXISTS `data_sync_protocol_gateway` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `name` VARCHAR(200) NOT NULL COMMENT '网关名称',
    
    -- 连接器配置
    `source_connector_id` VARCHAR(64) NOT NULL COMMENT '源连接器ID',
    `protocol_type` VARCHAR(50) NOT NULL COMMENT '协议类型:MODBUS,COAP,OPCUA,TCP,UDP,MQTT',
    `kafka_connector_id` VARCHAR(64) NOT NULL COMMENT 'Kafka连接器ID',
    `kafka_topic` VARCHAR(500) NOT NULL COMMENT 'Kafka主题',
    `partition_strategy` VARCHAR(50) DEFAULT 'BY_DEVICE_ID' COMMENT '分区策略',
    
    -- 运行配置
    `polling_interval` INT DEFAULT 1000 COMMENT '轮询间隔(ms)',
    `status` VARCHAR(20) DEFAULT 'STOPPED' COMMENT '状态:STOPPED,RUNNING,ERROR',
    `auto_start` BOOLEAN DEFAULT FALSE COMMENT '系统启动时自动启动',
    
    -- 容错配置
    `max_tps` INT DEFAULT 1000 COMMENT '最大TPS限流',
    `backpressure_strategy` VARCHAR(20) DEFAULT 'BLOCK' COMMENT '背压策略:DROP,BLOCK,BUFFER',
    `enable_circuit_breaker` BOOLEAN DEFAULT TRUE COMMENT '启用熔断器',
    `failure_threshold` INT DEFAULT 50 COMMENT '熔断失败率阈值(%)',
    `circuit_sleep_window` INT DEFAULT 60000 COMMENT '熔断恢复窗口(ms)',
    
    -- 缓冲配置
    `memory_buffer_size` INT DEFAULT 10000 COMMENT '内存缓冲大小',
    `disk_buffer_enabled` BOOLEAN DEFAULT TRUE COMMENT '启用磁盘缓冲',
    `disk_buffer_path` VARCHAR(500) COMMENT '磁盘缓冲路径',
    `max_retry_count` INT DEFAULT 3 COMMENT '最大重试次数',
    
    -- 统计信息
    `message_count` BIGINT DEFAULT 0 COMMENT '累计消息数',
    `error_count` BIGINT DEFAULT 0 COMMENT '累计错误数',
    `last_active_time` TIMESTAMP NULL COMMENT '最后活跃时间',
    
    -- 审计字段
    `created_by` VARCHAR(100) COMMENT '创建人',
    `created_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_by` VARCHAR(100) COMMENT '更新人',
    `updated_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` BOOLEAN DEFAULT FALSE COMMENT '逻辑删除',
    
    INDEX `idx_status` (`status`),
    INDEX `idx_protocol` (`protocol_type`),
    INDEX `idx_created_time` (`created_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='协议网关配置表';

-- 网关读取规则表
CREATE TABLE IF NOT EXISTS `data_sync_gateway_read_rule` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `gateway_id` BIGINT NOT NULL COMMENT '网关ID',
    
    -- 规则配置
    `rule_name` VARCHAR(200) NOT NULL COMMENT '规则名称',
    `rule_type` VARCHAR(50) NOT NULL COMMENT '规则类型:MODBUS_REGISTER,COAP_RESOURCE,OPCUA_NODE',
    `rule_config` JSON COMMENT '规则配置(JSON格式)',
    
    -- 数据映射
    `field_name` VARCHAR(100) COMMENT '字段名称',
    `field_type` VARCHAR(50) COMMENT '字段类型',
    `default_value` VARCHAR(500) COMMENT '默认值',
    
    -- 排序与状态
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `priority` INT DEFAULT 50 COMMENT '优先级（数字越小优先级越高）',
    `description` VARCHAR(500) COMMENT '描述',
    `enabled` BOOLEAN DEFAULT TRUE COMMENT '启用状态',
    
    -- 审计字段
    `created_by` VARCHAR(100) COMMENT '创建人',
    `created_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_by` VARCHAR(100) COMMENT '更新人',
    `updated_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    INDEX `idx_gateway_id` (`gateway_id`),
    INDEX `idx_enabled` (`enabled`),
    FOREIGN KEY (`gateway_id`) REFERENCES `data_sync_protocol_gateway`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='网关读取规则表';

-- 死信队列表
CREATE TABLE IF NOT EXISTS `data_sync_gateway_dead_letter` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `gateway_id` BIGINT NOT NULL COMMENT '网关ID',
    
    -- 原始消息
    `original_message` JSON COMMENT '原始消息内容',
    
    -- 失败信息
    `failure_reason` TEXT COMMENT '失败原因',
    `failure_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '失败时间',
    `retry_count` INT DEFAULT 0 COMMENT '重试次数',
    `max_retry_count` INT DEFAULT 3 COMMENT '最大重试次数',
    `last_retry_time` TIMESTAMP NULL COMMENT '最后重试时间',
    
    -- 处理状态
    `status` VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态:PENDING,REPLAYED,ARCHIVED',
    `handled_by` VARCHAR(100) COMMENT '处理人',
    `handled_time` TIMESTAMP NULL COMMENT '处理时间',
    
    INDEX `idx_gateway` (`gateway_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_failure_time` (`failure_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='死信队列表';

-- 网关运行日志表
CREATE TABLE IF NOT EXISTS `data_sync_gateway_log` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `gateway_id` BIGINT NOT NULL COMMENT '网关ID',
    
    -- 日志信息
    `log_level` VARCHAR(20) NOT NULL COMMENT '日志级别:INFO,WARN,ERROR',
    `log_message` TEXT COMMENT '日志内容',
    `exception_stack` TEXT COMMENT '异常堆栈',
    
    -- 性能指标
    `current_tps` INT COMMENT '当前TPS',
    `error_rate` DECIMAL(5,2) COMMENT '错误率(%)',
    `kafka_lag` BIGINT COMMENT 'Kafka消费延迟',
    
    -- 时间戳
    `log_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '日志时间',
    
    INDEX `idx_gateway_time` (`gateway_id`, `log_time`),
    INDEX `idx_log_level` (`log_level`),
    INDEX `idx_log_time` (`log_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='网关运行日志表';

-- ============================================
-- 10. 慢查询监控表
-- ============================================

-- 慢查询记录表
CREATE TABLE IF NOT EXISTS `data_sync_slow_query` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    
    -- 查询标识
    `query_id` VARCHAR(64) COMMENT '查询ID(由执行引擎生成)',
    `sql_fingerprint` VARCHAR(255) NOT NULL COMMENT 'SQL指纹(去除参数后的SQL模板)',
    
    -- SQL信息
    `sql_text` TEXT NOT NULL COMMENT '实际执行的SQL语句',
    `sql_type` VARCHAR(20) COMMENT 'SQL类型:SELECT/INSERT/UPDATE/DELETE/DDL',
    `database_name` VARCHAR(200) COMMENT '数据库名',
    `table_names` VARCHAR(500) COMMENT '涉及的表名(多表用逗号分隔)',
    
    -- 执行信息
    `execution_time` BIGINT NOT NULL COMMENT '执行耗时(毫秒)',
    `rows_examined` BIGINT COMMENT '扫描行数',
    `rows_sent` BIGINT COMMENT '返回行数',
    `lock_time` BIGINT COMMENT '锁等待时间(毫秒)',
    `start_time` DATETIME NOT NULL COMMENT '执行开始时间',
    `end_time` DATETIME COMMENT '执行结束时间',
    
    -- 来源信息
    `source_type` VARCHAR(50) COMMENT '来源类型:QUERY_MODULE/DAG_NODE/CONNECTOR',
    `source_id` VARCHAR(64) COMMENT '来源ID(模块ID或节点ID)',
    `connector_id` VARCHAR(64) COMMENT '连接器ID',
    `user_name` VARCHAR(100) COMMENT '执行用户',
    `client_host` VARCHAR(100) COMMENT '客户端地址',
    
    -- 性能指标
    `cpu_time` BIGINT COMMENT 'CPU时间(毫秒)',
    `memory_used` BIGINT COMMENT '内存使用(KB)',
    `disk_io` BIGINT COMMENT '磁盘IO次数',
    
    -- 优化建议
    `index_suggestion` TEXT COMMENT '索引优化建议',
    `optimization_level` VARCHAR(20) DEFAULT 'MEDIUM' COMMENT '优化紧急程度:HIGH/MEDIUM/LOW',
    
    -- 状态
    `status` VARCHAR(20) DEFAULT 'PENDING' COMMENT '处理状态:PENDING/REVIEWED/OPTIMIZED/IGNORED',
    `reviewed_by` VARCHAR(100) COMMENT '审阅人',
    `reviewed_time` DATETIME COMMENT '审阅时间',
    `review_notes` TEXT COMMENT '审阅备注',
    
    -- 时间戳
    `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    INDEX `idx_fingerprint` (`sql_fingerprint`),
    INDEX `idx_execution_time` (`execution_time` DESC),
    INDEX `idx_start_time` (`start_time` DESC),
    INDEX `idx_source` (`source_type`, `source_id`),
    INDEX `idx_connector` (`connector_id`),
    INDEX `idx_database` (`database_name`),
    INDEX `idx_status` (`status`),
    INDEX `idx_optimization_level` (`optimization_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='慢查询监控记录表';

-- 慢查询配置表
CREATE TABLE IF NOT EXISTS `data_sync_slow_query_config` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `threshold_ms` BIGINT NOT NULL DEFAULT 5000 COMMENT '慢查询阈值(毫秒)',
    `enabled` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用慢查询监控:0-禁用/1-启用',
    `alert_enabled` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否启用告警:0-禁用/1-启用',
    `retention_days` INT NOT NULL DEFAULT 30 COMMENT '数据保留天数',
    `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='慢查询监控配置表';

-- 插入默认配置
INSERT INTO `data_sync_slow_query_config` (`threshold_ms`, `enabled`, `alert_enabled`, `retention_days`) 
VALUES (5000, 1, 0, 30)
ON DUPLICATE KEY UPDATE `threshold_ms`=VALUES(`threshold_ms`);

-- ============================================
-- 14. Flink SQL开发平台表
-- ============================================

-- Flink Catalog配置表
CREATE TABLE IF NOT EXISTS `flink_catalog_config` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `user_id` VARCHAR(64) NOT NULL COMMENT '用户ID',
    `catalog_name` VARCHAR(255) NOT NULL COMMENT 'Catalog名称',
    `catalog_type` VARCHAR(50) NOT NULL COMMENT 'Catalog类型:jdbc/hive/paimon/iceberg/generic',
    `connector_id` VARCHAR(64) COMMENT '关联的连接器ID(可选)',
    `catalog_config` JSON NOT NULL COMMENT '连接配置JSON',
    `is_default` TINYINT(1) DEFAULT 0 COMMENT '是否默认Catalog:0-否/1-是',
    `status` VARCHAR(20) DEFAULT 'ACTIVE' COMMENT '状态:ACTIVE/INACTIVE/ERROR',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `creator` VARCHAR(64) COMMENT '创建人id',
    `creator_name` VARCHAR(100) COMMENT '创建人姓名',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `updater` VARCHAR(64) COMMENT '更新人id',
    `updater_name` VARCHAR(100) COMMENT '更新人姓名',
    UNIQUE KEY `uk_user_catalog` (`user_id`, `catalog_name`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_connector_id` (`connector_id`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Flink Catalog配置表';

-- Flink SQL执行历史表
CREATE TABLE IF NOT EXISTS `flink_sql_history` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `user_id` VARCHAR(64) NOT NULL COMMENT '用户ID',
    `connector_id` VARCHAR(64) NOT NULL COMMENT 'Flink连接器ID',
    `sql_content` TEXT NOT NULL COMMENT 'SQL内容',
    `sql_type` VARCHAR(20) COMMENT 'SQL类型:SELECT/INSERT/CREATE_TABLE/CREATE_CATALOG/DDL',
    `execute_mode` VARCHAR(20) COMMENT '执行模式:SYNC/ASYNC/STREAMING',
    `execute_status` VARCHAR(20) COMMENT '执行状态:SUCCESS/FAILED/RUNNING/CANCELLED',
    `session_id` VARCHAR(255) COMMENT 'SQL Gateway Session ID',
    `operation_handle` VARCHAR(255) COMMENT 'Operation Handle',
    `job_id` VARCHAR(64) COMMENT 'Flink JobID',
    `result_rows` BIGINT COMMENT '结果行数',
    `execute_time` BIGINT COMMENT '执行耗时(ms)',
    `start_time` DATETIME COMMENT '开始时间',
    `end_time` DATETIME COMMENT '结束时间',
    `error_message` TEXT COMMENT '错误信息',
    `error_stack` TEXT COMMENT '错误堆栈',
    `is_favorite` TINYINT(1) DEFAULT 0 COMMENT '是否收藏:0-否/1-是',
    `favorite_category` VARCHAR(100) COMMENT '收藏分类',
    `remark` VARCHAR(500) COMMENT '备注',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_connector_id` (`connector_id`),
    INDEX `idx_create_time` (`create_time` DESC),
    INDEX `idx_favorite` (`user_id`, `is_favorite`),
    INDEX `idx_execute_status` (`execute_status`),
    INDEX `idx_job_id` (`job_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Flink SQL执行历史表';

-- Flink SQL模板库
CREATE TABLE IF NOT EXISTS `flink_sql_template` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `template_name` VARCHAR(255) NOT NULL COMMENT '模板名称',
    `template_category` VARCHAR(50) COMMENT '模板分类:DDL/WINDOW/JOIN/ADVANCED',
    `sub_category` VARCHAR(50) COMMENT '子分类',
    `template_content` TEXT NOT NULL COMMENT '模板内容',
    `description` VARCHAR(500) COMMENT '模板说明',
    `variables` JSON COMMENT '变量定义JSON',
    `tags` VARCHAR(200) COMMENT '标签(多个用逗号分隔)',
    `is_system` TINYINT(1) DEFAULT 0 COMMENT '是否系统预置:0-否/1-是',
    `usage_count` INT DEFAULT 0 COMMENT '使用次数',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `creator` VARCHAR(64) COMMENT '创建人id',
    `creator_name` VARCHAR(100) COMMENT '创建人姓名',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_category` (`template_category`, `sub_category`),
    INDEX `idx_is_system` (`is_system`),
    INDEX `idx_usage_count` (`usage_count` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Flink SQL模板库';

-- Flink SQL片段管理表
CREATE TABLE IF NOT EXISTS `flink_sql_snippet` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `user_id` VARCHAR(64) NOT NULL COMMENT '用户ID',
    `snippet_name` VARCHAR(255) NOT NULL COMMENT '片段名称',
    `snippet_key` VARCHAR(100) COMMENT '快捷键(@开头)',
    `snippet_content` TEXT NOT NULL COMMENT '片段内容',
    `description` VARCHAR(500) COMMENT '描述',
    `tags` VARCHAR(200) COMMENT '标签(多个用逗号分隔)',
    `usage_count` INT DEFAULT 0 COMMENT '使用次数',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY `uk_user_snippet_key` (`user_id`, `snippet_key`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_usage_count` (`usage_count` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Flink SQL片段管理表';

-- Flink SQL Session管理表
CREATE TABLE IF NOT EXISTS `flink_sql_session` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `user_id` VARCHAR(64) NOT NULL COMMENT '用户ID',
    `connector_id` VARCHAR(64) NOT NULL COMMENT 'Flink连接器ID',
    `session_id` VARCHAR(255) NOT NULL COMMENT 'SQL Gateway Session ID',
    `session_name` VARCHAR(255) COMMENT 'Session名称',
    `session_type` VARCHAR(20) COMMENT 'Session类型:TEMPORARY/PERSISTENT',
    `operation_handle` VARCHAR(255) COMMENT 'Operation Handle',
    `job_id` VARCHAR(64) COMMENT 'Flink JobID',
    `job_name` VARCHAR(255) COMMENT '任务名称',
    `status` VARCHAR(20) COMMENT '状态:ACTIVE/CLOSED/EXPIRED/ERROR',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `last_activity_time` DATETIME COMMENT '最后活跃时间',
    `expired_at` DATETIME COMMENT '过期时间',
    `close_time` DATETIME COMMENT '关闭时间',
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_session_id` (`session_id`),
    INDEX `idx_job_id` (`job_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_expired_at` (`expired_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Flink SQL Session管理表';

-- ============================================
-- Flink SQL系统预置模板数据
-- ============================================

-- DDL模板 - 创建Kafka源表
INSERT INTO `flink_sql_template` (`template_name`, `template_category`, `sub_category`, `template_content`, `description`, `variables`, `tags`, `is_system`, `usage_count`) VALUES
('Kafka源表', 'DDL', 'Kafka', 'CREATE TABLE ${tableName} (
  `id` BIGINT,
  `name` STRING,
  `ts` TIMESTAMP(3),
  WATERMARK FOR ts AS ts - INTERVAL ''5'' SECOND
) WITH (
  ''connector'' = ''kafka'',
  ''topic'' = ''${topicName}'',
  ''properties.bootstrap.servers'' = ''${kafkaServers}'',
  ''properties.group.id'' = ''${groupId}'',
  ''scan.startup.mode'' = ''latest-offset'',
  ''format'' = ''json''
);', '创建Kafka源表，支持水位线', '{"tableName":"表名","topicName":"Kafka Topic","kafkaServers":"Kafka地址","groupId":"消费组"}', 'DDL,Kafka,源表', 1, 0),

('MySQL CDC源表', 'DDL', 'MySQL', 'CREATE TABLE ${tableName} (
  `id` BIGINT PRIMARY KEY NOT ENFORCED,
  `name` STRING,
  `age` INT,
  `update_time` TIMESTAMP(3)
) WITH (
  ''connector'' = ''mysql-cdc'',
  ''hostname'' = ''${host}'',
  ''port'' = ''${port}'',
  ''username'' = ''${username}'',
  ''password'' = ''${password}'',
  ''database-name'' = ''${database}'',
  ''table-name'' = ''${sourceTable}''
);', '创建MySQL CDC源表', '{"tableName":"表名","host":"MySQL主机","port":"3306","username":"用户名","password":"密码","database":"数据库","sourceTable":"源表"}', 'DDL,MySQL,CDC', 1, 0),

('JDBC结果表', 'DDL', 'JDBC', 'CREATE TABLE ${tableName} (
  `id` BIGINT PRIMARY KEY NOT ENFORCED,
  `name` STRING,
  `value` DECIMAL(10,2),
  `update_time` TIMESTAMP(3)
) WITH (
  ''connector'' = ''jdbc'',
  ''url'' = ''jdbc:mysql://${host}:${port}/${database}'',
  ''table-name'' = ''${targetTable}'',
  ''username'' = ''${username}'',
  ''password'' = ''${password}'',
  ''sink.buffer-flush.max-rows'' = ''100'',
  ''sink.buffer-flush.interval'' = ''1s''
);', '创建JDBC结果表', '{"tableName":"表名","host":"主机","port":"3306","database":"数据库","targetTable":"目标表","username":"用户名","password":"密码"}', 'DDL,JDBC,结果表', 1, 0),

-- DML模板
('INSERT插入数据', 'DML', '插入', 'INSERT INTO ${targetTable}
SELECT 
  id,
  name,
  value,
  CURRENT_TIMESTAMP AS update_time
FROM ${sourceTable}
WHERE ${condition};', '从源表插入数据到目标表', '{"targetTable":"目标表","sourceTable":"源表","condition":"筛选条件"}', 'DML,INSERT', 1, 0),

('实时聚合插入', 'DML', '聚合', 'INSERT INTO ${targetTable}
SELECT 
  window_start,
  window_end,
  ${groupKey},
  COUNT(*) as cnt,
  SUM(${valueField}) as total
FROM TABLE(
  TUMBLE(TABLE ${sourceTable}, DESCRIPTOR(ts), INTERVAL ''1'' MINUTE)
)
GROUP BY window_start, window_end, ${groupKey};', '滚动窗口聚合插入', '{"targetTable":"目标表","sourceTable":"源表","groupKey":"分组字段","valueField":"聚合字段"}', 'DML,窗口,聚合', 1, 0),

-- 窗口查询模板
('滚动窗口查询', '窗口查询', '滚动窗口', 'SELECT 
  window_start,
  window_end,
  ${groupKey},
  COUNT(*) as event_count,
  SUM(${valueField}) as total_value
FROM TABLE(
  TUMBLE(TABLE ${tableName}, DESCRIPTOR(ts), INTERVAL ''${windowSize}'' MINUTE)
)
GROUP BY window_start, window_end, ${groupKey};', '滚动窗口聚合查询', '{"tableName":"表名","groupKey":"分组字段","valueField":"聚合字段","windowSize":"窗口大小(分钟)"}', '窗口查询,滚动窗口', 1, 0),

('滑动窗口查询', '窗口查询', '滑动窗口', 'SELECT 
  window_start,
  window_end,
  ${groupKey},
  COUNT(*) as event_count
FROM TABLE(
  HOP(TABLE ${tableName}, DESCRIPTOR(ts), INTERVAL ''${slideSize}'' MINUTE, INTERVAL ''${windowSize}'' MINUTE)
)
GROUP BY window_start, window_end, ${groupKey};', '滑动窗口聚合查询', '{"tableName":"表名","groupKey":"分组字段","slideSize":"滑动步长","windowSize":"窗口大小"}', '窗口查询,滑动窗口', 1, 0),

('会话窗口查询', '窗口查询', '会话窗口', 'SELECT 
  window_start,
  window_end,
  ${groupKey},
  COUNT(*) as event_count
FROM TABLE(
  SESSION(TABLE ${tableName}, DESCRIPTOR(ts), INTERVAL ''${gapSize}'' MINUTE)
)
GROUP BY window_start, window_end, ${groupKey};', '会话窗口查询（基于间隔）', '{"tableName":"表名","groupKey":"分组字段","gapSize":"间隔时间"}', '窗口查询,会话窗口', 1, 0),

-- JOIN模板
('常规JOIN', '常用查询', 'JOIN', 'SELECT 
  a.id,
  a.name,
  b.value
FROM ${leftTable} a
JOIN ${rightTable} b
  ON a.${joinKey} = b.${joinKey}
WHERE ${condition};', '常规表关联', '{"leftTable":"左表","rightTable":"右表","joinKey":"关联字段","condition":"过滤条件"}', 'JOIN,查询', 1, 0),

('Interval JOIN', '常用查询', 'Interval JOIN', 'SELECT 
  a.id,
  a.name,
  b.value
FROM ${leftTable} a
JOIN ${rightTable} b
  ON a.${joinKey} = b.${joinKey}
  AND a.ts BETWEEN b.ts - INTERVAL ''${intervalBefore}'' MINUTE 
               AND b.ts + INTERVAL ''${intervalAfter}'' MINUTE;', '时间间隔JOIN', '{"leftTable":"左表","rightTable":"右表","joinKey":"关联字段","intervalBefore":"前置间隔","intervalAfter":"后置间隔"}', 'JOIN,Interval JOIN', 1, 0),

-- 常用查询
('查看表结构', '常用查询', '元数据', 'DESC ${tableName};', '查看表结构信息', '{"tableName":"表名"}', '查询,元数据', 1, 0),

('查看所有表', '常用查询', '元数据', 'SHOW TABLES;', '查看当前数据库所有表', '{}', '查询,元数据', 1, 0),

('数据预览', '常用查询', '预览', 'SELECT * FROM ${tableName} LIMIT ${limit};', '预览表数据', '{"tableName":"表名","limit":"100"}', '查询,预览', 1, 0),

('按条件查询', '常用查询', '筛选', 'SELECT * 
FROM ${tableName}
WHERE ${condition}
ORDER BY ${orderBy} DESC
LIMIT ${limit};', '按条件筛选查询', '{"tableName":"表名","condition":"查询条件","orderBy":"排序字段","limit":"100"}', '查询,筛选', 1, 0),

-- Catalog管理
('Catalog-Hive', '连接器配置', 'Catalog', 'CREATE CATALOG ${catalogName} WITH (
  ''type'' = ''hive'',
  ''default-database'' = ''${database}'',
  ''hive-conf-dir'' = ''${hiveConfDir}'',
  ''hadoop-conf-dir'' = ''${hadoopConfDir}''
);', '创建Hive Catalog', '{"catalogName":"Catalog名称","database":"默认数据库","hiveConfDir":"Hive配置目录","hadoopConfDir":"Hadoop配置目录"}', 'Catalog,Hive', 1, 0),

('Catalog-JDBC', '连接器配置', 'Catalog', 'CREATE CATALOG ${catalogName} WITH (
  ''type'' = ''jdbc'',
  ''default-database'' = ''${database}'',
  ''username'' = ''${username}'',
  ''password'' = ''${password}'',
  ''base-url'' = ''jdbc:mysql://${host}:${port}''
);', '创建JDBC Catalog', '{"catalogName":"Catalog名称","database":"默认数据库","username":"用户名","password":"密码","host":"主机","port":"3306"}', 'Catalog,JDBC', 1, 0),

('切换Catalog', '连接器配置', 'Catalog', 'USE CATALOG ${catalogName};', '切换到指定Catalog', '{"catalogName":"Catalog名称"}', 'Catalog', 1, 0),

('切换数据库', '连接器配置', 'Database', 'USE ${database};', '切换到指定数据库', '{"database":"数据库名"}', 'Database', 1, 0),

-- 高级功能
('TopN查询', '常用查询', 'TopN', 'SELECT *
FROM (
  SELECT *,
    ROW_NUMBER() OVER (
      PARTITION BY ${partitionKey} 
      ORDER BY ${orderBy} DESC
    ) AS row_num
  FROM ${tableName}
)
WHERE row_num <= ${topN};', 'TopN排名查询', '{"tableName":"表名","partitionKey":"分区字段","orderBy":"排序字段","topN":"10"}', '查询,TopN', 1, 0),

('去重查询', '常用查询', '去重', 'SELECT DISTINCT ${fields}
FROM ${tableName}
WHERE ${condition};', '去重查询', '{"fields":"字段列表","tableName":"表名","condition":"过滤条件"}', '查询,去重', 1, 0),

-- DML操作模板（UPDATE/DELETE）
('UPDATE更新数据', 'DML', '更新', '-- Flink SQL不直接支持UPDATE，使用INSERT OVERWRITE或Upsert模式
INSERT INTO ${targetTable}
SELECT 
  id,
  ${updateFields},
  CURRENT_TIMESTAMP AS update_time
FROM ${sourceTable}
WHERE ${condition};', '使用INSERT覆盖方式更新数据', '{"targetTable":"目标表","sourceTable":"源表","updateFields":"更新字段","condition":"更新条件"}', 'DML,UPDATE,更新', 1, 0),

('DELETE删除数据', 'DML', '删除', '-- Flink SQL不直接支持DELETE，通过Changelog流实现
-- 配置changelog-mode=retract的sink连接器
INSERT INTO ${targetTable}
SELECT * FROM ${sourceTable}
WHERE NOT (${deleteCondition});', '通过过滤实现逻辑删除', '{"targetTable":"目标表","sourceTable":"源表","deleteCondition":"删除条件"}', 'DML,DELETE,删除', 1, 0),

-- 其他连接器模板
('Elasticsearch结果表', '连接器', 'Elasticsearch', 'CREATE TABLE ${tableName} (
  `id` STRING,
  `name` STRING,
  `value` DOUBLE,
  `ts` TIMESTAMP(3),
  PRIMARY KEY (id) NOT ENFORCED
) WITH (
  ''connector'' = ''elasticsearch-7'',
  ''hosts'' = ''http://${esHost}:${esPort}'',
  ''index'' = ''${indexName}'',
  ''format'' = ''json''
);', '创建Elasticsearch 7.x结果表', '{"tableName":"表名","esHost":"ES主机","esPort":"9200","indexName":"索引名"}', 'Elasticsearch,连接器,结果表', 1, 0),

('Redis维表', '连接器', 'Redis', 'CREATE TABLE ${tableName} (
  `key` STRING,
  `value` STRING
) WITH (
  ''connector'' = ''redis'',
  ''host'' = ''${redisHost}'',
  ''port'' = ''${redisPort}'',
  ''password'' = ''${password}'',
  ''database'' = ''${database}''
);', '创建Redis维表（用于JOIN查询）', '{"tableName":"表名","redisHost":"Redis主机","redisPort":"6379","password":"密码","database":"0"}', 'Redis,连接器,维表', 1, 0);

-- ============================================
-- 15. Python Web 开发环境相关表
-- ============================================

-- Python Workspace 表
CREATE TABLE IF NOT EXISTS `data_python_workspace` (
    `id` VARCHAR(64) NOT NULL PRIMARY KEY COMMENT 'Workspace ID',
    `user_id` VARCHAR(64) NOT NULL COMMENT '用户ID',
    `name` VARCHAR(100) NOT NULL COMMENT 'Workspace 名称',
    `description` VARCHAR(500) COMMENT '描述',
    `workspace_path` VARCHAR(500) NOT NULL COMMENT '工作目录路径',
    `kernel_id` VARCHAR(64) COMMENT 'Kernel ID（启动后填充）',
    `status` VARCHAR(20) DEFAULT 'INACTIVE' COMMENT '状态：ACTIVE(运行中)/INACTIVE(未启动)/ERROR(异常)',
    `kernel_gateway_url` VARCHAR(200) COMMENT 'KernelGateway 地址',
    `creator` VARCHAR(64) COMMENT '创建者ID',
    `creator_name` VARCHAR(100) COMMENT '创建者名称',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater` VARCHAR(64) COMMENT '更新者ID',
    `updater_name` VARCHAR(100) COMMENT '更新者名称',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除标识(0-未删除, 1-已删除)',
    UNIQUE KEY `uk_user_name` (`user_id`, `name`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Python Workspace 表';

-- Python 脚本文件表
CREATE TABLE IF NOT EXISTS `data_python_script` (
    `id` VARCHAR(64) NOT NULL PRIMARY KEY COMMENT '脚本ID',
    `workspace_id` VARCHAR(64) NOT NULL COMMENT 'Workspace ID',
    `name` VARCHAR(100) NOT NULL COMMENT '脚本名称',
    `file_path` VARCHAR(500) NOT NULL COMMENT '文件相对路径',
    `content` LONGTEXT COMMENT '脚本内容（可选，主要存文件）',
    `is_published` TINYINT(1) DEFAULT 0 COMMENT '是否已发布为服务',
    `publish_endpoint` VARCHAR(200) COMMENT '发布后的 endpoint 路径',
    `creator` VARCHAR(64) COMMENT '创建者ID',
    `creator_name` VARCHAR(100) COMMENT '创建者名称',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater` VARCHAR(64) COMMENT '更新者ID',
    `updater_name` VARCHAR(100) COMMENT '更新者名称',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除标识(0-未删除, 1-已删除)',
    INDEX `idx_workspace_id` (`workspace_id`),
    INDEX `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Python 脚本文件表';

-- Python 版本备份表
CREATE TABLE IF NOT EXISTS `data_python_backup` (
    `id` VARCHAR(64) NOT NULL PRIMARY KEY COMMENT '备份ID',
    `workspace_id` VARCHAR(64) NOT NULL COMMENT 'Workspace ID',
    `remark` VARCHAR(500) COMMENT '备注说明',
    `backup_path` VARCHAR(500) NOT NULL COMMENT '备份文件路径',
    `file_count` INT DEFAULT 0 COMMENT '备份文件数量',
    `creator` VARCHAR(64) COMMENT '创建者ID',
    `creator_name` VARCHAR(100) COMMENT '创建者名称',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除标识(0-未删除, 1-已删除)',
    INDEX `idx_workspace_id` (`workspace_id`),
    INDEX `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Python 版本备份表';

-- Python 发布服务表
CREATE TABLE IF NOT EXISTS `data_python_service` (
    `id` VARCHAR(64) NOT NULL PRIMARY KEY COMMENT '服务ID',
    `workspace_id` VARCHAR(64) NOT NULL COMMENT 'Workspace ID',
    `script_name` VARCHAR(100) NOT NULL COMMENT '脚本文件名（如 main.py）',
    `service_name` VARCHAR(100) NOT NULL COMMENT '服务名称（显示用）',
    `description` VARCHAR(500) COMMENT '服务描述',
    `api_key` VARCHAR(64) NOT NULL COMMENT 'API Key（调用时需在 Header 中传递）',
    `status` VARCHAR(20) DEFAULT 'ACTIVE' COMMENT '状态：ACTIVE(有效)/INACTIVE(停用)',
    `effective_start` DATETIME COMMENT '生效开始时间（NULL 表示立即生效）',
    `effective_end` DATETIME COMMENT '生效结束时间（NULL 表示永久有效）',
    `creator` VARCHAR(64) COMMENT '创建者ID',
    `creator_name` VARCHAR(100) COMMENT '创建者名称',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater` VARCHAR(64) COMMENT '更新者ID',
    `updater_name` VARCHAR(100) COMMENT '更新者名称',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除标识(0-未删除, 1-已删除)',
    UNIQUE KEY `uk_api_key` (`api_key`),
    INDEX `idx_workspace_id` (`workspace_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Python 发布服务表';

-- ============================================
-- 脚本结束
-- ============================================
