package com.eduflex.pdf.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.File;

@Service
@Slf4j
public class PdfInternalService {

    private final Tika tika = new Tika();

    @Async
    public void processPdf(String fileId, String filePath) {
        log.info("Starting PDF processing for {}", filePath);

        File inputFile = new File(filePath);
        if (!inputFile.exists()) {
            log.error("File not found: {}", filePath);
            return;
        }

        try {
            // Extract text/metadata
            String type = tika.detect(inputFile);
            log.info("Detected file type: {}", type);

            // Simulating heavy processing (e.g. OCR or splitting)
            // String content = tika.parseToString(inputFile);
            // log.info("Extracted {} chars of text", content.length());

            log.info("PDF processing complete for fileId={}", fileId);

            // TODO: Call back to Core to update DB status / save extracted text

        } catch (Exception e) {
            log.error("PDF Processing failed", e);
        }
    }
}
