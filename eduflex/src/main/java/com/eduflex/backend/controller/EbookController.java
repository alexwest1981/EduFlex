package com.eduflex.backend.controller;

import com.eduflex.backend.model.Ebook;
import com.eduflex.backend.service.EbookService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/ebooks")
@CrossOrigin(origins = "*")
public class EbookController {

    private final EbookService ebookService;

    public EbookController(EbookService ebookService) {
        this.ebookService = ebookService;
    }

    @GetMapping
    public List<Ebook> getAll() {
        return ebookService.getAllEbooks();
    }

    @GetMapping("/{id}")
    public Ebook getById(@PathVariable Long id) {
        return ebookService.getEbookById(id);
    }

    @PostMapping("/upload")
    public ResponseEntity<Ebook> upload(
            @RequestParam("title") String title,
            @RequestParam(value = "author", required = false) String author,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "language", required = false) String language,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "cover", required = false) MultipartFile cover) {
        try {
            Ebook saved = ebookService.uploadEbook(title, author, description, category, language, file, cover);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ebook> update(
            @PathVariable Long id,
            @RequestBody Ebook ebookDetails) {
        try {
            Ebook updated = ebookService.updateEbook(id,
                    ebookDetails.getTitle(),
                    ebookDetails.getAuthor(),
                    ebookDetails.getDescription(),
                    ebookDetails.getCategory(),
                    ebookDetails.getLanguage());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        ebookService.deleteEbook(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    public List<Ebook> search(@RequestParam("q") String query) {
        return ebookService.searchEbooks(query);
    }
}
