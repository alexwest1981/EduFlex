package com.eduflex.backend.controller;

import com.eduflex.backend.model.Certification;
import com.eduflex.backend.service.CertificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/certifications")
public class CertificationController {

    private final CertificationService certificationService;

    public CertificationController(CertificationService certificationService) {
        this.certificationService = certificationService;
    }

    @GetMapping("/my")
    public List<Certification> getMyCertifications() {
        // Assume context user lookup happens in a helper or through ID
        // Simplified for now
        return certificationService.getAllCertifications();
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RESELLER')")
    public List<Certification> getAllCertifications() {
        return certificationService.getAllCertifications();
    }

    @PostMapping("/admin/issue")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RESELLER')")
    public ResponseEntity<Certification> issueCertification(
            @RequestParam Long userId,
            @RequestParam Long courseId,
            @RequestParam(required = false) Integer validityMonths) {
        return ResponseEntity.ok(certificationService.issueCertification(userId, courseId, validityMonths));
    }

    @PostMapping("/admin/refresh-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> refreshStatuses() {
        certificationService.updateCertificationStatuses();
        return ResponseEntity.ok().build();
    }
}
