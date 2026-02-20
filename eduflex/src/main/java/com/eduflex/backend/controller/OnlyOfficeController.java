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
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.InputStreamResource;
import org.springframework.web.bind.annotation.*;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.*;

@RestController
@RequestMapping("/api/onlyoffice")
@CrossOrigin(origins = "*")
public class OnlyOfficeController {

    private static final Logger logger = LoggerFactory.getLogger(OnlyOfficeController.class);

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${app.backend.internal-url:http://host.docker.internal:8080}")
    private String internalBackendUrl;

    @Value("${app.url:https://www.eduflexlms.se}")
    private String publicAppUrl;

    @Value("${onlyoffice.internal.url:${ONLYOFFICE_URL:http://eduflex-onlyoffice}}")
    private String onlyOfficeInternalUrlProp;

    @Value("${onlyoffice.jwt.secret:S0raknJQXb1gcrvpgkNlpRQW3OyfiR9Q}")
    private String onlyOfficeJwtSecret;

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
        String onlyOfficeUrl = "";
        try {
            onlyOfficeUrl = settingRepository.findBySettingKey("onlyoffice_internal_url")
                    .map(s -> s.getSettingValue())
                    .filter(v -> v != null && !v.isBlank())
                    .orElse(onlyOfficeInternalUrlProp);

            logger.info("[ONLYOFFICE] Checking health at: {}", onlyOfficeUrl);

            if (!onlyOfficeUrl.endsWith("/"))
                onlyOfficeUrl += "/";
            onlyOfficeUrl += "healthcheck";

            URL url = new URI(onlyOfficeUrl).toURL();
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setConnectTimeout(2000);
            int code = conn.getResponseCode();

            status.put("status", code == 200 ? "UP" : "DOWN");
            status.put("message", "ONLYOFFICE server returned " + code + " at " + onlyOfficeUrl);
        } catch (Exception e) {
            status.put("status", "DOWN");
            status.put("message", "Cannot reach ONLYOFFICE server at " + onlyOfficeUrl + ": " + e.getMessage());
            logger.error("[ONLYOFFICE] Health check failed for {}", onlyOfficeUrl, e);
        }
        return ResponseEntity.ok(status);
    }

    @GetMapping("/test-ping")
    public String proxyPing() {
        return "OnlyOffice Proxy is active in OnlyOfficeController";
    }

