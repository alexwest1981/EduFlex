
package com.eduflex.backend.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Enumeration;

@Component
@Order(Ordered.LOWEST_PRECEDENCE - 10) // Run after Security/Auth filters to see final response
public class GlobalLrsLoggingFilter implements Filter {

    private static final Logger logger = LoggerFactory.getLogger(GlobalLrsLoggingFilter.class);

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        String path = req.getRequestURI();

        if (path.startsWith("/api/lrs")) {
            ContentCachingRequestWrapper requestWrapper = new ContentCachingRequestWrapper(req);
            ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(
                    (HttpServletResponse) response);

            logger.info(">>> LRS REQUEST START: {} {}", req.getMethod(), path);

            Enumeration<String> headerNames = req.getHeaderNames();
            while (headerNames.hasMoreElements()) {
                String key = headerNames.nextElement();
                String value = req.getHeader(key);
                logger.info("    Header: {} = {}", key, value);
            }

            try {
                chain.doFilter(requestWrapper, responseWrapper);
            } finally {
                byte[] responseArray = responseWrapper.getContentAsByteArray();
                String responseBody = new String(responseArray, StandardCharsets.UTF_8);

                logger.info("<<< LRS REQUEST END: {} Status: {}", path, responseWrapper.getStatus());
                if (responseBody.length() > 0) {
                    logger.info("    Response Body [{} bytes]: {}", responseBody.length(), responseBody);
                } else {
                    logger.info("    Response Body is EMPTY");
                }

                // CRITICAL: Copy body back to actual response
                responseWrapper.copyBodyToResponse();
            }
        } else {
            chain.doFilter(request, response);
        }
    }
}
