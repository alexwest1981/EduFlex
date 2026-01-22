package com.eduflex.backend.dto;

public record AttachmentDTO(
        Long id,
        String fileName,
        String fileType,
        String fileUrl) {
}
