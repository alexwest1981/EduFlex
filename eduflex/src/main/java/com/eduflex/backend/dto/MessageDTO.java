package com.eduflex.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public record MessageDTO(
        Long id,
        Long senderId,
        String senderName,
        Long recipientId,
        String recipientName,
        String subject,
        String content,
        LocalDateTime timestamp,
        boolean isRead,
        Long folderId,
        String folderName,
        Long parentId,
        List<AttachmentDTO> attachments) {
}