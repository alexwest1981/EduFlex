package com.eduflex.backend.config;

import com.theokanning.openai.service.OpenAiService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

/**
 * Configuration for OpenAI API integration.
 * Provides beans for AI-powered features like quiz generation.
 */
@Configuration
@ConditionalOnProperty(name = "openai.api.key", matchIfMissing = false)
public class OpenAIConfig {

    @Value("${openai.api.key:}")
    private String apiKey;

    @Value("${openai.timeout:60}")
    private int timeoutSeconds;

    @Bean
    public OpenAiService openAiService() {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("OpenAI API key is not configured. Set openai.api.key in application.properties or OPENAI_API_KEY environment variable.");
        }
        return new OpenAiService(apiKey, Duration.ofSeconds(timeoutSeconds));
    }
}
