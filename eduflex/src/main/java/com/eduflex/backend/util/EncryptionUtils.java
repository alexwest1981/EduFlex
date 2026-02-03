package com.eduflex.backend.util;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Utility for AES-GCM encryption/decryption of sensitive database fields.
 */
public class EncryptionUtils {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int TAG_LENGTH_BIT = 128;
    private static final int IV_LENGTH_BYTE = 12;
    private static final String DEFAULT_SECRET = "EduFlexSup3rS3cur3K3y123456789012"; // 32 chars for AES-256

    private static final byte[] key;

    static {
        String secret = System.getenv("ENCRYPTION_SECRET");
        if (secret == null || secret.length() < 32) {
            secret = DEFAULT_SECRET;
        }
        key = secret.substring(0, 32).getBytes(StandardCharsets.UTF_8);
    }

    public static String encrypt(String strToEncrypt) {
        if (strToEncrypt == null)
            return null;
        try {
            byte[] iv = new byte[IV_LENGTH_BYTE];
            new SecureRandom().nextBytes(iv);

            final Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(TAG_LENGTH_BIT, iv);
            cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(key, "AES"), parameterSpec);

            byte[] cipherText = cipher.doFinal(strToEncrypt.getBytes(StandardCharsets.UTF_8));

            ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + cipherText.length);
            byteBuffer.put(iv);
            byteBuffer.put(cipherText);

            return Base64.getEncoder().encodeToString(byteBuffer.array());
        } catch (Exception e) {
            System.err.println("Encryption error: " + e.getMessage());
            return strToEncrypt; // Fallback to original if encryption fails
        }
    }

    public static String decrypt(String strToDecrypt) {
        if (strToDecrypt == null)
            return null;
        try {
            byte[] decode = Base64.getDecoder().decode(strToDecrypt);
            ByteBuffer byteBuffer = ByteBuffer.wrap(decode);

            byte[] iv = new byte[IV_LENGTH_BYTE];
            byteBuffer.get(iv);

            byte[] cipherText = new byte[byteBuffer.remaining()];
            byteBuffer.get(cipherText);

            final Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(key, "AES"), new GCMParameterSpec(TAG_LENGTH_BIT, iv));

            return new String(cipher.doFinal(cipherText), StandardCharsets.UTF_8);
        } catch (Exception e) {
            // If decryption fails, it might be plain text from before encryption was
            // enabled
            return strToDecrypt;
        }
    }
}
