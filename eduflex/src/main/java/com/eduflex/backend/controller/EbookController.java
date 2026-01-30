package com.eduflex.backend.controller;

import com.eduflex.backend.model.Ebook;
import com.eduflex.backend.service.EbookService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;

@RestController
@RequestMapping("/api/ebooks")
@CrossOrigin(origins = "*")
public class EbookController {

    private final EbookService ebookService;
    private final com.eduflex.backend.service.reader.BookReaderService bookReaderService;

    public EbookController(EbookService ebookService,
            com.eduflex.backend.service.reader.BookReaderService bookReaderService) {
        this.ebookService = ebookService;
        this.bookReaderService = bookReaderService;
    }

    @GetMapping("/{id}/metadata")
    public ResponseEntity<com.eduflex.backend.dto.BookMetadataDto> getMetadata(@PathVariable Long id) {
        Ebook ebook = ebookService.getEbookById(id);
        try (com.eduflex.backend.service.reader.BookContent content = bookReaderService.loadBook(ebook.getFileUrl())) {
            return ResponseEntity.ok(new com.eduflex.backend.dto.BookMetadataDto(
                    content.getTitle(),
                    content.getAuthor(),
                    content.getPageCount(),
                    content.getChapters(),
                    content.getCoverImage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{id}/page/{pageNumber}")
    public ResponseEntity<org.springframework.core.io.Resource> getPageImage(
            @PathVariable Long id,
            @PathVariable int pageNumber) {
        Ebook ebook = ebookService.getEbookById(id);
        try (com.eduflex.backend.service.reader.BookContent content = bookReaderService.loadBook(ebook.getFileUrl())) {
            InputStream is = content.getPageImage(pageNumber);
            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.IMAGE_PNG)
                    .body(new org.springframework.core.io.InputStreamResource(is));
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
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
