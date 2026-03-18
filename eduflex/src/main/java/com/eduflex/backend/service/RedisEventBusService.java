package com.eduflex.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

/**
 * Redis-backed implementation of the Event Bus.
 * Uses Redis Pub/Sub for lightweight and fast message distribution.
 */
@Service
public class RedisEventBusService implements EventBusService, DisposableBean {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private volatile boolean isShuttingDown = false;

    public RedisEventBusService(StringRedisTemplate redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public void destroy() {
        this.isShuttingDown = true;
    }

    @Override
    public void publish(String channel, String message) {
        if (isShuttingDown)
            return;

        try {
            redisTemplate.convertAndSend(channel, message);
        } catch (Exception e) {
            if (e.getMessage() != null && e.getMessage().contains("LettuceConnectionFactory was destroyed")) {
                this.isShuttingDown = true; // Stop further attempts
                return;
            }
            // Log error but avoid breaking the main application flow
            System.err.println("EventBus [Redis] Publish Error: " + e.getMessage());
        }
    }

    @Override
    public void broadcast(String topic, Object payload) {
        if (isShuttingDown)
            return;

        try {
            String json = objectMapper.writeValueAsString(payload);
            publish(topic, json);
        } catch (JsonProcessingException e) {
            System.err.println("EventBus [Redis] Serialization Error: " + e.getMessage());
        }
    }

    @Override
    public void subscribe(String channel, EventListener callback) {
        // Note: Dynamic subscription in Spring Data Redis usually involves
        // RedisMessageListenerContainer.
        // For now, we rely on static bean configuration (MessageListenerContainer)
        // because dynamic subscription requires more complex lifecycle management.
        System.out.println("EventBus [Redis] Subscription via code not fully implemented yet. Use static beans.");
    }
}
