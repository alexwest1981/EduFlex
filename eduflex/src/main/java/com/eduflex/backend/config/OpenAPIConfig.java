package com.eduflex.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenAPIConfig {

    @Bean
    public OpenAPI eduFlexOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("EduFlex LMS API")
                        .description("Complete Enterprise Learning Management System API Documentation")
                        .version("2.0.0")
                        .contact(new Contact()
                                .name("Alex Weström / Fenrir Studio")
                                .email("alexwestrom81@gmail.com")
                                .url("https://github.com/alexwest1981/EduFlex"))
                        .license(new License()
                                .name("Proprietary")
                                .url("https://github.com/alexwest1981/EduFlex")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080")
                                .description("Local Development Server"),
                        new Server()
                                .url("https://api.eduflex.se")
                                .description("Production Server")))
                .components(new Components()
                        .addSecuritySchemes("bearer-jwt", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT token obtained from /api/auth/login or Keycloak SSO")))
                .addSecurityItem(new SecurityRequirement().addList("bearer-jwt"));
    }
}
