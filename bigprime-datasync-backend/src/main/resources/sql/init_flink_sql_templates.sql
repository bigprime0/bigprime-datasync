-- Flink SQL模板初始化脚本（修复版）
USE bigprime_datasync;

-- 清空现有测试数据
DELETE FROM flink_sql_template WHERE is_system = 1;

-- 基础DDL模板
INSERT INTO flink_sql_template (template_name, template_category, sub_category, template_content, description, variables, tags, is_system, usage_count) VALUES
('Kafka源表', 'DDL', 'Kafka', 
'CREATE TABLE ${tableName} (
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
);', 
'创建Kafka源表，支持水位线', 
'{"tableName":"表名","topicName":"Kafka Topic","kafkaServers":"Kafka地址","groupId":"消费组"}', 
'DDL,Kafka,源表', 
1, 0),

('MySQL CDC源表', 'DDL', 'MySQL', 
'CREATE TABLE ${tableName} (
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
);', 
'创建MySQL CDC源表（实时数据同步）', 
'{"tableName":"表名","host":"MySQL主机","port":"3306","username":"用户名","password":"密码","database":"数据库","sourceTable":"源表"}', 
'DDL,MySQL,CDC', 
1, 0),

('JDBC结果表', 'DDL', 'JDBC', 
'CREATE TABLE ${tableName} (
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
);', 
'创建JDBC结果表（写入MySQL）', 
'{"tableName":"表名","host":"主机","port":"3306","database":"数据库","targetTable":"目标表","username":"用户名","password":"密码"}', 
'DDL,JDBC,结果表', 
1, 0);

-- 窗口查询模板
INSERT INTO flink_sql_template (template_name, template_category, sub_category, template_content, description, variables, tags, is_system, usage_count) VALUES
('滚动窗口查询', '窗口查询', '滚动窗口', 
'SELECT 
  window_start,
  window_end,
  ${groupKey},
  COUNT(*) as event_count,
  SUM(${valueField}) as total_value
FROM TABLE(
  TUMBLE(TABLE ${tableName}, DESCRIPTOR(ts), INTERVAL ''${windowSize}'' MINUTE)
)
GROUP BY window_start, window_end, ${groupKey};', 
'Tumble滚动窗口聚合查询（固定时间窗口）', 
'{"tableName":"表名","groupKey":"分组字段","valueField":"聚合字段","windowSize":"窗口大小(分钟)"}', 
'窗口查询,滚动窗口,Tumble', 
1, 0),

('滑动窗口查询', '窗口查询', '滑动窗口', 
'SELECT 
  window_start,
  window_end,
  ${groupKey},
  COUNT(*) as event_count
FROM TABLE(
  HOP(TABLE ${tableName}, DESCRIPTOR(ts), INTERVAL ''${slideSize}'' MINUTE, INTERVAL ''${windowSize}'' MINUTE)
)
GROUP BY window_start, window_end, ${groupKey};', 
'Hop滑动窗口聚合查询（可重叠窗口）', 
'{"tableName":"表名","groupKey":"分组字段","slideSize":"滑动步长(分钟)","windowSize":"窗口大小(分钟)"}', 
'窗口查询,滑动窗口,Hop', 
1, 0),

('会话窗口查询', '窗口查询', '会话窗口', 
'SELECT 
  window_start,
  window_end,
  ${groupKey},
  COUNT(*) as event_count
FROM TABLE(
  SESSION(TABLE ${tableName}, DESCRIPTOR(ts), INTERVAL ''${gapSize}'' MINUTE)
)
GROUP BY window_start, window_end, ${groupKey};', 
'Session会话窗口查询（基于事件间隔）', 
'{"tableName":"表名","groupKey":"分组字段","gapSize":"间隔时间(分钟)"}', 
'窗口查询,会话窗口,Session', 
1, 0);

