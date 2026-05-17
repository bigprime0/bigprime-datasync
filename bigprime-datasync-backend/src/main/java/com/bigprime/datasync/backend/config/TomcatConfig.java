package com.bigprime.datasync.backend.config;

import org.apache.catalina.core.StandardWrapper;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Tomcat配置 - 禁用JSP Servlet，避免javax.servlet与jakarta.servlet冲突
 */
@Configuration
public class TomcatConfig {

    @Bean
    public WebServerFactoryCustomizer<TomcatServletWebServerFactory> jspServletDisabler() {
        return factory -> factory.addContextCustomizers(context -> {
            // 在Tomcat启动时移除jsp Servlet，防止JspServlet加载导致ClassCastException
            StandardWrapper jspServlet = (StandardWrapper) context.findChild("jsp");
            if (jspServlet != null) {
                context.removeChild(jspServlet);
            }
        });
    }
}
