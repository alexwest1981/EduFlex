package com.eduflex.backend.config;

import com.eduflex.backend.security.AuthTokenFilter;
import com.eduflex.backend.security.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
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
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final AuthTokenFilter authTokenFilter;

    public SecurityConfig(CustomUserDetailsService userDetailsService, AuthTokenFilter authTokenFilter) {
        this.userDetailsService = userDetailsService;
        this.authTokenFilter = authTokenFilter;
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
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
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 1. VIKTIGT: Tillåt alltid OPTIONS (CORS pre-flight)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 2. Publika endpoints - HÄR LIGGER LICENS-UNDANTAGET
                        .requestMatchers("/api/auth/**", "/api/users/register", "/api/users/generate-usernames").permitAll()
                        // Tillåt licenssystem, bilduppladdningar och H2-databasen
                        .requestMatchers("/api/system/license/**", "/uploads/**", "/h2-console/**", "/ws/**").permitAll()

                        // 3. KURS-REGLER
                        // Lärare och Admins får ändra i kurser
                        .requestMatchers(HttpMethod.POST, "/api/courses/**")
                        .hasAnyAuthority("ADMIN", "ROLE_ADMIN", "TEACHER", "ROLE_TEACHER")

                        .requestMatchers(HttpMethod.PUT, "/api/courses/**")
                        .hasAnyAuthority("ADMIN", "ROLE_ADMIN", "TEACHER", "ROLE_TEACHER")

                        .requestMatchers(HttpMethod.DELETE, "/api/courses/**")
                        .hasAnyAuthority("ADMIN", "ROLE_ADMIN", "TEACHER", "ROLE_TEACHER")

                        // Alla inloggade får läsa kurser (GET)
                        .requestMatchers(HttpMethod.GET, "/api/courses/**").authenticated()

                        // 4. Övrigt - Allt annat kräver inloggning
                        .requestMatchers("/api/quizzes/**").authenticated()
                        .anyRequest().authenticated()
                );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);

        // Tillåt iFrames för H2-konsolen
        http.headers(headers -> headers.frameOptions(frame -> frame.disable()));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Tillåt alla origins (*) för enkelhetens skull, eller specifik domän för säkerhet
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}