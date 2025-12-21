package com.eduflex.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long senderId;
    private Long recipientId;

    private String senderName;
    private String recipientName;

    @Column(length = 2000)
    private String content;

    private LocalDateTime timestamp;

    // FIX: Ändrat från "boolean" till "Boolean" för att tillåta null från frontend
    @Column(nullable = false)
    private Boolean isRead = false;

    private String type; // TEXT, IMAGE
}