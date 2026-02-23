package com.eduflex.backend.controller;

import com.eduflex.backend.model.SupportArticle;
import com.eduflex.backend.service.SupportArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// REST-API för admin-hanterade support-artiklar (FAQ och videoguider)
@RestController
@RequestMapping("/api/support/articles")
public class SupportArticleController {

    @Autowired
    private SupportArticleService service;

    // Alla autentiserade användare kan läsa publicerade artiklar
    @GetMapping("/published")
    public ResponseEntity<List<SupportArticle>> getPublished() {
        return ResponseEntity.ok(service.getPublished());
    }

    // Bara admin ser alla artiklar (oavsett publiceringsstatus)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SupportArticle>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    // Admin skapar ny artikel
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SupportArticle> create(@RequestBody SupportArticle article) {
        return ResponseEntity.ok(service.create(article));
    }

    // Admin uppdaterar befintlig artikel
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SupportArticle> update(@PathVariable Long id, @RequestBody SupportArticle article) {
        return ResponseEntity.ok(service.update(id, article));
    }

    // Admin tar bort en artikel
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
