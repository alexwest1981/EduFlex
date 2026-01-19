package com.eduflex.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Vi behåller enbart filhanteringen här
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:./uploads/");
    }

    // CORS hanteras nu centralt i SecurityConfig.java för att undvika konflikter
    // och dubbla headers.
    // @Override
    // public void
    // addCorsMappings(org.springframework.web.servlet.config.annotation.CorsRegistry
    // registry) { ... }

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        return new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .registerModule(new com.fasterxml.jackson.module.paramnames.ParameterNamesModule())
                .disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .disable(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
    }

}