package com.eduflex.backend.controller;

import com.eduflex.backend.dto.ContactRequest;
import com.eduflex.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/demo-request")
    public ResponseEntity<?> handleDemoRequest(@RequestBody ContactRequest request) {
        try {
            emailService.sendDemoRequestEmail(request);
            return ResponseEntity.ok().body("{\"message\": \"Demo request sent successfully\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"Failed to send demo request\"}");
        }
    }
}
