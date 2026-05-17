package com.bigprime.datasync.backend.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/log")
public class LogTestController {
    
    private static final Logger logger = LoggerFactory.getLogger(LogTestController.class);
    
    @GetMapping("/test")
    public String testLog() {
        logger.info("这是一条测试日志信息");
        logger.warn("这是一条警告日志信息");
        logger.error("这是一条错误日志信息");
        
        // 模拟一些业务逻辑日志
        logger.debug("处理用户请求，参数: {}", "testParam");
        logger.info("用户操作完成，结果: {}", "success");
        
        return "日志测试完成，请在Grafana中查看";
    }
}