package com.eduflex.backend.controller;

import com.eduflex.backend.service.StorageService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.HandlerMapping;

import java.io.InputStream;
import java.net.URLConnection;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import org.springframework.http.CacheControl;

@RestController
@CrossOrigin(origins = "*")
public class StorageController {

    private final StorageService storageService;

    public StorageController(StorageService storageService) {
        this.storageService = storageService;
    }

    /**
     * Unified fetch endpoint for any file in MinIO/Local storage.
     * Handles both /api/storage/{id} and /uploads/{id}
     */
    @GetMapping({ "/api/storage/**", "/uploads/**" })
    public ResponseEntity<Resource> getFile(HttpServletRequest request) {
        String path = (String) request.getAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE);

        String storageId;
        if (path.contains("/api/storage/")) {
            storageId = path.substring(path.indexOf("/api/storage/") + "/api/storage/".length());
        } else if (path.contains("/uploads/")) {
            storageId = path.substring(path.indexOf("/uploads/") + "/uploads/".length());
        } else {
            return ResponseEntity.badRequest().build();
        }

        try {
            InputStream inputStream = storageService.load(storageId);
            InputStreamResource resource = new InputStreamResource(inputStream);

            String fileName = storageId.contains("/") ? storageId.substring(storageId.lastIndexOf("/") + 1) : storageId;
            String contentType = URLConnection.guessContentTypeFromName(fileName);
            if (contentType == null) {
                if (storageId.toLowerCase().endsWith(".epub")) {
                    contentType = "application/epub+zip";
                } else if (storageId.toLowerCase().endsWith(".pdf")) {
                    contentType = "application/pdf";
                } else {
                    contentType = "application/octet-stream";
                }
            }

            return ResponseEntity.ok()
                    .cacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic().immutable())
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Unified upload endpoint (optional, services often have their own wrappers).
     */
    @PostMapping("/api/storage/upload")
    public ResponseEntity<Map<String, String>> upload(@RequestParam("file") MultipartFile file) {
        try {
            String storageId = storageService.save(file);
            return ResponseEntity.ok(Map.of(
                    "storageId", storageId,
                    "url", "/api/storage/" + storageId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