-- JOIN查询模板
INSERT INTO flink_sql_template (template_name, template_category, sub_category, template_content, description, variables, tags, is_system, usage_count) VALUES
('常规JOIN', '常用查询', 'JOIN', 
'SELECT 
  a.id,
  a.name,
  b.value
FROM ${leftTable} a
JOIN ${rightTable} b
  ON a.${joinKey} = b.${joinKey}
WHERE ${condition};', 
'标准表关联查询', 
'{"leftTable":"左表","rightTable":"右表","joinKey":"关联字段","condition":"过滤条件"}', 
'JOIN,查询', 
1, 0),

('Interval JOIN', '常用查询', 'Interval JOIN', 
'SELECT 
  a.id,
  a.name,
  b.value
FROM ${leftTable} a
JOIN ${rightTable} b
  ON a.${joinKey} = b.${joinKey}
  AND a.ts BETWEEN b.ts - INTERVAL ''${intervalBefore}'' MINUTE 
               AND b.ts + INTERVAL ''${intervalAfter}'' MINUTE;', 
'时间间隔JOIN（用于流式关联）', 
'{"leftTable":"左表","rightTable":"右表","joinKey":"关联字段","intervalBefore":"前置间隔(分钟)","intervalAfter":"后置间隔(分钟)"}', 
'JOIN,Interval JOIN,流式关联', 
1, 0);

-- 常用查询模板
INSERT INTO flink_sql_template (template_name, template_category, sub_category, template_content, description, variables, tags, is_system, usage_count) VALUES
('查看表结构', '常用查询', '元数据', 
'DESC ${tableName};', 
'查看表结构信息', 
'{"tableName":"表名"}', 
'查询,元数据,DESC', 
1, 0),

('查看所有表', '常用查询', '元数据', 
'SHOW TABLES;', 
'查看当前数据库所有表', 
'{}', 
'查询,元数据,SHOW', 
1, 0),

('数据预览', '常用查询', '预览', 
'SELECT * FROM ${tableName} LIMIT ${limit};', 
'预览表数据', 
'{"tableName":"表名","limit":"100"}', 
'查询,预览,LIMIT', 
1, 0),

('TopN查询', '常用查询', 'TopN', 
'SELECT *
FROM (
  SELECT *,
    ROW_NUMBER() OVER (
      PARTITION BY ${partitionKey} 
      ORDER BY ${orderBy} DESC
    ) AS row_num
  FROM ${tableName}
)
WHERE row_num <= ${topN};', 
'TopN排名查询（窗口函数）', 
'{"tableName":"表名","partitionKey":"分区字段","orderBy":"排序字段","topN":"10"}', 
'查询,TopN,排名', 
1, 0),

('去重查询', '常用查询', '去重', 
'SELECT DISTINCT ${fields}
FROM ${tableName}
WHERE ${condition};', 
'DISTINCT去重查询', 
'{"fields":"字段列表","tableName":"表名","condition":"过滤条件"}', 
'查询,去重,DISTINCT', 
1, 0);

-- DML操作模板
INSERT INTO flink_sql_template (template_name, template_category, sub_category, template_content, description, variables, tags, is_system, usage_count) VALUES
('INSERT插入数据', 'DML', '插入', 
'INSERT INTO ${targetTable}
SELECT 
  id,
  name,
  value,
  CURRENT_TIMESTAMP AS update_time
FROM ${sourceTable}
WHERE ${condition};', 
'从源表插入数据到目标表', 
'{"targetTable":"目标表","sourceTable":"源表","condition":"筛选条件"}', 
'DML,INSERT,插入', 
1, 0),

('实时聚合插入', 'DML', '聚合', 
'INSERT INTO ${targetTable}
SELECT 
  window_start,
  window_end,
  ${groupKey},
  COUNT(*) as cnt,
  SUM(${valueField}) as total
FROM TABLE(
  TUMBLE(TABLE ${sourceTable}, DESCRIPTOR(ts), INTERVAL ''1'' MINUTE)
)
GROUP BY window_start, window_end, ${groupKey};', 
'滚动窗口聚合插入（实时大屏场景）', 
'{"targetTable":"目标表","sourceTable":"源表","groupKey":"分组字段","valueField":"聚合字段"}', 
'DML,窗口,聚合,实时大屏', 
1, 0),

