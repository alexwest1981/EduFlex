package com.eduflex.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * Söker böcker via Open Library API (gratis, ingen API-nyckel).
 * https://openlibrary.org/dev/docs/api/search
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LibrarySearchService {

    private static final String OPEN_LIBRARY_SEARCH = "https://openlibrary.org/search.json";
    private static final String OPEN_LIBRARY_BOOK = "https://openlibrary.org/api/books";

    private final RestTemplate restTemplate;

    /**
     * Söker böcker via Open Library.
     * Returnerar titel, författare, år, ISBN och omslag-URL.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> searchBooks(String query, int limit) {
        try {
            String url = String.format("%s?q=%s&limit=%d&fields=title,author_name,first_publish_year,isbn,cover_i,key",
                    OPEN_LIBRARY_SEARCH,
                    java.net.URLEncoder.encode(query, "UTF-8"),
                    Math.min(limit, 20));

            log.info("📚 Söker böcker: \"{}\"", query);
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response == null) {
                return Map.of("results", List.of(), "totalResults", 0);
            }

            List<Map<String, Object>> docs = (List<Map<String, Object>>) response.getOrDefault("docs", List.of());
            int total = (Integer) response.getOrDefault("numFound", 0);

            // Formatera resultaten snyggt
            List<Map<String, Object>> books = new ArrayList<>();
            for (Map<String, Object> doc : docs) {
                Map<String, Object> book = new HashMap<>();
                book.put("title", doc.getOrDefault("title", "Okänd titel"));

                List<String> authors = (List<String>) doc.get("author_name");
                book.put("author", authors != null && !authors.isEmpty() ? authors.get(0) : "Okänd författare");

                book.put("year", doc.getOrDefault("first_publish_year", null));

                List<String> isbns = (List<String>) doc.get("isbn");
                book.put("isbn", isbns != null && !isbns.isEmpty() ? isbns.get(0) : null);

                // Omslags-URL via Open Library Covers API
                Object coverId = doc.get("cover_i");
                if (coverId != null) {
                    book.put("coverUrl", "https://covers.openlibrary.org/b/id/" + coverId + "-M.jpg");
                }

                book.put("openLibraryUrl", "https://openlibrary.org" + doc.getOrDefault("key", ""));
                books.add(book);
            }

            log.info("📚 Hittade {} böcker för \"{}\"", books.size(), query);

            Map<String, Object> result = new HashMap<>();
            result.put("results", books);
            result.put("totalResults", total);
            result.put("query", query);
            return result;

        } catch (Exception e) {
            log.error("❌ Bibliotekssökning misslyckades: {}", e.getMessage());
            return Map.of("results", List.of(), "totalResults", 0, "error", e.getMessage());
        }
    }

    /**
     * Hämtar detaljer om en bok via ISBN.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getBookByIsbn(String isbn) {
        try {
            String url = String.format("%s?bibkeys=ISBN:%s&format=json&jscmd=data", OPEN_LIBRARY_BOOK, isbn);
            log.info("📖 Hämtar bokdetaljer för ISBN: {}", isbn);

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null || response.isEmpty()) {
                return Map.of("error", "Boken hittades inte");
            }

            // Nyckeln i svaret är "ISBN:xxxxxxxxxx"
            String key = "ISBN:" + isbn;
            if (response.containsKey(key)) {
                return (Map<String, Object>) response.get(key);
            }

            return Map.of("error", "Ingen data för ISBN " + isbn);
        } catch (Exception e) {
            log.error("❌ Kunde inte hämta bok: {}", e.getMessage());
            return Map.of("error", e.getMessage());
        }
    }
}
