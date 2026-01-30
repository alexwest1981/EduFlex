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

@RestController
@RequestMapping("/api/storage")
@CrossOrigin(origins = "*")
public class StorageController {

    private final StorageService storageService;

    public StorageController(StorageService storageService) {
        this.storageService = storageService;
    }

    /**
     * Unified fetch endpoint for any file in MinIO/Local storage.
     */
    @GetMapping("/**")
    public ResponseEntity<Resource> getFile(HttpServletRequest request) {
        String path = (String) request.getAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE);
        // Extract the part after /api/storage/
        String storageId = path.substring(path.indexOf("/api/storage/") + "/api/storage/".length());

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
    @PostMapping("/upload")
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
