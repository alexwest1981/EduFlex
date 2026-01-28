package com.eduflex.pdf.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class PdfEventListener {

    private final ObjectMapper objectMapper;
    private final PdfInternalService pdfService;

    public void receiveMessage(String message) {
        log.info("Received <" + message + ">");
        try {
            @SuppressWarnings("unchecked")
            Map<String, String> event = objectMapper.readValue(message, Map.class);
            String action = event.get("action");
            String path = event.get("path");
            String fileId = event.get("fileId");

            if ("PROCESS_PDF".equals(action)) {
                log.info("Processing PDF fileId={} from path={}", fileId, path);
                pdfService.processPdf(fileId, path);
            }
        } catch (IOException e) {
            log.error("Error parsing message", e);
        }
    }
}
