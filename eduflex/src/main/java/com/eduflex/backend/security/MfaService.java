package com.eduflex.backend.security;

import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import com.warrenstrange.googleauth.GoogleAuthenticatorQRGenerator;
import org.springframework.stereotype.Service;

/**
 * Service for Multi-Factor Authentication (MFA) using TOTP.
 * Compatible with Google Authenticator, Authy, etc.
 */
@Service
public class MfaService {

    private final GoogleAuthenticator gAuth = new GoogleAuthenticator();

    /**
     * Generates a new MFA secret for a user.
     * 
     * @return A GoogleAuthenticatorKey object containing the secret.
     */
    public GoogleAuthenticatorKey generateSecret() {
        return gAuth.createCredentials();
    }

    /**
     * Generates a QR code URL for the user to scan.
     * 
     * @param userEmail The user's email or username.
     * @param key       The GoogleAuthenticatorKey generated for the user.
     * @return A URL for the QR code image.
     */
    public String getQrCodeUrl(String userEmail, GoogleAuthenticatorKey key) {
        return GoogleAuthenticatorQRGenerator.getOtpAuthURL("EduFlex", userEmail, key);
    }

    /**
     * Verifies that the provided code matches the secret.
     * 
     * @param secret The user's stored MFA secret.
     * @param code   The code entered by the user.
     * @return true if the code is valid, false otherwise.
     */
    public boolean verifyCode(String secret, int code) {
        return gAuth.authorize(secret, code);
    }
}
