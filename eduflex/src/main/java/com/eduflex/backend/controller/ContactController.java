package com.eduflex.backend.controller;

import com.eduflex.backend.service.ContactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/contact")
@Tag(name = "Contact", description = "Public endpoints for demo requests and contact")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping("/demo-request")
    @Operation(summary = "Submit a demo request", description = "Public endpoint for potential customers to request a demo.")
    public ResponseEntity<?> submitDemoRequest(@RequestBody Map<String, String> formData) {
        try {
            contactService.sendDemoRequest(formData);
            return ResponseEntity.ok(Map.of("message", "Request received successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to process request: " + e.getMessage()));
        }
    }
}
