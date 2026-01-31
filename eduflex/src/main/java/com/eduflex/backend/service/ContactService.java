package com.eduflex.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.FileWriter;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.util.Map;

@Service
public class ContactService {

    private static final Logger logger = LoggerFactory.getLogger(ContactService.class);

    // JavaMailSender borttagen tillfälligt pga beroendeproblem vid build.
    // Vi använder loggning och fil-dump som fallback så länge.

    public void sendDemoRequest(Map<String, String> formData) {
        String name = formData.get("name");
        String email = formData.get("email");
        String organization = formData.get("organization");
        String phone = formData.get("phone");
        String message = formData.get("message");

        logger.info("Mottog demoförfrågan för: {} ({})", email, name);

        // Logga till standardlogg
        logger.info("DEMO REQUEST DATA: {}", formData);

        // Spara även till en dedikerad loggfil i logs-mappen så admin kan hitta dem
        // enkelt
        try (PrintWriter out = new PrintWriter(new FileWriter("logs/demo_requests.log", true))) {
            out.printf("[%s] NY DEMO-FÖRFRÅGAN\n", LocalDateTime.now());
            out.printf("Namn: %s\n", name);
            out.printf("E-post: %s\n", email);
            out.printf("Organisation: %s\n", organization);
            out.printf("Telefon: %s\n", phone);
            out.printf("Meddelande: %s\n", message);
            out.println("------------------------------------------");
        } catch (Exception e) {
            logger.error("Kunde inte skriva demo-förfrågan till fil: {}", e.getMessage());
        }

        logger.info("Demo-förfrågan sparad på servern. (E-post ej skickad - SMTP ej konfigurerad)");
    }
}
