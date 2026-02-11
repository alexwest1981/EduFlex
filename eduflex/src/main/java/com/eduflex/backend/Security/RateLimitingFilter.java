package com.eduflex.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple in-memory rate limiter for login attempts.
 * TEMPORARILY DISABLED to fix 429 error.
 */
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final ConcurrentHashMap<String, Attempt> attempts = new ConcurrentHashMap<>();
    private static final int MAX_ATTEMPTS = 5;
    private static final long BLOCK_DURATION_MS = TimeUnit.MINUTES.toMillis(15);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if ("/api/auth/login".equalsIgnoreCase(request.getRequestURI())
                && "POST".equalsIgnoreCase(request.getMethod())) {
            String clientIp = getClientIp(request);
            Attempt attempt = attempts.get(clientIp);

            if (attempt != null) {
                System.out.println("DEBUG: RateLimiter - IP: " + clientIp + ", Count: " + attempt.count.get() + "/"
                        + MAX_ATTEMPTS);

                // Rate limiting logic temporarily disabled below
                /*
                 * if (attempt.count.get() >= MAX_ATTEMPTS) {
                 * if (System.currentTimeMillis() - attempt.lastAttemptTime < BLOCK_DURATION_MS)
                 * {
                 * System.out.println("DEBUG: RateLimiter - BLOCKING IP: " + clientIp);
                 * response.setStatus(429); // Too Many Requests
                 * response.setContentType("application/json");
                 * response.getWriter().write(
                 * "{\"error\": \"TOO_MANY_ATTEMPTS\", \"message\": \"Too many login attempts. Please try again later.\"}"
                 * );
                 * return;
                 * } else {
                 * // Reset if duration passed
                 * attempts.remove(clientIp);
                 * }
                 * }
                 */
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    public void recordAttempt(String ip) {
        attempts.compute(ip, (key, val) -> {
            if (val == null)
                return new Attempt();
            val.count.incrementAndGet();
            val.lastAttemptTime = System.currentTimeMillis();
            return val;
        });
    }

    private static class Attempt {
        AtomicInteger count = new AtomicInteger(1);
        long lastAttemptTime = System.currentTimeMillis();
    }
}
