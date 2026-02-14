package com.eduflex.backend.controller;

import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.model.WellbeingSupportMessage;
import com.eduflex.backend.model.WellbeingSupportRequest;
import com.eduflex.backend.service.WellbeingSupportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wellbeing/requests")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class WellbeingSupportController {

        private final WellbeingSupportService service;
        private final UserRepository userRepository;

        public WellbeingSupportController(WellbeingSupportService service, UserRepository userRepository) {
                this.service = service;
                this.userRepository = userRepository;
        }

        @PostMapping
        @PreAuthorize("hasAnyAuthority('STUDENT', 'ROLE_STUDENT')")
        public ResponseEntity<WellbeingSupportRequest> createRequest(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @RequestBody WellbeingSupportRequest request) {
                User student = userRepository.findByUsername(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                return ResponseEntity.ok(service.createRequest(student, request));
        }

        @GetMapping("/my")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<List<WellbeingSupportRequest>> getMyRequests(
                        @AuthenticationPrincipal UserDetails userDetails) {
                User student = userRepository.findByUsername(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                return ResponseEntity.ok(service.getMyRequests(student.getId()));
        }

        @GetMapping("/inbox")
        @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'HALSOTEAM', 'ROLE_HALSOTEAM')")
        public ResponseEntity<List<WellbeingSupportRequest>> getInbox() {
                return ResponseEntity.ok(service.getInboxRequests());
        }

        @GetMapping("/{id}")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<WellbeingSupportRequest> getRequest(
                        @PathVariable Long id,
                        @AuthenticationPrincipal UserDetails userDetails) {
                User currentUser = userRepository.findByUsername(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                return ResponseEntity.ok(service.getRequest(id, currentUser));
        }

        @PatchMapping("/{id}/status")
        @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'HALSOTEAM', 'ROLE_HALSOTEAM')")
        public ResponseEntity<WellbeingSupportRequest> updateStatus(
                        @PathVariable Long id,
                        @RequestBody Map<String, String> payload,
                        @AuthenticationPrincipal UserDetails userDetails) {
                User staff = userRepository.findByUsername(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                WellbeingSupportRequest.RequestStatus status = WellbeingSupportRequest.RequestStatus
                                .valueOf(payload.get("status"));
                return ResponseEntity.ok(service.updateStatus(id, status, staff));
        }

        @PostMapping("/{id}/messages")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<WellbeingSupportMessage> addMessage(
                        @PathVariable Long id,
                        @RequestBody Map<String, String> payload,
                        @AuthenticationPrincipal UserDetails userDetails) {
                User sender = userRepository.findByUsername(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                return ResponseEntity.ok(service.addMessage(id, payload.get("content"), sender));
        }

        @GetMapping("/{id}/messages")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<List<WellbeingSupportMessage>> getMessages(
                        @PathVariable Long id,
                        @AuthenticationPrincipal UserDetails userDetails) {
                User currentUser = userRepository.findByUsername(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                return ResponseEntity.ok(service.getMessages(id, currentUser));
        }
}
