package com.eduflex.backend.service;

import com.eduflex.backend.model.LicenseType;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class LicenseService {

    // VIKTIGT: Byt ut denna mot en slumpmässig sträng i produktion!
    private static final String SECRET_KEY = "SUPER_SECRET_KEY_CHANGE_THIS_IN_PROD";
    private static final String LICENSE_FILE = "eduflex.license";

    private LicenseType currentTier = LicenseType.BASIC;
    private boolean isValid = false;
    private String customerName = "Okänd";
    private LocalDate expiryDate;

    @PostConstruct
    public void init() {
        validateCurrentLicense();
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
        try {
            // 1. Avkoda Base64
            String json = new String(Base64.getDecoder().decode(licenseKey));
            ObjectMapper mapper = new ObjectMapper();
            Map<String, String> data = mapper.readValue(json, Map.class);

            // 2. Extrahera data
            String payload = data.get("payload");
            String signature = data.get("signature");

            // 3. Verifiera signatur (Har någon ändrat i filen?)
            String expectedSignature = hmacSha256(payload);
            if (!expectedSignature.equals(signature)) {
                throw new RuntimeException("Ogiltig signatur!");
            }

            // 4. Läs payload-innehåll
            Map<String, String> payloadMap = mapper.readValue(payload, Map.class);
            String tierStr = payloadMap.get("tier");
            String expiryStr = payloadMap.get("expiry");
            this.customerName = payloadMap.get("customer");

            // 5. Kolla datum
            LocalDate expires = LocalDate.parse(expiryStr);
            if (LocalDate.now().isAfter(expires)) {
                throw new RuntimeException("Licensen gick ut den " + expires);
            }

            // 6. Allt OK!
            this.currentTier = LicenseType.valueOf(tierStr);
            this.expiryDate = expires;
            this.isValid = true;
            System.out.println("✅ LICENS GODKÄND: " + currentTier + " för " + customerName);
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
            this.isValid = true; // Sätt flaggan direkt
        } else {
            throw new RuntimeException("Ogiltig nyckel");
        }
    }

    public String generateLicenseKey(String customer, LicenseType tier, int daysValid) throws Exception {
        Map<String, String> payloadMap = new HashMap<>();
        payloadMap.put("customer", customer);
        payloadMap.put("tier", tier.name());
        payloadMap.put("expiry", LocalDate.now().plusDays(daysValid).toString());

        ObjectMapper mapper = new ObjectMapper();
        String payloadJson = mapper.writeValueAsString(payloadMap);

        String signature = hmacSha256(payloadJson);

        Map<String, String> finalLicense = new HashMap<>();
        finalLicense.put("payload", payloadJson);
        finalLicense.put("signature", signature);

        String finalJson = mapper.writeValueAsString(finalLicense);
        return Base64.getEncoder().encodeToString(finalJson.getBytes());
    }

    private String hmacSha256(String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(SECRET_KEY.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] signedBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(signedBytes);
    }

    // Getters med standardiserade namn
    public boolean isValid() { return isValid; }
    public LicenseType getTier() { return currentTier; }
    public String getCustomerName() { return customerName; }
    public String getExpiryDate() { return expiryDate != null ? expiryDate.toString() : "N/A"; }
}