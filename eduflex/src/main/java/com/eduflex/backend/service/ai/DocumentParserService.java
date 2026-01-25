package com.eduflex.backend.service.ai;

import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

/**
 * Service for extracting text content from documents (PDF, DOCX, TXT, etc.)
 * using Apache Tika.
 */
@Service
public class DocumentParserService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentParserService.class);

    private final Tika tika = new Tika();

    @Value("${ai.quiz.max-document-chars:50000}")
    private int maxDocumentChars;

    /**
     * Extracts text content from a MultipartFile.
     * Supports PDF, DOCX, DOC, TXT, and other common formats.
     *
     * @param file The uploaded file
     * @return Extracted text content, truncated to maxDocumentChars
     * @throws IOException If file cannot be read
     */
    public String extractText(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be null or empty");
        }

        String filename = file.getOriginalFilename();
        logger.info("Extracting text from file: {} (size: {} bytes)", filename, file.getSize());

        try (InputStream inputStream = file.getInputStream()) {
            String extractedText = tika.parseToString(inputStream);

            // Clean and normalize the text
            extractedText = cleanText(extractedText);

            // Truncate if necessary
            if (extractedText.length() > maxDocumentChars) {
                logger.info("Truncating text from {} to {} characters", extractedText.length(), maxDocumentChars);
                extractedText = extractedText.substring(0, maxDocumentChars);
            }

            logger.info("Successfully extracted {} characters from {}", extractedText.length(), filename);
            return extractedText;

        } catch (TikaException e) {
            logger.error("Failed to parse document: {}", filename, e);
            throw new IOException("Failed to parse document: " + e.getMessage(), e);
        }
    }

    /**
     * Extracts text from an InputStream.
     *
     * @param inputStream The input stream to read from
     * @param filename    Original filename for logging
     * @return Extracted text content
     * @throws IOException If stream cannot be read
     */
    public String extractText(InputStream inputStream, String filename) throws IOException {
        logger.info("Extracting text from stream: {}", filename);

        try {
            String extractedText = tika.parseToString(inputStream);
            extractedText = cleanText(extractedText);

            if (extractedText.length() > maxDocumentChars) {
                extractedText = extractedText.substring(0, maxDocumentChars);
            }

            return extractedText;

        } catch (TikaException e) {
            logger.error("Failed to parse document stream: {}", filename, e);
            throw new IOException("Failed to parse document: " + e.getMessage(), e);
        }
    }

    /**
     * Validates that the file is a supported document type.
     *
     * @param file The file to validate
     * @return true if the file type is supported
     */
    public boolean isSupportedFileType(MultipartFile file) {
        if (file == null || file.getOriginalFilename() == null) {
            return false;
        }

        String filename = file.getOriginalFilename().toLowerCase();
        return filename.endsWith(".pdf") ||
               filename.endsWith(".docx") ||
               filename.endsWith(".doc") ||
               filename.endsWith(".txt") ||
               filename.endsWith(".rtf") ||
               filename.endsWith(".odt");
    }

    /**
     * Gets the maximum allowed document size in characters.
     *
     * @return Maximum character count
     */
    public int getMaxDocumentChars() {
        return maxDocumentChars;
    }

    /**
     * Cleans and normalizes extracted text.
     * Removes excessive whitespace, normalizes line endings.
     */
    private String cleanText(String text) {
        if (text == null) {
            return "";
        }

        // Normalize line endings
        text = text.replaceAll("\\r\\n", "\n");
        text = text.replaceAll("\\r", "\n");

        // Remove excessive whitespace (more than 2 consecutive newlines)
        text = text.replaceAll("\n{3,}", "\n\n");

        // Remove excessive spaces
        text = text.replaceAll(" {3,}", "  ");

        // Trim leading and trailing whitespace
        text = text.trim();

        return text;
    }
}
