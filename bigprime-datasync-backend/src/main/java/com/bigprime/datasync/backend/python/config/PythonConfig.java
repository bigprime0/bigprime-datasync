package com.bigprime.datasync.backend.python.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Python Web 模块配置
 *
 * @author bigprime
 * @version 1.0
 */
@Configuration
@EnableConfigurationProperties(PythonProperties.class)
public class PythonConfig {

}
