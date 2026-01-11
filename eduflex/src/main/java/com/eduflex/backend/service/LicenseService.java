package com.eduflex.backend.service;

import com.eduflex.backend.model.LicenseType;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.Base64;
import java.util.Map;

@Service
public class LicenseService {

    private static final String LICENSE_FILE = "eduflex.license";

    private LicenseType currentTier = LicenseType.ENTERPRISE;
    private boolean isValid = false;
    private String customerName = "Okänd";
    private LocalDate expiryDate;
    private java.security.PublicKey publicKey;

    @PostConstruct
    public void init() {
        loadPublicKey();
        validateCurrentLicense();

        // --- DEV OVERRIDE ---
        this.currentTier = LicenseType.ENTERPRISE;
        this.isValid = true;
        System.out.println("🔧 DEV MODE: Forced License Tier to ENTERPRISE");
    }

    private void loadPublicKey() {
        try {
            // Load from classpath (src/main/resources/public.pem)
            byte[] keyBytes = getClass().getResourceAsStream("/public.pem").readAllBytes();
            String keyString = new String(keyBytes, StandardCharsets.UTF_8).trim();

            // Remove headers if present
            keyString = keyString.replace("-----BEGIN PUBLIC KEY-----", "")
                    .replace("-----END PUBLIC KEY-----", "")
                    .replaceAll("\\s", "");

            byte[] decoded = Base64.getDecoder().decode(keyString);
            java.security.spec.X509EncodedKeySpec spec = new java.security.spec.X509EncodedKeySpec(decoded);
            java.security.KeyFactory kf = java.security.KeyFactory.getInstance("RSA");
            this.publicKey = kf.generatePublic(spec);
            System.out.println("✅ Public Key Loaded for Verification");
        } catch (Exception e) {
            System.err.println("❌ ERROR: Could not load public.pem! System will be LOCKED.");
            e.printStackTrace();
            this.isValid = false;
        }
    }

    public void validateCurrentLicense() {
        File file = new File(LICENSE_FILE);
        if (!file.exists()) {
            System.out.println("⚠️  LICENS: Ingen licensfil hittad. Systemet är låst.");
            this.isValid = false;
            return;
        }

        try {
            String licenseKey = Files.readString(Path.of(LICENSE_FILE)).trim();
            verifyLicenseKey(licenseKey);
        } catch (Exception e) {
            System.err.println("❌ LICENS: Kunde inte läsa filen: " + e.getMessage());
            this.isValid = false;
        }
    }

    public boolean verifyLicenseKey(String licenseKey) {
        if (publicKey == null)
            return false;
        try {
            // 1. Avkoda Base64
            String json = new String(Base64.getDecoder().decode(licenseKey));
            ObjectMapper mapper = new ObjectMapper();
            Map<String, String> data = mapper.readValue(json,
                    new com.fasterxml.jackson.core.type.TypeReference<Map<String, String>>() {
                    });

            // 2. Extrahera data
            String payloadBase64 = data.get("payload");
            String signature = data.get("signature");

            // 3. Verifiera signatur med RSA
            java.security.Signature publicSignature = java.security.Signature.getInstance("SHA256withRSA");
            publicSignature.initVerify(publicKey);
            publicSignature.update(new String(Base64.getDecoder().decode(payloadBase64), StandardCharsets.UTF_8)
                    .getBytes(StandardCharsets.UTF_8));

            byte[] signatureBytes = Base64.getDecoder().decode(signature);
            if (!publicSignature.verify(signatureBytes)) {
                throw new RuntimeException("Ogiltig RSA-signatur! Licensen är förfalskad.");
            }

            // 4. Läs payload-innehåll
            String payloadJson = new String(Base64.getDecoder().decode(payloadBase64), StandardCharsets.UTF_8);
            Map<String, String> payloadMap = mapper.readValue(payloadJson,
                    new com.fasterxml.jackson.core.type.TypeReference<Map<String, String>>() {
                    });

            String tierStr = payloadMap.get("tier");
            String expiryStr = payloadMap.get("validUntil");
            this.customerName = payloadMap.get("customer");

            // 5. Kolla datum
            LocalDate expires = LocalDate.parse(expiryStr);
            if (LocalDate.now().isAfter(expires)) {
                throw new RuntimeException("Licensen gick ut den " + expires);
            }

            // 6. Allt OK!
            this.currentTier = LicenseType.valueOf(tierStr.replace("PLUS", "PRO"));
            this.expiryDate = expires;
            this.isValid = true;
            System.out.println("✅ LICENS GODKÄND (RSA): " + currentTier + " för " + customerName);
            return true;

        } catch (Exception e) {
            System.err.println("❌ LICENS NEKAD: " + e.getMessage());
            this.isValid = false;
            return false;
        }
    }

    // Denna metod anropas av Controller för att spara nyckeln
    public void activateLicense(String key) throws Exception {
        if (verifyLicenseKey(key)) {
            Files.writeString(Path.of(LICENSE_FILE), key);
            this.isValid = true;
        } else {
            throw new RuntimeException("Kunde inte verifiera licensen.");
        }
    }

    // Getters med standardiserade namn
    public boolean isValid() {
        return isValid;
    }

    public boolean isLocked() {
        return !isValid;
    }

    public LicenseType getTier() {
        return currentTier;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getExpiryDate() {
        return expiryDate != null ? expiryDate.toString() : "N/A";
    }

    public long getDaysRemaining() {
        if (expiryDate == null)
            return 0;
        return java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), expiryDate);
    }

    public boolean isExpiringSoon() {
        return getDaysRemaining() <= 30; // Varna om under 30 dagar
    }
}