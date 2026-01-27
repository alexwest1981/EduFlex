package com.eduflex.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * Configuration for Google Gemini API integration.
 * Provides beans for AI-powered features like quiz generation.
 */
@Configuration
@ConditionalOnExpression("'${gemini.api.key:}' != ''")
public class GeminiConfig {

    @Value("${gemini.timeout:60}")
    private int timeoutSeconds;

    @Bean(name = "geminiRestTemplate")
    public RestTemplate geminiRestTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(10))
                .setReadTimeout(Duration.ofSeconds(timeoutSeconds))
                .build();
    }
}
