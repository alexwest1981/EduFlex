package com.eduflex.backend.controller;

import com.eduflex.backend.service.StorageService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.HandlerMapping;

import java.io.InputStream;
import java.net.URLConnection;
import java.util.Map;
import java.util.List;
import java.util.concurrent.TimeUnit;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;

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
     * Supports HTTP Range requests for audio/video streaming.
     */
    @GetMapping({ "/api/storage/**", "/uploads/**" })
    public ResponseEntity<Object> getFile(HttpServletRequest request,
            @RequestHeader(value = HttpHeaders.RANGE, required = false) String rangeHeader) {
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
            // We need a ByteArrayResource or FileSystemResource to support Ranges easily
            // with Spring's ResourceRegion
            // but for MinIO we usually read the whole thing if it's small, or use a
            // streaming strategy.
            // For now, let's try a simple approach with ByteRange if possible.

            byte[] allBytes = inputStream.readAllBytes();

            String fileName = storageId.contains("/") ? storageId.substring(storageId.lastIndexOf("/") + 1) : storageId;
            String contentType = URLConnection.guessContentTypeFromName(fileName);
            if (contentType == null) {
                if (storageId.toLowerCase().endsWith(".epub"))
                    contentType = "application/epub+zip";
                else if (storageId.toLowerCase().endsWith(".pdf"))
                    contentType = "application/pdf";
                else if (storageId.toLowerCase().endsWith(".mp3"))
                    contentType = "audio/mpeg";
                else
                    contentType = "application/octet-stream";
            }

            if (rangeHeader != null) {
                try {
                    List<org.springframework.http.HttpRange> ranges = org.springframework.http.HttpRange
                            .parseRanges(rangeHeader);
                    if (!ranges.isEmpty()) {
                        org.springframework.http.HttpRange range = ranges.get(0);
                        long start = range.getRangeStart(allBytes.length);
                        long end = range.getRangeEnd(allBytes.length);
                        long contentLength = end - start + 1;

                        byte[] rangeBytes = new byte[(int) contentLength];
                        System.arraycopy(allBytes, (int) start, rangeBytes, 0, (int) contentLength);

                        return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                                .header(HttpHeaders.CONTENT_TYPE, contentType)
                                .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                                .header(HttpHeaders.CONTENT_RANGE, "bytes " + start + "-" + end + "/" + allBytes.length)
                                .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(contentLength))
                                .body(rangeBytes);
                    }
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE).build();
                }
            }

            return ResponseEntity.ok()
                    .cacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic().immutable())
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(allBytes.length))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                    .body(allBytes);
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
