package com.eduflex.backend.controller;

import com.eduflex.backend.model.CourseMaterial;
import com.eduflex.backend.model.Document;
import com.eduflex.backend.model.Lesson;
import com.eduflex.backend.repository.CourseMaterialRepository;
import com.eduflex.backend.repository.DocumentRepository;
import com.eduflex.backend.repository.LessonRepository;
import com.eduflex.backend.repository.SystemSettingRepository;
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

    @Value("${app.backend.internal-url:http://backend:8080}")
    private String internalBackendUrl;

    private final DocumentRepository documentRepository;
    private final CourseMaterialRepository materialRepository;
    private final LessonRepository lessonRepository;
    private final SystemSettingRepository settingRepository;
    private final ObjectMapper objectMapper;

    public OnlyOfficeController(DocumentRepository documentRepository,
            CourseMaterialRepository materialRepository,
            LessonRepository lessonRepository,
            SystemSettingRepository settingRepository,
            ObjectMapper objectMapper) {
        this.documentRepository = documentRepository;
        this.materialRepository = materialRepository;
        this.lessonRepository = lessonRepository;
        this.settingRepository = settingRepository;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> status = new HashMap<>();
        try {
            String onlyOfficeUrl = settingRepository.findBySettingKey("onlyoffice_url")
                    .map(s -> s.getSettingValue())
                    .orElse("http://localhost:8081");

            if (!onlyOfficeUrl.endsWith("/"))
                onlyOfficeUrl += "/";
            onlyOfficeUrl += "healthcheck";

            URL url = new URI(onlyOfficeUrl).toURL();
            InputStream is = url.openStream();
            is.close();
            status.put("status", "UP");
            status.put("message", "ONLYOFFICE server is reachable at " + onlyOfficeUrl);
        } catch (Exception e) {
            status.put("status", "DOWN");
            status.put("message", "Cannot reach ONLYOFFICE server: " + e.getMessage());
        }
        return ResponseEntity.ok(status);
    }

    @GetMapping("/config/{type}/{id}")
    public ResponseEntity<Map<String, Object>> getConfig(
            @PathVariable String type,
            @PathVariable Long id,
            @RequestParam Long userId) {

        String fileName = "";
        String fileUrl = "";
        String key = "";

        if ("DOCUMENT".equalsIgnoreCase(type)) {
            Document doc = documentRepository.findById(id).orElseThrow();
            fileName = doc.getFileName();
            fileUrl = doc.getFileUrl();
            key = "doc_" + id + "_"
                    + (doc.getUploadedAt() != null ? doc.getUploadedAt().hashCode() : System.currentTimeMillis());
        } else if ("MATERIAL".equalsIgnoreCase(type)) {
            CourseMaterial mat = materialRepository.findById(id).orElseThrow();
            fileName = mat.getFileName() != null ? mat.getFileName() : mat.getTitle();
            fileUrl = mat.getFileUrl();
            key = "mat_" + id + "_"
                    + (mat.getAvailableFrom() != null ? mat.getAvailableFrom().hashCode() : System.currentTimeMillis());
        } else if ("LESSON".equalsIgnoreCase(type)) {
            Lesson lesson = lessonRepository.findById(id).orElseThrow();
            fileName = lesson.getAttachmentName() != null ? lesson.getAttachmentName() : lesson.getTitle();
            fileUrl = lesson.getAttachmentUrl();
            key = "lesson_" + id + "_" + fileName.hashCode();
        }

        Map<String, Object> config = new HashMap<>();
        config.put("documentType", getDocumentType(fileName));

        Map<String, Object> document = new HashMap<>();
        document.put("fileType", getExtension(fileName));
        document.put("key", key);
        document.put("title", fileName);
        document.put("url", internalBackendUrl + "/api/onlyoffice/download/" + type + "/" + id);

        config.put("document", document);

        Map<String, Object> editorConfig = new HashMap<>();
        editorConfig.put("callbackUrl", internalBackendUrl + "/api/onlyoffice/callback/" + type + "/" + id);

        Map<String, Object> user = new HashMap<>();
        user.put("id", userId.toString());
        user.put("name", "User " + userId);
        editorConfig.put("user", user);

        config.put("editorConfig", editorConfig);

        return ResponseEntity.ok(config);
    }

    @GetMapping("/download/{type}/{id}")
    public ResponseEntity<Resource> download(@PathVariable String type, @PathVariable Long id) {
        String fileUrl = "";
        String fileName = "";
        String contentType = "application/octet-stream";

        if ("DOCUMENT".equalsIgnoreCase(type)) {
            Document doc = documentRepository.findById(id).orElseThrow();
            fileUrl = doc.getFileUrl();
            fileName = doc.getFileName();
            contentType = doc.getFileType();
        } else if ("MATERIAL".equalsIgnoreCase(type)) {
            CourseMaterial mat = materialRepository.findById(id).orElseThrow();
            fileUrl = mat.getFileUrl();
            fileName = mat.getFileName() != null ? mat.getFileName() : mat.getTitle();
        } else if ("LESSON".equalsIgnoreCase(type)) {
            Lesson lesson = lessonRepository.findById(id).orElseThrow();
            fileUrl = lesson.getAttachmentUrl();
            fileName = lesson.getAttachmentName();
        }

        try {
            String pathInUploads = fileUrl.replace("/uploads/", "");
            Path filePath = Paths.get(uploadDir).resolve(pathInUploads).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/callback/{type}/{id}")
    public void callback(
            @PathVariable String type,
            @PathVariable Long id,
            HttpServletRequest request,
            HttpServletResponse response) {
        try {
            Scanner scanner = new Scanner(request.getInputStream()).useDelimiter("\\A");
            String body = scanner.hasNext() ? scanner.next() : "";
            Map<String, Object> callBackData = objectMapper.readValue(body, Map.class);

            logger.info("ONLYOFFICE Callback for {} {}: status {}", type, id, callBackData.get("status"));

            if (callBackData.get("status") instanceof Integer && (Integer) callBackData.get("status") == 2) {
                String downloadUrl = (String) callBackData.get("url");
                String fileUrl = "";

                if ("DOCUMENT".equalsIgnoreCase(type)) {
                    Document doc = documentRepository.findById(id).orElseThrow();
                    fileUrl = doc.getFileUrl();
                    saveFileFromUrl(downloadUrl, fileUrl);
                    doc.setSize(Files.size(Paths.get(uploadDir).resolve(fileUrl.replace("/uploads/", ""))));
                    documentRepository.save(doc);
                } else if ("MATERIAL".equalsIgnoreCase(type)) {
                    CourseMaterial mat = materialRepository.findById(id).orElseThrow();
                    fileUrl = mat.getFileUrl();
                    saveFileFromUrl(downloadUrl, fileUrl);
                    materialRepository.save(mat);
                } else if ("LESSON".equalsIgnoreCase(type)) {
                    Lesson lesson = lessonRepository.findById(id).orElseThrow();
                    fileUrl = lesson.getAttachmentUrl();
                    saveFileFromUrl(downloadUrl, fileUrl);
                    lessonRepository.save(lesson);
                }
                logger.info("{} {} updated successfully from ONLYOFFICE callback", type, id);
            }

            response.getWriter().write("{\"error\":0}");
        } catch (Exception e) {
            logger.error("Error processing ONLYOFFICE callback for " + type + " " + id, e);
        }
    }

    private void saveFileFromUrl(String downloadUrl, String fileUrl) throws Exception {
        String fileName = fileUrl.replace("/uploads/", "");
        Path path = Paths.get(uploadDir).resolve(fileName);
        try (InputStream is = new URI(downloadUrl).toURL().openStream()) {
            Files.copy(is, path, StandardCopyOption.REPLACE_EXISTING);
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
        if (fileName == null)
            return "docx";
        int lastIndex = fileName.lastIndexOf('.');
        if (lastIndex == -1)
            return "docx";
        return fileName.substring(lastIndex + 1);
    }
}
