package com.eduflex.backend.service;

import com.eduflex.backend.util.RuntimeGuard;
import com.eduflex.backend.util.Obfuscator;
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

    private static final String LICENSE_FILE = Obfuscator.dec("ZWR1ZmxleC5saWNlbnNl");

    private final com.eduflex.backend.repository.PaymentSettingsRepository paymentSettingsRepository;
    private final com.eduflex.backend.repository.LicenseAuditRepository licenseAuditRepository;
    private final org.springframework.core.env.Environment env;

    private com.eduflex.backend.model.LicenseType currentTier = com.eduflex.backend.model.LicenseType.ENTERPRISE;
    private boolean isValid = false;
    private boolean isSystemLocked = false;
    private boolean isOfflineMode = false;
    private String customerName = "Okänd";
    private LocalDate expiryDate;
    private java.security.PublicKey publicKey;

    public LicenseService(com.eduflex.backend.repository.PaymentSettingsRepository paymentSettingsRepository,
            com.eduflex.backend.repository.LicenseAuditRepository licenseAuditRepository,
            org.springframework.core.env.Environment env) {
        this.paymentSettingsRepository = paymentSettingsRepository;
        this.licenseAuditRepository = licenseAuditRepository;
        this.env = env;
        this.isOfflineMode = "true".equalsIgnoreCase(env.getProperty("EDUFLEX_OFFLINE_MODE"));
    }

    @PostConstruct
    public void init() {
        loadPublicKey();
        validateCurrentLicense();
    }

    private void loadPublicKey() {
        try {
            // Load from classpath (src/main/resources/public.pem)
            byte[] keyBytes = getClass().getResourceAsStream(Obfuscator.dec("L3B1YmxpYy5wZW0=")).readAllBytes();
            String keyString = new String(keyBytes, StandardCharsets.UTF_8).trim();

            // Remove headers if present
            keyString = keyString.replace(Obfuscator.dec("LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0="), "")
                    .replace(Obfuscator.dec("LS0tLS1FTkQgUFVCTElDIEtFWS0tLS0t"), "")
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
        // --- ANTI-RE: RUNTIME CHECK ---
        RuntimeGuard.performIntegrityCheck();
        // ------------------------------

        File file = new File(LICENSE_FILE);
        if (!file.exists()) {
            System.out.println("⚠️  LICENS: Ingen licensfil hittad. Systemet är låst.");
            this.isValid = false;
            logAudit("N/A", "LOCKED", "Ingen licensfil hittad");
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
            String payloadBase64 = data.get(Obfuscator.dec("cGF5bG9hZA=="));
            String signature = data.get(Obfuscator.dec("c2lnbmF0dXJl"));

            // 3. Verifiera signatur med RSA
            java.security.Signature publicSignature = java.security.Signature
                    .getInstance(Obfuscator.dec("U0hBMjU2d2l0aFJTQQ=="));
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

            String tierStr = payloadMap.get(Obfuscator.dec("dGllcg=="));
            String expiryStr = payloadMap.get(Obfuscator.dec("dmFsaWRVbnRpbA=="));
            this.customerName = payloadMap.get(Obfuscator.dec("Y3VzdG9tZXI="));

            // 5. Check Expiry
            LocalDate expires = LocalDate.parse(expiryStr);
            if (LocalDate.now().isAfter(expires)) {
                throw new RuntimeException("Licensen gick ut den " + expires);
            }

            // 6. Domain Validation (Anti-Cloning)
            String licensedDomain = payloadMap.get(Obfuscator.dec("ZG9tYWlu"));
            if (licensedDomain != null && !licensedDomain.isBlank()) {
                String systemDomain = getSystemDomain();
                if (systemDomain != null && !systemDomain.contains(licensedDomain)) {
                    throw new RuntimeException("Domän-matchning misslyckades! Licenserad för: " + licensedDomain
                            + " men systemet körs på: " + systemDomain);
                }
            }

            // 7. Success!
            this.currentTier = com.eduflex.backend.model.LicenseType.valueOf(tierStr.replace("PLUS", "PRO"));
            this.expiryDate = expires;
            this.isValid = true;
            System.out.println("✅ LICENS GODKÄND (RSA): " + currentTier + " för " + customerName);
            logAudit(customerName, "VALID", "Hjärtat klappar för: " + currentTier);
            return true;

        } catch (Exception e) {
            System.err.println("❌ LICENS NEKAD: " + e.getMessage());
            this.isValid = false;
            logAudit(customerName, "INVALID", e.getMessage());
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
        return isValid && !isSystemLocked;
    }

    public boolean isLocked() {
        return isSystemLocked || !isValid;
    }

    public void setSystemLocked(boolean locked) {
        this.isSystemLocked = locked;
        if (locked) {
            System.err.println("🚨 SYSTEM LOCK: Licensen har deaktiverats eller är ogiltig.");
        }
    }

    public boolean isOfflineMode() {
        return isOfflineMode;
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
        if (expiryDate == null) {
            // Om ingen expiryDate finns (t.ex. i dev mode), returnera ett stort tal
            return 999;
        }
        return java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), expiryDate);
    }

    public boolean isExpiringSoon() {
        return getDaysRemaining() <= 30; // Varna om under 30 dagar
    }

    private String getSystemDomain() {
        return paymentSettingsRepository.findByIsActiveTrue()
                .map(com.eduflex.backend.model.PaymentSettings::getDomainUrl)
                .orElse(env.getProperty("EDUFLEX_DOMAIN_URL"));
    }

    private void logAudit(String customer, String status, String reason) {
        try {
            String hostname = java.net.InetAddress.getLocalHost().getHostName();
            com.eduflex.backend.model.LicenseAudit audit = new com.eduflex.backend.model.LicenseAudit(
                    customer, status, reason, "LOCAL", hostname);
            licenseAuditRepository.save(audit);
        } catch (Exception e) {
            // Silently fail to not block license logic
        }
    }

    public java.util.List<com.eduflex.backend.model.LicenseAudit> getAuditLogs() {
        return licenseAuditRepository.findTop50ByOrderByTimestampDesc();
    }
}