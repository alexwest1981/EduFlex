package com.eduflex.backend.service;

import com.eduflex.backend.model.ChatMessage;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class RedisMessageSubscriber implements MessageListener, EventBusService.EventListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    public RedisMessageSubscriber(SimpMessagingTemplate messagingTemplate, ObjectMapper objectMapper) {
        this.messagingTemplate = messagingTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public void onMessage(String message) {
        try {
            ChatMessage chatMessage = objectMapper.readValue(message, ChatMessage.class);
            messagingTemplate.convertAndSend("/topic/messages/" + chatMessage.getRecipientId(), chatMessage);
            System.out.println("EventBus [Chat] Forwarded message: " + chatMessage.getId());
        } catch (IOException e) {
            System.err.println("EventBus [Chat] Error: " + e.getMessage());
        }
    }

    @Override
    public void onMessage(Message message, byte[] pattern) {
        onMessage(new String(message.getBody()));
    }
}
