package com.eduflex.backend.config;

import com.eduflex.backend.security.AuthTokenFilter;
import com.eduflex.backend.security.CustomOAuth2UserService;
import com.eduflex.backend.security.CustomUserDetailsService;
import com.eduflex.backend.security.KeycloakJwtAuthConverter;
import com.eduflex.backend.security.LicenseFilter;
import com.eduflex.backend.config.tenant.TenantFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final AuthTokenFilter authTokenFilter;
    private final LicenseFilter licenseFilter;
    private final KeycloakJwtAuthConverter keycloakJwtAuthConverter;
    private final TenantFilter tenantFilter;
    private final com.eduflex.backend.security.RateLimitingFilter rateLimitingFilter;

    @Value("${eduflex.auth.mode:hybrid}")
    private String authMode;

    private final com.eduflex.backend.security.OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    private final com.eduflex.backend.security.OAuth2LoginFailureHandler oAuth2LoginFailureHandler;
    private final com.eduflex.backend.security.CustomOidcUserService customOidcUserService;
    private final com.eduflex.backend.security.LoggingAuthenticationEntryPoint loggingAuthenticationEntryPoint;

    public SecurityConfig(CustomUserDetailsService userDetailsService, CustomOAuth2UserService customOAuth2UserService,
            AuthTokenFilter authTokenFilter,
            LicenseFilter licenseFilter,
            KeycloakJwtAuthConverter keycloakJwtAuthConverter,
            TenantFilter tenantFilter,
            com.eduflex.backend.security.OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler,
            com.eduflex.backend.security.OAuth2LoginFailureHandler oAuth2LoginFailureHandler,
            com.eduflex.backend.security.CustomOidcUserService customOidcUserService,
            com.eduflex.backend.security.LoggingAuthenticationEntryPoint loggingAuthenticationEntryPoint,
            com.eduflex.backend.security.RateLimitingFilter rateLimitingFilter) {
        this.userDetailsService = userDetailsService;
        this.customOAuth2UserService = customOAuth2UserService;
        this.authTokenFilter = authTokenFilter;
        this.licenseFilter = licenseFilter;
        this.keycloakJwtAuthConverter = keycloakJwtAuthConverter;
        this.tenantFilter = tenantFilter;
        this.oAuth2LoginSuccessHandler = oAuth2LoginSuccessHandler;
        this.oAuth2LoginFailureHandler = oAuth2LoginFailureHandler;
        this.customOidcUserService = customOidcUserService;
        this.loggingAuthenticationEntryPoint = loggingAuthenticationEntryPoint;
        this.rateLimitingFilter = rateLimitingFilter;
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring().requestMatchers("/uploads/**");
    }

    @Bean
    @org.springframework.core.annotation.Order(1)
    public SecurityFilterChain staticResourcesFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher(request -> {
                    // Combine AntPath and Regex matching logic
                    String path = request.getRequestURI();
                    // AntPath style checks
                    if (path.startsWith("/uploads/") ||
                            path.startsWith("/web-apps/") ||
                            path.startsWith("/sdkjs/") ||
                            path.startsWith("/sdkjs-plugins/") ||
                            path.startsWith("/fonts/") ||
                            path.startsWith("/cache/") ||
                            path.startsWith("/api/public/") ||
                            path.startsWith("/api/admin/") ||
                            path.startsWith("/api/onlyoffice/") ||
                            path.startsWith("/api/tenants/")) {
                        return true;
                    }
                    // Regex check for OnlyOffice version numbers (e.g. /8.2.0/...)
                    return path.matches("^/[0-9]+\\.[0-9]+\\.[0-9]+/.*");
                }).cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());

        http.headers(headers -> headers.frameOptions(frame -> frame.disable()));

        return http.build();
    }

    @Bean
    @org.springframework.core.annotation.Order(2)
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 1. VIKTIGT: Tillåt alltid OPTIONS (CORS pre-flight)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 2. Publika endpoints
                        .requestMatchers("/", "/index.html", "/favicon.ico", "/api/auth/**", "/api/users/register",
                                "/api/users/generate-usernames",
                                "/api/settings/**", "/login/**", "/api/tenants/**", "/api/public/**",
                                "/api/branding/**", "/api/debug/**", "/api/onlyoffice/**",
                                "/api/gamification/config/system", "/api/payment/**", "/api/community/subjects")
                        .permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/tenants").permitAll() // Explicitly allow POST
                        .requestMatchers("/api/system/license/**", "/uploads/**", "/api/files/**", "/api/ebooks/**",
                                "/api/storage/**",
                                "/h2-console/**",
                                "/ws/**",
                                "/ws-log/**",
                                "/ws-forum/**",
                                "/actuator/**", "/lti/**", "/api/lti/**", "/error",
                                "/web-apps/**", "/src/**", "/assets/**", // Allow OnlyOffice and Frontend assets
                                "/@vite/**", "/@fs/**", "/@id/**", "/node_modules/**", // Vite Dev Mode assets
                                "/client-assets/**", "/static/**",
                                // Swagger UI and OpenAPI Documentation
                                "/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html", "/api-docs/**")
                        .permitAll()

                        // 3. KURS-REGLER
                        // ...

                        // at end of file ...

                        // 3. KURS-REGLER

                        // --- FIX: TILLÅT ANSÖKAN FÖR ALLA INLOGGADE ---
                        // Detta måste ligga INNAN regeln som blockerar POST för studenter
                        .requestMatchers(HttpMethod.POST, "/api/courses/*/apply/*").authenticated()
                        // ----------------------------------------------

                        .requestMatchers(HttpMethod.POST, "/api/courses/*/join", "/api/courses/*/enroll")
                        .authenticated()

                        // Tillåt studenter att se sina egna kurser
                        .requestMatchers("/api/courses/student/**").authenticated()

                        // ENDAST Lärare och Admins får ändra/skapa kurser generellt
                        .requestMatchers(HttpMethod.POST, "/api/courses/**")
                        .hasAnyAuthority("ADMIN", "ROLE_ADMIN", "TEACHER", "ROLE_TEACHER")

                        .requestMatchers(HttpMethod.PUT, "/api/courses/**")
                        .hasAnyAuthority("ADMIN", "ROLE_ADMIN", "TEACHER", "ROLE_TEACHER")

                        .requestMatchers(HttpMethod.DELETE, "/api/courses/**")
                        .hasAnyAuthority("ADMIN", "ROLE_ADMIN", "TEACHER", "ROLE_TEACHER")

                        // Alla inloggade får läsa kurser (GET)
                        .requestMatchers(HttpMethod.GET, "/api/courses/**").authenticated()

                        // 4. Övrigt
                        .requestMatchers("/api/live-lessons/**").authenticated()
                        .requestMatchers("/api/notifications/**").authenticated()
                        .requestMatchers("/api/quizzes/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/logs/client").authenticated() // Allow all authenticated
                                                                                              // users to report errors
                        .requestMatchers("/api/logs/**", "/api/admin/**").hasAnyAuthority("ADMIN", "ROLE_ADMIN")

                        // 5. Community endpoints
                        .requestMatchers(HttpMethod.GET, "/api/community/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/community/publish/**")
                        .hasAnyAuthority("ADMIN", "ROLE_ADMIN", "TEACHER", "ROLE_TEACHER")
                        .requestMatchers(HttpMethod.POST, "/api/community/items/*/install").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/community/items/*/rate").authenticated()
                        .requestMatchers("/api/community/admin/**")
                        .hasAnyAuthority("ADMIN", "ROLE_ADMIN")

                        // 6. AI Quiz Generation endpoints
                        .requestMatchers(HttpMethod.POST, "/api/ai/quiz/practice/**").authenticated() // Allow students
                                                                                                      // to generate
                                                                                                      // practice
                                                                                                      // quizzes
                        .requestMatchers(HttpMethod.GET, "/api/ai/quiz/status").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/ai/quiz/**")
                        .hasAnyAuthority("ADMIN", "ROLE_ADMIN", "TEACHER", "ROLE_TEACHER")

                        // 7. Gamification endpoints
                        .requestMatchers("/api/gamification/achievements/my", "/api/gamification/points/my")
                        .authenticated()
                        .requestMatchers("/api/gamification/leaderboard/**").authenticated()
                        .requestMatchers("/api/gamification/admin/**").hasAnyAuthority("ADMIN", "ROLE_ADMIN")

                        // 8. AI Course Generation endpoints
                        .requestMatchers("/api/ai-course/**")
                        .hasAnyAuthority("ADMIN", "ROLE_ADMIN", "TEACHER", "ROLE_TEACHER")

                        // 9. Analytics endpoints
                        .requestMatchers("/api/analytics/my-status", "/api/analytics/student/**",
                                "/api/analytics/heatmap")
                        .authenticated()
                        .requestMatchers("/api/analytics/**")
                        .hasAnyAuthority("ADMIN", "ROLE_ADMIN", "TEACHER", "ROLE_TEACHER")

                        // 10. Module management endpoints
                        .requestMatchers(HttpMethod.GET, "/api/modules").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/modules/**")
                        .hasAnyAuthority("ADMIN", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/modules/**")
                        .hasAnyAuthority("ADMIN", "ROLE_ADMIN")

                        // 11. Resource Bank endpoints
                        .requestMatchers("/api/resources/**").authenticated()

                        // All other requests require authentication
                        .anyRequest().authenticated())
                .exceptionHandling(e -> e.authenticationEntryPoint(loggingAuthenticationEntryPoint));

        // OAuth2 Resource Server (for validating Keycloak JWT tokens from API calls)
        if ("keycloak".equalsIgnoreCase(authMode) || "hybrid".equalsIgnoreCase(authMode)) {
            http.oauth2ResourceServer(oauth2 -> oauth2
                    .jwt(jwt -> jwt.jwtAuthenticationConverter(keycloakJwtAuthConverter)));
        }

        http.authenticationProvider(authenticationProvider());
        // Register TenantFilter BEFORE Authentication to ensure schema is set
        http.addFilterBefore(tenantFilter, UsernamePasswordAuthenticationFilter.class);

        if ("keycloak".equalsIgnoreCase(authMode) || "hybrid".equalsIgnoreCase(authMode)) {
            // Runs before Resource Server filter to validate internal tokens first
            http.addFilterBefore(authTokenFilter,
                    org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter.class);
        } else {
            http.addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);
        }
        http.addFilterBefore(licenseFilter, UsernamePasswordAuthenticationFilter.class);
        http.addFilterBefore(rateLimitingFilter, UsernamePasswordAuthenticationFilter.class);

        // OAuth2 Login (for social login and Keycloak browser-based SSO)
        http.oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                        .userService(customOAuth2UserService)
                        .oidcUserService(customOidcUserService))
                .successHandler(oAuth2LoginSuccessHandler)
                .failureHandler(oAuth2LoginFailureHandler));

        // Tillåt iFrames för H2-konsolen
        http.headers(headers -> headers.frameOptions(frame -> frame.disable()));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow localhost and LAN access (any IP on common ports)
        configuration.setAllowedOriginPatterns(List.of(
                "http://localhost:*",
                "http://127.0.0.1:*",
                "http://192.168.*.*:*",
                "http://10.*.*.*:*",
                "http://172.16.*.*:*",
                // Allow ngrok and other tunneling services
                "https://*.ngrok-free.app",
                "https://*.ngrok.io",
                "https://*.ngrok-free.dev",
                "https://*.loca.lt",
                "https://*.trycloudflare.com",
                "https://eduflexlms.se",
                "https://www.eduflexlms.se"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("Authorization", "Cache-Control", "Content-Type", "X-Requested-With",
                "Accept", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers", "X-Tenant-ID"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public org.springframework.web.servlet.config.annotation.WebMvcConfigurer webMvcConfigurer() {
        return new org.springframework.web.servlet.config.annotation.WebMvcConfigurer() {
            @Override
            public void addResourceHandlers(
                    org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry registry) {
                // Map /uploads/** URL to file system location
                registry.addResourceHandler("/uploads/**")
                        .addResourceLocations("file:///E:/Projekt/EduFlex/uploads/");
            }
        };
    }
}