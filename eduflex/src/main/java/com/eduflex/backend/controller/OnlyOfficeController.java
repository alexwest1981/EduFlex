package com.eduflex.backend.controller;

import com.eduflex.backend.model.Document;
import com.eduflex.backend.repository.DocumentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.InputStream;
import java.net.URI;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;

@RestController
@RequestMapping("/api/onlyoffice")
@CrossOrigin(origins = "*")
public class OnlyOfficeController {

    private static final Logger logger = LoggerFactory.getLogger(OnlyOfficeController.class);

    @Value("${file.upload-dir}")
    private String uploadDir;

    // Denna URL används för att ONLYOFFICE-servern ska kunna nå backenden inifrån
    // Docker-nätverket
    @Value("${app.backend.internal-url:http://backend:8080}")
    private String internalBackendUrl;

    private final DocumentRepository documentRepository;
    private final ObjectMapper objectMapper;

    public OnlyOfficeController(DocumentRepository documentRepository, ObjectMapper objectMapper) {
        this.documentRepository = documentRepository;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/config/{id}")
    public ResponseEntity<Map<String, Object>> getConfig(@PathVariable Long id, @RequestParam Long userId) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        Map<String, Object> config = new HashMap<>();
        config.put("documentType", getDocumentType(doc.getFileName()));

        Map<String, Object> document = new HashMap<>();
        document.put("fileType", getExtension(doc.getFileName()));
        // Key måste ändras varje gång filen ändras för att undvika cache-problem
        document.put("key", "doc_" + doc.getId() + "_" + doc.getUploadedAt().hashCode());
        document.put("title", doc.getFileName());
        document.put("url", internalBackendUrl + "/api/onlyoffice/download/" + doc.getId());

        config.put("document", document);

        Map<String, Object> editorConfig = new HashMap<>();
        editorConfig.put("callbackUrl", internalBackendUrl + "/api/onlyoffice/callback?id=" + doc.getId());

        Map<String, Object> user = new HashMap<>();
        user.put("id", userId.toString());
        user.put("name", "User " + userId);
        editorConfig.put("user", user);

        config.put("editorConfig", editorConfig);

        return ResponseEntity.ok(config);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        try {
            String fileName = doc.getFileUrl().replace("/uploads/", "");
            Path filePath = Paths.get(uploadDir).resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(doc.getFileType()))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getFileName() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/callback")
    public void callback(@RequestParam Long id, HttpServletRequest request, HttpServletResponse response) {
        try {
            Scanner scanner = new Scanner(request.getInputStream()).useDelimiter("\\A");
            String body = scanner.hasNext() ? scanner.next() : "";
            Map<String, Object> callBackData = objectMapper.readValue(body, Map.class);

            logger.info("ONLYOFFICE Callback for doc {}: status {}", id, callBackData.get("status"));

            // Status 2 betyder att dokumentet är redo att sparas
            if (callBackData.get("status") instanceof Integer && (Integer) callBackData.get("status") == 2) {
                String downloadUrl = (String) callBackData.get("url");
                Document doc = documentRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Document not found"));

                String fileName = doc.getFileUrl().replace("/uploads/", "");
                Path path = Paths.get(uploadDir).resolve(fileName);

                try (InputStream is = new URI(downloadUrl).toURL().openStream()) {
                    Files.copy(is, path, StandardCopyOption.REPLACE_EXISTING);
                }

                doc.setSize(Files.size(path));
                documentRepository.save(doc);
                logger.info("Document {} updated successfully from ONLYOFFICE callback", id);
            }

            response.getWriter().write("{\"error\":0}");
        } catch (Exception e) {
            logger.error("Error processing ONLYOFFICE callback for doc " + id, e);
        }
    }

    private String getDocumentType(String fileName) {
        String ext = getExtension(fileName).toLowerCase();
        if (ext.equals("docx") || ext.equals("doc") || ext.equals("txt") || ext.equals("odt"))
            return "word";
        if (ext.equals("xlsx") || ext.equals("xls") || ext.equals("csv") || ext.equals("ods"))
            return "cell";
        if (ext.equals("pptx") || ext.equals("ppt") || ext.equals("odp"))
            return "slide";
        return "word";
    }

    private String getExtension(String fileName) {
        int lastIndex = fileName.lastIndexOf('.');
        if (lastIndex == -1)
            return "";
        return fileName.substring(lastIndex + 1);
    }
}
