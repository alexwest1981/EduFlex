package com.eduflex.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Konfigurera så att URL:er som börjar med "/uploads/**"
        // pekar mot den fysiska mappen "uploads" i projektets rotkatalog.

        // "file:./uploads/" betyder "leta i mappen uploads som ligger i samma mapp som programmet körs ifrån".
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:./uploads/");
    }
}