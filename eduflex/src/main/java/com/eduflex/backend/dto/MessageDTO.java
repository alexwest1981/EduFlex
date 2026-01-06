package com.eduflex.backend.dto;

import java.time.LocalDateTime;

public record MessageDTO(
        Long id,
        Long senderId,
        String senderName,
        Long recipientId,
        String recipientName,
        String subject,
        String content,
        LocalDateTime timestamp,
        boolean isRead
) {}