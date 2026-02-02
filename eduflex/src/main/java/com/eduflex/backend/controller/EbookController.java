package com.eduflex.backend.controller;

import com.eduflex.backend.model.Ebook;
import com.eduflex.backend.service.EbookService;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.concurrent.TimeUnit;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ebooks")
@CrossOrigin(origins = "*")
public class EbookController {

    private final EbookService ebookService;

    public EbookController(EbookService ebookService) {
        this.ebookService = ebookService;
    }

    @GetMapping
    public List<Ebook> getAllEbooks() {
        return ebookService.getAllEbooks();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ebook> getEbook(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(ebookService.getEbookById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadEbook(
            @RequestParam("title") String title,
            @RequestParam("author") String author,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            @RequestParam("language") String language,
            @RequestParam(value = "isbn", required = false) String isbn,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "cover", required = false) MultipartFile cover,
            @RequestParam(value = "courseIds", required = false) List<Long> courseIds) {
        try {
            Ebook ebook = ebookService.uploadEbook(title, author, description, category, language, isbn, file, cover,
                    courseIds);
            return ResponseEntity.ok(ebook);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Upload failed: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEbook(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            List<Long> courseIds = null;
            if (payload.get("courseIds") != null) {
                courseIds = ((List<?>) payload.get("courseIds")).stream()
                        .map(obj -> Long.valueOf(obj.toString()))
                        .collect(java.util.stream.Collectors.toList());
            }

            Ebook updatedEbook = ebookService.updateEbook(
                    id,
                    (String) payload.get("title"),
                    (String) payload.get("author"),
                    (String) payload.get("description"),
                    (String) payload.get("category"),
                    (String) payload.get("language"),
                    (String) payload.get("isbn"),
                    courseIds);
            return ResponseEntity.ok(updatedEbook);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Update failed: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEbook(@PathVariable Long id) {
        try {
            ebookService.deleteEbook(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/metadata")
    public ResponseEntity<?> getMetadata(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(ebookService.getEbookMetadata(id));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/page/{pageNumber}")
    public ResponseEntity<byte[]> getPage(@PathVariable Long id, @PathVariable int pageNumber) {
        try {
            byte[] image = ebookService.getEbookPage(id, pageNumber);
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .cacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic().immutable())
                    .body(image);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/cover")
    public ResponseEntity<byte[]> getCover(@PathVariable Long id) {
        try {
            byte[] image = ebookService.getEbookCover(id);
            // Detect content type or default to jpeg
            MediaType mediaType = MediaType.IMAGE_JPEG;
            if (image.length > 3 && image[0] == (byte) 0x89 && image[1] == (byte) 0x50)
                mediaType = MediaType.IMAGE_PNG;

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .cacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic().immutable())
                    .body(image);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/metadata/fetch")
    public ResponseEntity<Map<String, Object>> fetchMetadata(@RequestParam String isbn) {
        try {
            return ResponseEntity.ok(ebookService.fetchMetadataByIsbn(isbn));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/tts")
    public ResponseEntity<byte[]> getTts(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            String text = payload.get("text");
            byte[] audio = ebookService.getTtsForChapter(id, text);
            return ResponseEntity.ok()
                    .contentType(MediaType.valueOf("audio/mpeg"))
                    .body(audio);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
