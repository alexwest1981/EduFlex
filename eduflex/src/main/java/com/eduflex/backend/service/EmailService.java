package com.eduflex.backend.service;

import com.eduflex.backend.dto.ContactRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${eduflex.admin.email:admin@eduflex.se}")
    private String adminEmail;

    @Value("${spring.mail.username:noreply@eduflex.se}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendDemoRequestEmail(ContactRequest request) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(adminEmail);
            message.setSubject("🎯 New Demo Request from " + request.getOrganization());

            String emailBody = String.format(
                    "New demo request received!\n\n" +
                            "Contact Information:\n" +
                            "-------------------\n" +
                            "Name: %s\n" +
                            "Email: %s\n" +
                            "Organization: %s\n" +
                            "Phone: %s\n\n" +
                            "Message:\n" +
                            "-------------------\n" +
                            "%s\n\n" +
                            "-------------------\n" +
                            "Please respond within 24 hours.",
                    request.getName(),
                    request.getEmail(),
                    request.getOrganization(),
                    request.getPhone() != null ? request.getPhone() : "Not provided",
                    request.getMessage() != null ? request.getMessage() : "No additional message");

            message.setText(emailBody);

            mailSender.send(message);
            logger.info("Demo request email sent successfully to {} for organization: {}",
                    adminEmail, request.getOrganization());
        } catch (Exception e) {
            logger.error("Failed to send demo request email", e);
            throw new RuntimeException("Failed to send email notification", e);
        }
    }
}