('UPDATE更新数据', 'DML', '更新', 
'-- Flink SQL不直接支持UPDATE，使用INSERT OVERWRITE或Upsert模式
INSERT INTO ${targetTable}
SELECT 
  id,
  ${updateFields},
  CURRENT_TIMESTAMP AS update_time
FROM ${sourceTable}
WHERE ${condition};', 
'使用INSERT覆盖方式更新数据', 
'{"targetTable":"目标表","sourceTable":"源表","updateFields":"更新字段","condition":"更新条件"}', 
'DML,UPDATE,更新', 
1, 0),

('DELETE删除数据', 'DML', '删除', 
'-- Flink SQL不直接支持DELETE，通过Changelog流实现
-- 配置changelog-mode=retract的sink连接器
INSERT INTO ${targetTable}
SELECT * FROM ${sourceTable}
WHERE NOT (${deleteCondition});', 
'通过过滤实现逻辑删除', 
'{"targetTable":"目标表","sourceTable":"源表","deleteCondition":"删除条件"}', 
'DML,DELETE,删除', 
1, 0);

-- 连接器配置模板
INSERT INTO flink_sql_template (template_name, template_category, sub_category, template_content, description, variables, tags, is_system, usage_count) VALUES
('Catalog-Hive', '连接器', 'Catalog', 
'CREATE CATALOG ${catalogName} WITH (
  ''type'' = ''hive'',
  ''default-database'' = ''${database}'',
  ''hive-conf-dir'' = ''${hiveConfDir}'',
  ''hadoop-conf-dir'' = ''${hadoopConfDir}''
);', 
'创建Hive Catalog连接器', 
'{"catalogName":"Catalog名称","database":"默认数据库","hiveConfDir":"Hive配置目录","hadoopConfDir":"Hadoop配置目录"}', 
'Catalog,Hive,连接器', 
1, 0),

('Catalog-JDBC', '连接器', 'Catalog', 
'CREATE CATALOG ${catalogName} WITH (
  ''type'' = ''jdbc'',
  ''default-database'' = ''${database}'',
  ''username'' = ''${username}'',
  ''password'' = ''${password}'',
  ''base-url'' = ''jdbc:mysql://${host}:${port}''
);', 
'创建JDBC Catalog连接器（MySQL）', 
'{"catalogName":"Catalog名称","database":"默认数据库","username":"用户名","password":"密码","host":"主机","port":"3306"}', 
'Catalog,JDBC,MySQL,连接器', 
1, 0),

('切换Catalog', '连接器', 'Catalog', 
'USE CATALOG ${catalogName};', 
'切换到指定Catalog', 
'{"catalogName":"Catalog名称"}', 
'Catalog,切换', 
1, 0),

('切换数据库', '连接器', 'Database', 
'USE ${database};', 
'切换到指定数据库', 
'{"database":"数据库名"}', 
'Database,切换', 
1, 0),

('Elasticsearch结果表', '连接器', 'Elasticsearch', 
'CREATE TABLE ${tableName} (
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
);', 
'创建Elasticsearch 7.x结果表', 
'{"tableName":"表名","esHost":"ES主机","esPort":"9200","indexName":"索引名"}', 
'Elasticsearch,连接器,结果表', 
1, 0),

('Redis维表', '连接器', 'Redis', 
'CREATE TABLE ${tableName} (
  `key` STRING,
  `value` STRING
) WITH (
  ''connector'' = ''redis'',
  ''host'' = ''${redisHost}'',
  ''port'' = ''${redisPort}'',
  ''password'' = ''${password}'',
  ''database'' = ''${database}''
);', 
'创建Redis维表（用于JOIN查询）', 
'{"tableName":"表名","redisHost":"Redis主机","redisPort":"6379","password":"密码","database":"0"}', 
'Redis,连接器,维表', 
1, 0);

-- 验证插入结果
SELECT 
  id, 
  template_name, 
  template_category, 
  sub_category,
  is_system,
  LENGTH(template_content) as content_length
FROM flink_sql_template 
WHERE is_system = 1
ORDER BY template_category, id;
