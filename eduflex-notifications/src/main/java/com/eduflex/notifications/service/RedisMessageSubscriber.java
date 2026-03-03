package com.eduflex.notifications.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class RedisMessageSubscriber {

    private final SimpMessagingTemplate messagingTemplate;

    public RedisMessageSubscriber(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * This method is called by MessageListenerAdapter.
     * It forwards the message from Redis channel to WebSocket topic.
     * 
     * @param message The JSON payload
     * @param channel The Redis channel (which matches the WebSocket topic)
     */
    public void onMessage(String message, String channel) {
        try {
            // Forward directly to the topic defined by the channel name
            messagingTemplate.convertAndSend(channel, message);
            // System.out.println("Forwarded from Redis [" + channel + "] to WebSocket");
        } catch (Exception e) {
            System.err.println("Error forwarding message: " + e.getMessage());
        }
    }
}
