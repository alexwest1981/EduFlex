package com.eduflex.backend.controller;

import com.eduflex.backend.service.LibrarySearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller för bibliotekssökning via Open Library.
 * Tillgänglig för alla inloggade användare.
 */
@RestController
@RequestMapping("/api/integrations/library")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@Tag(name = "Library Search", description = "Sök böcker via Open Library")
@RequiredArgsConstructor
public class LibrarySearchController {

    private final LibrarySearchService librarySearchService;

    @GetMapping("/search")
    @Operation(summary = "Sök böcker", description = "Söker via Open Library API")
    public ResponseEntity<Map<String, Object>> searchBooks(
            @RequestParam String q,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(librarySearchService.searchBooks(q, limit));
    }

    @GetMapping("/book/{isbn}")
    @Operation(summary = "Bokdetaljer via ISBN")
    public ResponseEntity<Map<String, Object>> getBook(@PathVariable String isbn) {
        return ResponseEntity.ok(librarySearchService.getBookByIsbn(isbn));
    }
}
