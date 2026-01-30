package com.eduflex.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // exposeDirectory(uploadDir, registry);

        // Serve OnlyOffice static assets
        registry.addResourceHandler("/web-apps/**")
                .addResourceLocations("classpath:/static/web-apps/")
                .setCachePeriod(0);
    }

    /*
     * private void exposeDirectory(String dirName, ResourceHandlerRegistry
     * registry) {
     * Path uploadDirPath = Paths.get(dirName);
     * String resourceLocation = uploadDirPath.toUri().toString();
     * registry.addResourceHandler("/uploads/**")
     * .addResourceLocations(resourceLocation);
     * }
     */
}