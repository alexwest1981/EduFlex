package com.eduflex.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MaskingResult {
        private String maskedText;
        private Map<String, String> nameMap; // Placeholder -> Original Name
    }

    /**
     * Masks PII in a string using standard patterns.
     * 
     * @param input The text to mask
     * @return Masked text
     */
    public String maskPii(String input) {
        return maskPii(input, new ArrayList<>()).getMaskedText();
    }

    /**
     * Advanced masking that also takes a list of names to mask literally.
     * 
     * @param input       The text to mask
     * @param namesToMask A list of names (e.g., ["Alex", "Weström"])
     * @return MaskingResult containing the masked text and the mapping
     */
    public MaskingResult maskPii(String input, List<String> namesToMask) {
        if (input == null || input.isEmpty()) {
            return new MaskingResult(input, new HashMap<>());
        }

        String result = input;
        Map<String, String> nameMap = new HashMap<>();

        // 1. Mask Names literally (before regex)
        if (namesToMask != null) {
            int count = 1;
            for (String name : namesToMask) {
                if (name == null || name.length() < 2)
                    continue;
                String placeholder = "[PERSON_" + count + "]";
                if (result.contains(name)) {
                    result = result.replace(name, placeholder);
                    nameMap.put(placeholder, name);
                    count++;
                }
            }
        }

        // 2. Mask Emails
        result = EMAIL_PATTERN.matcher(result).replaceAll("[EMAIL_MASKERAD]");

        // 3. Mask SSN
        result = SSN_PATTERN.matcher(result).replaceAll("[PERSONNUMMER_MASKERAT]");

        // 4. Mask Phone (only if it looks like more than just a simple number in
        // context)
        result = PHONE_PATTERN.matcher(result).replaceAll("[TELEFON_MASKERAT]");

        return new MaskingResult(result, nameMap);
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
