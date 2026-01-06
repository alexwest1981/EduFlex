package com.eduflex.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        exposeDirectory(uploadDir, registry);
    }

    private void exposeDirectory(String dirName, ResourceHandlerRegistry registry) {
        Path uploadDirPath = Paths.get(dirName);

        // FIX: Använd toUri() för att skapa en korrekt fil-URL oavsett operativsystem (Windows/Mac/Linux)
        // Detta löser problemet med brutna bilder på Windows.
        String resourceLocation = uploadDirPath.toUri().toString();

        // Städa bort ./ och ../ för URL-mappningen (webbadressen)
        String cleanDirName = dirName;
        if (cleanDirName.startsWith("./")) {
            cleanDirName = cleanDirName.substring(2);
        }
        if (cleanDirName.startsWith("../")) {
            cleanDirName = cleanDirName.replace("../", "");
        }

        // Koppla URL:en /uploads/** till mappen på hårddisken
        registry.addResourceHandler("/" + cleanDirName + "/**")
                .addResourceLocations(resourceLocation);
    }
}