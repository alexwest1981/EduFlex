package com.eduflex.backend.controller;

import com.eduflex.backend.model.CourseMaterial;
import com.eduflex.backend.model.Document;
import com.eduflex.backend.model.Lesson;
import com.eduflex.backend.repository.CourseMaterialRepository;
import com.eduflex.backend.repository.DocumentRepository;
import com.eduflex.backend.repository.LessonRepository;
import com.eduflex.backend.repository.SystemSettingRepository;
import com.eduflex.backend.service.StorageService;
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

    @Value("${app.backend.internal-url:http://eduflex-backend:8080}")
    private String internalBackendUrl;

    @Value("${app.url:https://www.eduflexlms.se}")
    private String publicAppUrl;

    private final DocumentRepository documentRepository;
    private final CourseMaterialRepository materialRepository;
    private final LessonRepository lessonRepository;
    private final SystemSettingRepository settingRepository;
    private final ObjectMapper objectMapper;
    private final com.eduflex.backend.security.JwtUtils jwtUtils;
    private final StorageService storageService;

    public OnlyOfficeController(DocumentRepository documentRepository,
            CourseMaterialRepository materialRepository,
            LessonRepository lessonRepository,
            SystemSettingRepository settingRepository,
            ObjectMapper objectMapper,
            com.eduflex.backend.security.JwtUtils jwtUtils,
            StorageService storageService) {
        this.documentRepository = documentRepository;
        this.materialRepository = materialRepository;
        this.lessonRepository = lessonRepository;
        this.settingRepository = settingRepository;
        this.objectMapper = objectMapper;
        this.jwtUtils = jwtUtils;
        this.storageService = storageService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> status = new HashMap<>();
        try {
            String onlyOfficeUrl = settingRepository.findBySettingKey("onlyoffice_internal_url")
                    .map(s -> s.getSettingValue())
                    .orElse(settingRepository.findBySettingKey("onlyoffice_url")
                            .map(s -> s.getSettingValue())
                            .orElse("http://onlyoffice-ds"));

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
            @RequestParam(required = false) Long userId,
            HttpServletRequest request) {

        logger.info("[ONLYOFFICE] Config request: {} {} userId={}", type, id, userId);

        String tenantId = request.getHeader("X-Tenant-ID");
        if (tenantId == null)
            tenantId = request.getParameter("tenantId");
        String tenantQuery = (tenantId != null) ? "?tenantId=" + tenantId : "";

        logger.info("[ONLYOFFICE DEBUG] getConfig called for {} {} (Tenant Header: {}, Tenant QueryParam: {})",
                type, id, request.getHeader("X-Tenant-ID"), request.getParameter("tenantId"));
        logger.info("[ONLYOFFICE DEBUG] Tenant Resolved: {}, Final tenantQuery: {}", tenantId, tenantQuery);

        String fileName = "";
        String fileUrl = "";
        String key = "";

        if ("DOCUMENT".equalsIgnoreCase(type)) {
            Document doc = documentRepository.findById(id).orElse(null);
            if (doc == null) {
                logger.error("[ONLYOFFICE] Document not found: {}", id);
                return ResponseEntity.notFound().build();
            }
            fileName = doc.getFileName();
            fileUrl = doc.getFileUrl();
            key = "doc_" + id + "_"
                    + (doc.getUploadedAt() != null ? doc.getUploadedAt().hashCode() : System.currentTimeMillis());
        } else if ("MATERIAL".equalsIgnoreCase(type)) {
            CourseMaterial mat = materialRepository.findById(id).orElse(null);
            if (mat == null) {
                logger.error("[ONLYOFFICE] Material not found: {}", id);
                return ResponseEntity.notFound().build();
            }
            fileName = mat.getFileName() != null ? mat.getFileName() : mat.getTitle();
            fileUrl = mat.getFileUrl();
            key = "mat_" + id + "_"
                    + (mat.getAvailableFrom() != null ? mat.getAvailableFrom().hashCode() : System.currentTimeMillis());
        } else if ("LESSON".equalsIgnoreCase(type)) {
            Lesson lesson = lessonRepository.findById(id).orElse(null);
            if (lesson == null) {
                logger.error("[ONLYOFFICE] Lesson not found: {}", id);
                return ResponseEntity.notFound().build();
            }
            fileName = lesson.getAttachmentName() != null ? lesson.getAttachmentName() : lesson.getTitle();
            fileUrl = lesson.getAttachmentUrl();
            key = "lesson_" + id + "_" + (fileName != null ? fileName.hashCode() : id);
        }

        // Determine Base URL for Client
        String clientBaseUrl = publicAppUrl;
        if (clientBaseUrl == null || clientBaseUrl.isEmpty()) {
            // Fallback: Construct from request (Use X-Forwarded-Proto if present)
            String scheme = request.getHeader("X-Forwarded-Proto");
            if (scheme == null)
                scheme = request.getScheme();

            String host = request.getHeader("X-Forwarded-Host");
            if (host == null)
                host = request.getServerName();

            // Port handling could be complex behind proxies, simplified here:
            // If explicit host header, assume port is implied or standard.
            // If using local dev, might need port.
            // Better to rely on app.url for production!
            clientBaseUrl = scheme + "://" + host;

            // If running strictly local dev without proxy, append port if not 80/443
            if ("localhost".equals(host) || "127.0.0.1".equals(host)) {
                int port = request.getServerPort();
                if (port != 80 && port != 443) {
                    clientBaseUrl += ":" + port;
                }
            }
        }

        // Remove trailing slash if present
        if (clientBaseUrl.endsWith("/")) {
            clientBaseUrl = clientBaseUrl.substring(0, clientBaseUrl.length() - 1);
        }

        Map<String, Object> config = new HashMap<>();
        config.put("documentType", getDocumentType(fileName));

        Map<String, Object> document = new HashMap<>();
        document.put("fileType", getExtension(fileName));
        document.put("key", key);
        document.put("title", fileName);

        // VIKTIGT: Använd den INTERNA backend-URL:en för dokument och callback
        // så att OnlyOffice-containern (i Docker-nätverket) kan nå dem direkt.
        // Detta fixar även "token mismatch" eftersom token nyss signerats med dessa
        // URLer.
        document.put("url", internalBackendUrl + "/api/onlyoffice/download/" + type + "/" + id + tenantQuery);

        config.put("document", document);

        Map<String, Object> editorConfig = new HashMap<>();

        // Samma för Callback - använd intern URL
        editorConfig.put("callbackUrl",
                internalBackendUrl + "/api/onlyoffice/callback/" + type + "/" + id + tenantQuery);

        Map<String, Object> user = new HashMap<>();
        user.put("id", userId.toString());
        user.put("name", "User " + userId);
        editorConfig.put("user", user);

        config.put("editorConfig", editorConfig);

        // Usage of main domain for OnlyOffice (routed via Cloudflare Tunnel paths)
        config.put("documentServerUrl", "https://www.eduflexlms.se");

        // --- SIGN CONFIG WITH JWT ---
        String token = jwtUtils.generateOnlyOfficeToken(config);
        config.put("token", token);
        // -----------------------------

        try {
            logger.info("[ONLYOFFICE DEBUG] Final Config (signed): {}", objectMapper.writeValueAsString(config));
        } catch (Exception e) {
            logger.error("Error logging onlyoffice config", e);
        }

        logger.info("ONLYOFFICE Config generated for {} {} with token", type, id);
        return ResponseEntity.ok(config);
    }

    @GetMapping("/download/{type}/{id}")
    public ResponseEntity<Resource> download(@PathVariable String type, @PathVariable Long id,
            HttpServletRequest request) {
        logger.info("[ONLYOFFICE] Download request for {}/{}", type, id);

        try {
            String fileUrl = "";
            String fileName = "";
            String contentType = "application/octet-stream";

            if ("DOCUMENT".equalsIgnoreCase(type)) {
                Document doc = documentRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Document not found in DB"));
                fileUrl = doc.getFileUrl();
                fileName = doc.getFileName();
                contentType = doc.getFileType();
            } else if ("MATERIAL".equalsIgnoreCase(type)) {
                CourseMaterial mat = materialRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Material not found in DB"));
                fileUrl = mat.getFileUrl();
                fileName = mat.getFileName();
            } else if ("LESSON".equalsIgnoreCase(type)) {
                Lesson lesson = lessonRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Lesson not found in DB"));
                fileUrl = lesson.getAttachmentUrl();
                fileName = lesson.getAttachmentName();
            }

            logger.info("[ONLYOFFICE] Download fileUrl={}, fileName={}", fileUrl, fileName);

            // Hantera både /api/storage/ (MinIO) och /uploads/ (legacy lokal)
            if (fileUrl.startsWith("/api/storage/")) {
                String storageId = fileUrl.replace("/api/storage/", "");
                InputStream inputStream = storageService.load(storageId);
                org.springframework.core.io.InputStreamResource resource =
                        new org.springframework.core.io.InputStreamResource(inputStream);
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                        .body(resource);
            } else {
                // Legacy: /uploads/ sökväg
                String pathInUploads = fileUrl.replace("/uploads/", "");
                Path filePath = Paths.get(uploadDir).resolve(pathInUploads).normalize();

                Resource resource = new UrlResource(filePath.toUri());
                if (resource.exists() && resource.isReadable()) {
                    return ResponseEntity.ok()
                            .contentType(MediaType.parseMediaType(contentType))
                            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                            .body(resource);
                } else {
                    logger.error("[ONLYOFFICE] FILE MISSING at {}", filePath);
                    return ResponseEntity.notFound().build();
                }
            }
        } catch (Exception e) {
            logger.error("[ONLYOFFICE] Download exception: {}", e.getMessage(), e);
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

            String tenant = com.eduflex.backend.config.tenant.TenantContext.getCurrentTenant();
            logger.info("[ONLYOFFICE DEBUG] Callback for {} {}: status {} (Tenant: {})", type, id,
                    callBackData.get("status"), tenant);

            if (callBackData.get("status") instanceof Integer && (Integer) callBackData.get("status") == 2) {
                String downloadUrl = (String) callBackData.get("url");
                String fileUrl = "";

                if ("DOCUMENT".equalsIgnoreCase(type)) {
                    Document doc = documentRepository.findById(id).orElseThrow();
                    fileUrl = doc.getFileUrl();
                    long newSize = saveFileFromUrl(downloadUrl, fileUrl, doc.getFileName());
                    doc.setSize(newSize);
                    documentRepository.save(doc);
                } else if ("MATERIAL".equalsIgnoreCase(type)) {
                    CourseMaterial mat = materialRepository.findById(id).orElseThrow();
                    fileUrl = mat.getFileUrl();
                    saveFileFromUrl(downloadUrl, fileUrl, mat.getFileName());
                    materialRepository.save(mat);
                } else if ("LESSON".equalsIgnoreCase(type)) {
                    Lesson lesson = lessonRepository.findById(id).orElseThrow();
                    fileUrl = lesson.getAttachmentUrl();
                    saveFileFromUrl(downloadUrl, fileUrl, lesson.getAttachmentName());
                    lessonRepository.save(lesson);
                }
                logger.info("{} {} updated successfully from ONLYOFFICE callback", type, id);
            }

            response.getWriter().write("{\"error\":0}");
        } catch (Exception e) {
            logger.error("Error processing ONLYOFFICE callback for " + type + " " + id, e);
        }
    }

    /**
     * Sparar den redigerade filen tillbaka till rätt lagring (MinIO eller lokal disk).
     * Returnerar filstorleken i bytes.
     */
    private long saveFileFromUrl(String downloadUrl, String fileUrl, String originalFileName) throws Exception {
        try (InputStream is = new URI(downloadUrl).toURL().openStream()) {
            byte[] data = is.readAllBytes();

            if (fileUrl.startsWith("/api/storage/")) {
                // MinIO: Skriv över befintlig fil med samma storageId
                String storageId = fileUrl.replace("/api/storage/", "");
                String contentType = "application/octet-stream";
                if (originalFileName != null) {
                    String ext = getExtension(originalFileName).toLowerCase();
                    if (ext.equals("docx")) contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                    else if (ext.equals("xlsx")) contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                    else if (ext.equals("pptx")) contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
                }
                storageService.save(new java.io.ByteArrayInputStream(data), contentType, originalFileName, storageId);
            } else {
                // Legacy: Lokal disk
                String fileName = fileUrl.replace("/uploads/", "");
                Path path = Paths.get(uploadDir).resolve(fileName);
                Files.write(path, data, java.nio.file.StandardOpenOption.CREATE, java.nio.file.StandardOpenOption.TRUNCATE_EXISTING);
            }

            return data.length;
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
