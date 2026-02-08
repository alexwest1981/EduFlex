package com.eduflex.backend.controller;

import com.eduflex.backend.service.StorageService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.InputStream;
import java.net.URLConnection;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileController {

    private final StorageService storageService;

    public FileController(StorageService storageService) {
        this.storageService = storageService;
    }

    @GetMapping("/{fileName:.+}")
    public ResponseEntity<Resource> getFile(@PathVariable String fileName) {
        try {
            InputStream inputStream = storageService.load(fileName);
            InputStreamResource resource = new InputStreamResource(inputStream);

            String contentType = URLConnection.guessContentTypeFromName(fileName);
            if (contentType == null) {
                if (fileName.toLowerCase().endsWith(".epub")) {
                    contentType = "application/epub+zip";
                } else if (fileName.toLowerCase().endsWith(".pdf")) {
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
            System.err.println("FileController: Error serving file " + fileName + ": " + e.getMessage());
            // It might be useful to try fallback locations if we suspect split-brain
            return ResponseEntity.notFound().build();
        }
    }
}
