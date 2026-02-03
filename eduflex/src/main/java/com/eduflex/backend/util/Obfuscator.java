package com.eduflex.backend.util;

import java.util.Base64;
import java.nio.charset.StandardCharsets;

/**
 * Utility for basic string obfuscation to hinder static analysis.
 */
public class Obfuscator {

    /**
     * Decodes an obfuscated string.
     * 
     * @param obfuscated The Base64 encoded string
     * @return The original string
     */
    public static String dec(String obfuscated) {
        if (obfuscated == null)
            return null;
        try {
            return new String(Base64.getDecoder().decode(obfuscated), StandardCharsets.UTF_8);
        } catch (Exception e) {
            return obfuscated; // Fallback if not valid base64
        }
    }

    /**
     * Simple helper to encode (used during dev to generate constants)
     */
    public static String enc(String original) {
        return Base64.getEncoder().encodeToString(original.getBytes(StandardCharsets.UTF_8));
    }
}
