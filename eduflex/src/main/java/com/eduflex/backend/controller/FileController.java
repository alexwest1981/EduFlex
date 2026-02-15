package com.eduflex.backend.controller;

import com.eduflex.backend.service.StorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
public class FileController {

    private final StorageService storageService;

    public FileController(StorageService storageService) {
        this.storageService = storageService;
    }

    /**
     * Unified fetch endpoint for any file in MinIO/Local storage.
     * Handles /api/files/** and /api/storage/**
     * Supports HTTP Range requests for audio/video streaming.
     */
    @GetMapping({ "/api/files/{*fileName}", "/api/storage/{*fileName}" })
    public ResponseEntity<Object> getFile(@PathVariable String fileName,
            @RequestHeader(value = org.springframework.http.HttpHeaders.RANGE, required = false) String rangeHeader) {

        if (fileName == null || fileName.isEmpty() || fileName.equals("/")) {
            return ResponseEntity.badRequest().build();
        }

        // Clean up leading slash from captured path variable
        if (fileName.startsWith("/")) {
            fileName = fileName.substring(1);
        }

        try {
            java.io.InputStream inputStream = storageService.load(fileName);
            byte[] allBytes = inputStream.readAllBytes();

            String contentType = java.net.URLConnection.guessContentTypeFromName(fileName);
            if (contentType == null) {
                String lowerName = fileName.toLowerCase();
                if (lowerName.endsWith(".epub"))
                    contentType = "application/epub+zip";
                else if (lowerName.endsWith(".pdf"))
                    contentType = "application/pdf";
                else if (lowerName.endsWith(".mp3"))
                    contentType = "audio/mpeg";
                else if (lowerName.endsWith(".mp4"))
                    contentType = "video/mp4";
                else
                    contentType = "application/octet-stream";
            }

            if (rangeHeader != null) {
                try {
                    java.util.List<org.springframework.http.HttpRange> ranges = org.springframework.http.HttpRange
                            .parseRanges(rangeHeader);
                    if (!ranges.isEmpty()) {
                        org.springframework.http.HttpRange range = ranges.get(0);
                        long start = range.getRangeStart(allBytes.length);
                        long end = range.getRangeEnd(allBytes.length);
                        long contentLength = end - start + 1;

                        byte[] rangeBytes = new byte[(int) contentLength];
                        System.arraycopy(allBytes, (int) start, rangeBytes, 0, (int) contentLength);

                        return ResponseEntity.status(org.springframework.http.HttpStatus.PARTIAL_CONTENT)
                                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, contentType)
                                .header(org.springframework.http.HttpHeaders.ACCEPT_RANGES, "bytes")
                                .header(org.springframework.http.HttpHeaders.CONTENT_RANGE,
                                        "bytes " + start + "-" + end + "/" + allBytes.length)
                                .header(org.springframework.http.HttpHeaders.CONTENT_LENGTH,
                                        String.valueOf(contentLength))
                                .body(rangeBytes);
                    }
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.status(org.springframework.http.HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                            .build();
                }
            }

            return ResponseEntity.ok()
                    .cacheControl(org.springframework.http.CacheControl.maxAge(365, java.util.concurrent.TimeUnit.DAYS)
                            .cachePublic().immutable())
                    .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                    .header(org.springframework.http.HttpHeaders.ACCEPT_RANGES, "bytes")
                    .header(org.springframework.http.HttpHeaders.CONTENT_LENGTH, String.valueOf(allBytes.length))
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + fileName + "\"")
                    .body(allBytes);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(FileController.class).error("Fetch failed for {}: {}", fileName,
                    e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}