    @RequestMapping(value = "/proxy/**")
    public void proxyRequest(HttpServletRequest request, HttpServletResponse response) {
        String path = request.getRequestURI();
        String query = request.getQueryString();

        String onlyOfficeUrl = settingRepository.findBySettingKey("onlyoffice_internal_url")
                .map(s -> s.getSettingValue())
                .filter(v -> v != null && !v.isBlank())
                .orElse(onlyOfficeInternalUrlProp);

        if (onlyOfficeUrl.endsWith("/")) {
            onlyOfficeUrl = onlyOfficeUrl.substring(0, onlyOfficeUrl.length() - 1);
        }

        // Standard path is /api/onlyoffice/proxy/...
        String internalPath = path;
        int proxyIndex = internalPath.indexOf("/proxy/");
        if (proxyIndex != -1) {
            internalPath = internalPath.substring(proxyIndex + 6); // skip "/proxy"
        }

        String fullTarget = onlyOfficeUrl + internalPath + (query != null ? "?" + query : "");
        logger.info("[OnlyOfficeProxy] {} {} -> {}", request.getMethod(), path, fullTarget);

        try {
            URL url = new URI(fullTarget).toURL();
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod(request.getMethod());
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(15000);
            connection.setDoInput(true);
            connection.setDoOutput(
                    "POST".equalsIgnoreCase(request.getMethod()) || "PUT".equalsIgnoreCase(request.getMethod()));

            Enumeration<String> headerNames = request.getHeaderNames();
            while (headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                if (headerName.equalsIgnoreCase("Host") || headerName.equalsIgnoreCase("Content-Length")
                        || headerName.equalsIgnoreCase("Transfer-Encoding"))
                    continue;
                connection.setRequestProperty(headerName, request.getHeader(headerName));
            }

            if (connection.getDoOutput()) {
                try (InputStream is = request.getInputStream(); OutputStream os = connection.getOutputStream()) {
                    IOUtils.copy(is, os);
                }
            }

            connection.setRequestProperty("X-Forwarded-Host", request.getServerName());
            connection.setRequestProperty("X-Forwarded-Proto", request.getScheme());

            int responseCode = connection.getResponseCode();
            response.setStatus(responseCode);

            Map<String, List<String>> responseHeaders = connection.getHeaderFields();
            for (Map.Entry<String, List<String>> entry : responseHeaders.entrySet()) {
                if (entry.getKey() != null && !entry.getKey().equalsIgnoreCase("Transfer-Encoding")) {
                    for (String value : entry.getValue()) {
                        response.addHeader(entry.getKey(), value);
                    }
                }
            }

            try (InputStream is = (responseCode >= 400) ? connection.getErrorStream() : connection.getInputStream();
                    OutputStream os = response.getOutputStream()) {
                if (is != null)
                    IOUtils.copy(is, os);
            }
        } catch (Exception e) {
            logger.error("Error proxying to OnlyOffice: {}", fullTarget, e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
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

        String fileName = "";
        String key = "";

        if ("DOCUMENT".equalsIgnoreCase(type)) {
            Document doc = documentRepository.findById(id).orElse(null);
            if (doc == null)
                return ResponseEntity.notFound().build();
            fileName = doc.getFileName();
            key = "doc_" + id + "_"
                    + (doc.getUploadedAt() != null ? doc.getUploadedAt().hashCode() : System.currentTimeMillis());
        } else if ("MATERIAL".equalsIgnoreCase(type)) {
            CourseMaterial mat = materialRepository.findById(id).orElse(null);
            if (mat == null)
                return ResponseEntity.notFound().build();
            fileName = mat.getFileName() != null ? mat.getFileName() : mat.getTitle();
            key = "mat_" + id + "_"
                    + (mat.getAvailableFrom() != null ? mat.getAvailableFrom().hashCode() : System.currentTimeMillis());
        } else if ("LESSON".equalsIgnoreCase(type)) {
            Lesson lesson = lessonRepository.findById(id).orElse(null);
            if (lesson == null)
                return ResponseEntity.notFound().build();
            fileName = lesson.getTitle();
            key = "lesson_" + id + "_"
                    + (lesson.getId() != null ? lesson.getId().hashCode() : System.currentTimeMillis());
        }

        // Use Public URL for download/callback to ensure reachability from Docker container
        // This avoids host.docker.internal issues if DNS is not set up correctly in the container
        String baseUrl = publicAppUrl;

        // Fallback to internal if public is not set (though it should be)
        if (baseUrl == null || baseUrl.isEmpty() || baseUrl.contains("localhost")) {
             baseUrl = internalBackendUrl;
        }

        String downloadUrl = baseUrl + "/api/onlyoffice/download/" + type + "/" + id
                        + (tenantId != null ? "?tenantId=" + tenantId : "");
        String callbackUrl = baseUrl + "/api/onlyoffice/callback/" + type + "/" + id
                        + (tenantId != null ? "?tenantId=" + tenantId : "");

        logger.info("[ONLYOFFICE] Generated URLs - Download: {}, Callback: {}", downloadUrl, callbackUrl);

        Map<String, Object> config = new HashMap<>();
        config.put("document", Map.of(
                "fileType", getExtension(fileName),
                "key", key,
                "title", fileName,
                "url", downloadUrl));

        config.put("documentType", getDocumentType(fileName));
        config.put("editorConfig", Map.of(
                "callbackUrl", callbackUrl,
                "lang", "sv",
                "mode", "edit",
                "user", Map.of("id", userId != null ? userId.toString() : "admin", "name", "User")));

        // Sign the configuration with JWT token for OnlyOffice Security
        String token = jwtUtils.generateOnlyOfficeToken(config, onlyOfficeJwtSecret);
        config.put("token", token);

        return ResponseEntity.ok(config);
    }

    @GetMapping("/download/{type}/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String type, @PathVariable Long id,
            HttpServletRequest request) {
        try {
            logger.info("[ONLYOFFICE] Download request for {} {}", type, id);
            String fileUrl = "";
            String fileName = "";

            if ("DOCUMENT".equalsIgnoreCase(type)) {
                Document doc = documentRepository.findById(id).orElse(null);
                if (doc != null) {
                    fileUrl = doc.getFileUrl();
                    fileName = doc.getFileName();
                } else {
                    logger.warn("[ONLYOFFICE] Document {} not found in database", id);
                }
            } else if ("MATERIAL".equalsIgnoreCase(type)) {
                CourseMaterial mat = materialRepository.findById(id).orElse(null);
                if (mat != null) {
                    fileUrl = mat.getFileUrl();
                    fileName = mat.getFileName();
                } else {
                    logger.warn("[ONLYOFFICE] Material {} not found in database", id);
                }
            }

            if (fileUrl == null || fileUrl.isEmpty()) {
                logger.warn("[ONLYOFFICE] File URL is empty for {} {}", type, id);
                return ResponseEntity.notFound().build();
            }

            logger.info("[ONLYOFFICE] Loading file from storage: storageId={}, fileName={}", fileUrl, fileName);
            InputStream is = storageService.load(fileUrl);
            Resource resource = new InputStreamResource(is);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);
        } catch (Exception e) {
            logger.error("[ONLYOFFICE] Download error for {} {}: {}", type, id, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/callback/{type}/{id}")
    public void callback(@PathVariable String type, @PathVariable Long id, @RequestBody Map<String, Object> body,
            HttpServletResponse response) {
        try {
            logger.info("[ONLYOFFICE] Callback for {} {}: status={}", type, id, body.get("status"));
            Integer status = (Integer) body.get("status");

            if (status == 2 || status == 6) { // 2 = Ready for saving, 6 = Client closed (forced save)
                String downloadUrl = (String) body.get("url");
                if (downloadUrl != null) {
                    URL url = new URL(downloadUrl);
                    Path tempFile = Files.createTempFile("onlyoffice_", getExtension("file"));
                    try (InputStream is = url.openStream()) {
                        Files.copy(is, tempFile, StandardCopyOption.REPLACE_EXISTING);
                    }

                    String fileName = "";
                    if ("DOCUMENT".equalsIgnoreCase(type)) {
                        Document doc = documentRepository.findById(id).orElse(null);
                        if (doc != null)
                            fileName = doc.getFileName();
                    } else if ("MATERIAL".equalsIgnoreCase(type)) {
                        CourseMaterial mat = materialRepository.findById(id).orElse(null);
                        if (mat != null)
                            fileName = mat.getFileName();
                    }

                    storageService.save(tempFile.toUri().toURL().openStream(), "application/octet-stream", fileName);
                    Files.deleteIfExists(tempFile);
                }
            }
            response.getWriter().write("{\"error\":0}");
        } catch (Exception e) {
            logger.error("[ONLYOFFICE] Callback error", e);
            response.setStatus(500);
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
