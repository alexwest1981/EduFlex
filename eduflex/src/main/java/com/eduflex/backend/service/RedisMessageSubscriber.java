package com.eduflex.backend.service;

import com.eduflex.backend.model.ChatMessage;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class RedisMessageSubscriber implements MessageListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    public RedisMessageSubscriber(SimpMessagingTemplate messagingTemplate, ObjectMapper objectMapper) {
        this.messagingTemplate = messagingTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            // 1. Deserialisera meddelandet från Redis (JSON)
            ChatMessage chatMessage = objectMapper.readValue(message.getBody(), ChatMessage.class);

            // 2. Skicka till den LOKALA WebSocket-brokern
            // Detta gör att användaren som är ansluten till JUST DENNA server får
            // meddelandet
            messagingTemplate.convertAndSend("/topic/messages/" + chatMessage.getRecipientId(), chatMessage);

            System.out.println("Forwarded Redis message to local websocket: " + chatMessage.getId());

        } catch (IOException e) {
            System.err.println("Failed to handle Redis message: " + e.getMessage());
        }
    }
}
