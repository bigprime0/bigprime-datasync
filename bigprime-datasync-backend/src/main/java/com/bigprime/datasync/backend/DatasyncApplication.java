package com.bigprime.datasync.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * @author lyw
 * @version 1.0
 */
@EnableAsync
@EnableScheduling
@EnableDiscoveryClient
@SpringBootApplication(
    scanBasePackages = "com.bigprime",
    exclude = {
        // 排除数据库自动配置，避免启动时尝试连接
        org.springframework.boot.autoconfigure.neo4j.Neo4jAutoConfiguration.class,
        org.springframework.boot.autoconfigure.data.neo4j.Neo4jDataAutoConfiguration.class,
        org.springframework.boot.autoconfigure.data.mongo.MongoDataAutoConfiguration.class,
        org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration.class,
        org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchRestClientAutoConfiguration.class
    }
)
public class DatasyncApplication {
    public static void main(String[] args) {
        SpringApplication.run(DatasyncApplication.class, args);
    }
}
