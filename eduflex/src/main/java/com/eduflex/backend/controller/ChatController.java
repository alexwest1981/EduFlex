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
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.time.LocalDateTime;
import java.util.List;

@Controller
@CrossOrigin(origins = "*")
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;
    private final NotificationRepository notificationRepository;

    @Autowired
    public ChatController(SimpMessagingTemplate messagingTemplate, ChatMessageRepository chatMessageRepository, NotificationRepository notificationRepository) {
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

        // VIKTIGT: Skicka till mottagarens unika kanal
        // Frontend lyssnar på: /topic/messages/{userId}
        messagingTemplate.convertAndSend("/topic/messages/" + chatMessage.getRecipientId(), saved);

        // Skapa notis (så klockan i menyn också lyser upp)
        try {
            Notification n = new Notification();
            n.setUserId(chatMessage.getRecipientId());
            n.setMessage("Nytt meddelande från " + chatMessage.getSenderName());
            n.setType("INFO");
            notificationRepository.save(n);
        } catch (Exception e) {
            System.err.println("Kunde inte skapa notis: " + e.getMessage());
        }
    }

    // --- REST API (Historik) ---
    @GetMapping("/api/messages/{senderId}/{recipientId}")
    public ResponseEntity<List<ChatMessage>> getChatHistory(
            @PathVariable Long senderId,
            @PathVariable Long recipientId) {

        return ResponseEntity.ok(chatMessageRepository.findBySenderIdAndRecipientIdOrSenderIdAndRecipientIdOrderByTimestampAsc(
                senderId, recipientId, recipientId, senderId
        ));
    }
}