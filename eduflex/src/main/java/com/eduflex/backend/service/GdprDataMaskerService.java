package com.eduflex.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

/**
 * Service for masking and pseudonymizing PII (Personally Identifiable
 * Information).
 * Used to ensure GDPR compliance when sending data to external AI services or
 * generating reports.
 */
@Service
@Slf4j
public class GdprDataMaskerService {

    // Regex for Email
    private static final Pattern EMAIL_PATTERN = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}");

    // Regex for Swedish SSN (Personnummer): YYYYMMDD-XXXX or YYMMDD-XXXX
    private static final Pattern SSN_PATTERN = Pattern.compile("\\b(\\d{2,4}[01]\\d[0-3]\\d[-+]?\\d{4})\\b");

    // Regex for Phone numbers (simple version)
    private static final Pattern PHONE_PATTERN = Pattern
            .compile("(\\b\\+?\\d{1,3}[- ]?)?\\d{2,3}[- ]?\\d{2,3}[- ]?\\d{2,4}\\b");

    /**
     * Masks PII in a string using standard patterns.
     * 
     * @param input The text to mask
     * @return Masked text
     */
    public String maskPii(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }

        String result = input;

        // Mask Emails
        result = EMAIL_PATTERN.matcher(result).replaceAll("[EMAIL_MASKERAD]");

        // Mask SSN
        result = SSN_PATTERN.matcher(result).replaceAll("[PERSONNUMMER_MASKERAT]");

        // Mask Phone (only if it looks like more than just a simple number in context)
        // This is a bit aggressive but safer for GDPR
        result = PHONE_PATTERN.matcher(result).replaceAll("[TELEFON_MASKERAT]");

        return result;
    }

    /**
     * Pseudonymizes a specific piece of data (e.g., a name) with a placeholder.
     * 
     * @param data  The data to mask (e.g., "Alex Weström")
     * @param label The label to use (e.g., "STUDENT")
     * @return The placeholder (e.g., "[STUDENT_NAME]")
     */
    public String pseudonymize(String data, String label) {
        if (data == null || data.isEmpty()) {
            return data;
        }
        return "[" + label.toUpperCase() + "_NAME]";
    }
}
