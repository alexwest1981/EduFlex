package com.eduflex.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic"); // For subscribing to events
        config.setApplicationDestinationPrefixes("/app"); // For sending messages to server
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint for log viewer (raw WebSocket)
        registry.addEndpoint("/ws-log")
                .setAllowedOriginPatterns("*");

        // Endpoint for chat overlay (SockJS fallback for browser compatibility)
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}