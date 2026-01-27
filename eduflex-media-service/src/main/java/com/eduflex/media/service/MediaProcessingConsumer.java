package com.eduflex.media.service;

import com.eduflex.backend.event.DocumentUploadedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class MediaProcessingConsumer {

    @KafkaListener(topics = "eduflex.documents.uploaded", groupId = "media-processing-group")
    public void handleDocumentUploaded(DocumentUploadedEvent event) {
        log.info("Received document for processing: {} (ID: {})", event.getFileName(), event.getDocumentId());

        // Här lägger vi till logik för:
        // 1. PDF Text Extraction
        // 2. Image resizing
        // 3. Virus scanning (om vi vill)

        try {
            log.info("Processing media for document: {}...", event.getFileName());
            // Simulera arbete
            Thread.sleep(2000);
            log.info("Successfully processed media for document ID: {}", event.getDocumentId());
        } catch (InterruptedException e) {
            log.error("Failed to process media", e);
        }
    }
}
