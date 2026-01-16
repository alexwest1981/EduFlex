package com.eduflex.backend.controller;

import com.eduflex.backend.model.ChatMessage;
import com.eduflex.backend.model.Notification;
import com.eduflex.backend.repository.ChatMessageRepository;
import com.eduflex.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

import java.time.LocalDateTime;
import java.util.List;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;
    private final NotificationRepository notificationRepository;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private org.springframework.data.redis.core.RedisTemplate<String, Object> redisTemplate;

    @Autowired
    public ChatController(SimpMessagingTemplate messagingTemplate, ChatMessageRepository chatMessageRepository,
            NotificationRepository notificationRepository) {
        this.messagingTemplate = messagingTemplate;
        this.chatMessageRepository = chatMessageRepository;
        this.notificationRepository = notificationRepository;
    }

    // --- WEBSOCKET (Realtid) ---
    @MessageMapping("/chat")
    public void processMessage(@Payload ChatMessage chatMessage) {
        // Sätt tidsstämpel och status
        chatMessage.setTimestamp(LocalDateTime.now());
        if (chatMessage.getIsRead() == null) {
            chatMessage.setIsRead(false);
        }

        // Spara i databasen
        ChatMessage saved = chatMessageRepository.save(chatMessage);

        // VIKTIGT: Publicera till Redis Topic istället för direkt till klient
        // Alla instanser som lyssnar på denna topic kommer att ta emot meddelandet via
        // RedisMessageSubscriber
        if (redisTemplate != null) {
            redisTemplate.convertAndSend("chat.topic", saved);
        } else {
            // Fallback if Redis is disabled (e.g. single instance mode)
            messagingTemplate.convertAndSend("/topic/public", saved);
        }

        // Skapa notis (så klockan i menyn också lyser upp)
        try {
            Notification n = new Notification();
            n.setUserId(chatMessage.getRecipientId());
            n.setMessage("Nytt meddelande från " + chatMessage.getSenderName());
            n.setType("INFO");
            notificationRepository.save(n);
            // TODO: Publicera även notisen via Redis om vi vill att den ska vara realtid
            // över kluster
        } catch (Exception e) {
            System.err.println("Kunde inte skapa notis: " + e.getMessage());
        }
    }

    // --- REST API (Historik) ---
    @GetMapping("/api/messages/{senderId}/{recipientId}")
    public ResponseEntity<Page<ChatMessage>> getChatHistory(
            @PathVariable Long senderId,
            @PathVariable Long recipientId,
            @PageableDefault(size = 20, sort = "timestamp", direction = Sort.Direction.DESC) Pageable pageable) {

        return ResponseEntity
                .ok(chatMessageRepository.findBySenderIdAndRecipientIdOrSenderIdAndRecipientIdOrderByTimestampDesc(
                        senderId, recipientId, recipientId, senderId, pageable));
    }
}