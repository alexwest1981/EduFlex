package com.eduflex.backend.controller;

import com.eduflex.backend.model.PdfTemplate;
import com.eduflex.backend.service.PdfTemplateService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/pdf-templates")
@PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
public class PdfTemplateController {

    private final PdfTemplateService pdfTemplateService;

    public PdfTemplateController(PdfTemplateService pdfTemplateService) {
        this.pdfTemplateService = pdfTemplateService;
    }

    @GetMapping
    public List<PdfTemplate> getAllTemplates() {
        return pdfTemplateService.getAllTemplates();
    }

    @GetMapping("/{id}")
    public PdfTemplate getTemplate(@PathVariable Long id) {
        return pdfTemplateService.getTemplate(id);
    }

    @GetMapping("/active/{type}")
    public ResponseEntity<PdfTemplate> getActiveTemplate(@PathVariable String type) {
        return pdfTemplateService.getActiveTemplate(type)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PutMapping("/{id}")
    public PdfTemplate updateTemplate(@PathVariable Long id, @RequestBody PdfTemplate updates) {
        return pdfTemplateService.updateTemplate(id, updates);
    }

    @PostMapping("/{id}/logo")
    public ResponseEntity<PdfTemplate> uploadLogo(@PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(pdfTemplateService.uploadLogo(id, file));
    }

    @PostMapping("/{id}/background")
    public ResponseEntity<PdfTemplate> uploadBackground(@PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(pdfTemplateService.uploadBackground(id, file));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) {
        pdfTemplateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }
}
