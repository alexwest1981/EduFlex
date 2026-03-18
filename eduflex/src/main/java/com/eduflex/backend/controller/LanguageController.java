package com.eduflex.backend.controller;

import com.eduflex.backend.model.Language;
import com.eduflex.backend.service.LanguageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/languages")
public class LanguageController {

    @Autowired
    private LanguageService languageService;

    public LanguageController() {
    }

    @GetMapping
    public List<Language> getAll() {
        return languageService.getAllLanguages();
    }

    @GetMapping("/enabled")
    public List<Language> getEnabled() {
        return languageService.getEnabledLanguages();
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<Language> addLanguage(@RequestBody Map<String, String> request) {
        Language language = languageService.addLanguage(
                request.get("code"),
                request.get("name"),
                request.get("nativeName"),
                request.get("flagIcon"));
        return ResponseEntity.ok(language);
    }

    @GetMapping("/{code}/translations/{module}")
    public ResponseEntity<String> getTranslations(@PathVariable String code, @PathVariable String module) {
        String json = languageService.getTranslationsFromMinio(code, module);
        if (json == null) {
            // Option: Fallback to filesystem or 404
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .body(json);
    }

    @PutMapping("/{code}/toggle")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<Void> toggle(@PathVariable String code, @RequestBody Map<String, Boolean> request) {
        languageService.toggleLanguage(code, request.get("enabled"));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/sync")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<Void> sync() {
        languageService.syncAllEnabledLanguages();
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{code}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String code) {
        languageService.deleteLanguage(code);
        return ResponseEntity.ok().build();
    }
}
