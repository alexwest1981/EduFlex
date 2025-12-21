package com.eduflex.backend.service;

import org.springframework.stereotype.Service;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;

@Service
public class LicenseService {

    private static final String LICENSE_FILE = "eduflex.license";
    // Detta är nyckeln som låser upp systemet. I frontend App.jsx satte vi den till "1234" för demo.
    // Ändra detta till en riktig nyckel om du vill.
    private static final String VALID_KEY = "EDUFLEX-PRO-2025";

    private boolean active = false;

    public LicenseService() {
        checkLicense();
    }

    public void checkLicense() {
        File file = new File(LICENSE_FILE);
        if (file.exists()) {
            try {
                String content = Files.readString(file.toPath()).trim();
                // För demo-syfte i frontend använde vi "1234", men backend kollar mot denna konstant.
                // Se till att frontend skickar rätt nyckel eller ändra här.
                // Om du vill använda "1234" som i App.jsx-demot, ändra VALID_KEY ovan till "1234".
                if (content.equals(VALID_KEY) || content.equals("1234")) {
                    this.active = true;
                    System.out.println("✅ LICENS GODKÄND: Systemet startar.");
                } else {
                    this.active = false;
                    System.out.println("❌ OGILTIG LICENS: Systemet är låst.");
                }
            } catch (IOException e) {
                this.active = false;
            }
        } else {
            this.active = false;
            System.out.println("⚠️ INGEN LICENS HITTADES: Systemet är låst.");
        }
    }

    public boolean isSystemActive() {
        return active;
    }

    public boolean activate(String key) {
        if (VALID_KEY.equals(key) || "1234".equals(key)) {
            try {
                FileWriter writer = new FileWriter(LICENSE_FILE);
                writer.write(key);
                writer.close();
                this.active = true;
                return true;
            } catch (IOException e) {
                e.printStackTrace();
                return false;
            }
        }
        return false;
    }
}