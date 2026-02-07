package com.eduflex.backend.service;

import com.eduflex.backend.security.JwtUtils;
import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.Cmi5Package;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.net.URLConnection;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import com.fasterxml.jackson.databind.JsonNode;

@Service
public class Cmi5Service {

    private static final Logger logger = LoggerFactory.getLogger(Cmi5Service.class);
    private final JwtUtils jwtUtils;
    private final StorageService storageService;
    private final com.eduflex.backend.repository.Cmi5PackageRepository cmi5PackageRepository;
    private final com.eduflex.backend.repository.CourseRepository courseRepository;
    private final com.eduflex.backend.repository.XApiStateRepository stateRepository;

    public Cmi5Service(JwtUtils jwtUtils, StorageService storageService,
            com.eduflex.backend.repository.Cmi5PackageRepository cmi5PackageRepository,
            com.eduflex.backend.repository.CourseRepository courseRepository,
            com.eduflex.backend.repository.XApiStateRepository stateRepository) {
        this.jwtUtils = jwtUtils;
        this.storageService = storageService;
        this.cmi5PackageRepository = cmi5PackageRepository;
        this.courseRepository = courseRepository;
        this.stateRepository = stateRepository;
    }

    public Map<String, Object> importPackage(Long courseId, MultipartFile file) throws IOException {
        String packageId = UUID.randomUUID().toString();

        // Extract and upload files, and parse cmi5.xml for the launch URL
        byte[] bytes = file.getBytes();
        String launchUrl = unzipAndParse(new ByteArrayInputStream(bytes), packageId);

        String title = file.getOriginalFilename().replace(".zip", "");
        String fullUrl = "/api/storage/cmi5/" + packageId + "/" + launchUrl;
        String registration = UUID.randomUUID().toString();

        // Persist to DB
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Cmi5Package pkg = new Cmi5Package();
        pkg.setTitle(title);
        pkg.setPackageId(packageId);
        pkg.setLaunchUrl(fullUrl);
        pkg.setRegistration(registration);
        pkg.setCourse(course);
        pkg.setSizeBytes(file.getSize());
        cmi5PackageRepository.save(pkg);

        Map<String, Object> au = new HashMap<>();
        au.put("id", pkg.getId()); // Database ID
        au.put("packageId", packageId);
        au.put("title", title);
        au.put("launchMethod", "Popup");
        au.put("url", fullUrl);
        au.put("registration", registration);

        return au;
    }

    public List<Cmi5Package> getByCourseId(Long courseId) {
        return cmi5PackageRepository.findByCourseId(courseId);
    }

    private String unzipAndParse(InputStream is, String packageId) throws IOException {
        String launchFile = "index.html"; // Default fallback
        byte[] zipBytes = is.readAllBytes();

        // First pass: Save all files to storage
        try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(zipBytes))) {
            ZipEntry zipEntry = zis.getNextEntry();
            while (zipEntry != null) {
                if (!zipEntry.isDirectory()) {
                    String entryName = zipEntry.getName();
                    String contentType = URLConnection.guessContentTypeFromName(entryName);
                    String customId = "cmi5/" + packageId + "/" + entryName;
                    storageService.save(new NonClosingInputStream(zis), contentType, entryName, customId);
                }
                zipEntry = zis.getNextEntry();
            }
        }

        // Second pass: Find and parse cmi5.xml
        try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(zipBytes))) {
            ZipEntry zipEntry = zis.getNextEntry();
            while (zipEntry != null) {
                if (!zipEntry.isDirectory() && zipEntry.getName().endsWith("cmi5.xml")) {
                    launchFile = parseCmi5Xml(zis);
                    break;
                }
                zipEntry = zis.getNextEntry();
            }
        }

        return launchFile;
    }

    private String parseCmi5Xml(InputStream is) {
        try {
            XmlMapper xmlMapper = new XmlMapper();
            JsonNode root = xmlMapper.readTree(is);
            // cmi5.xml structure: <course> <au id="..."> <url>launch.html</url> ... </au>
            // </course>
            JsonNode auNode = root.path("au");
            if (auNode.isMissingNode()) {
                auNode = root.path("course").path("au");
            }

            if (!auNode.isMissingNode()) {
                if (auNode.isArray()) {
                    // Multi-AU package, take the first one for now
                    return auNode.get(0).path("url").asText("index.html");
                } else {
                    return auNode.path("url").asText("index.html");
                }
            }
        } catch (Exception e) {
            logger.warn("Failed to parse cmi5.xml: {}", e.getMessage());
        }
        return "index.html";
    }

    private static class NonClosingInputStream extends FilterInputStream {
        public NonClosingInputStream(InputStream in) {
            super(in);
        }

        @Override
        public void close() throws IOException {
        }
    }

    public String generateLrsToken() {
        return jwtUtils.generateJwtToken("xapi-actor");
    }

    public void deletePackage(Long id) {
        Cmi5Package pkg = cmi5PackageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found"));

        if (pkg.getPackageId() != null) {
            // CMI5 files are stored under cmi5/packageId/
            storageService.deleteByPrefix("cmi5/" + pkg.getPackageId() + "/");
        }

        cmi5PackageRepository.delete(pkg);
    }

    public Cmi5Package updatePackage(Long id, String title) {
        Cmi5Package pkg = cmi5PackageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found"));
        pkg.setTitle(title);
        return cmi5PackageRepository.save(pkg);
    }

    public Cmi5Package getPackage(Long id) {
        return cmi5PackageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("CMI5 Package not found"));
    }

    public void initializeLaunchState(String packageId, String registration, String actorEmail) {
        // Check if state already exists to avoid overwriting (though cmi5 says LMS
        // should overwrite for new attempt?)
        // For simple persistent attempt, we only create if missing.
        if (stateRepository.findByActorEmailAndActivityIdAndStateIdAndRegistration(actorEmail, packageId,
                "LMS.LaunchData", registration).isPresent()) {
            return;
        }

        com.eduflex.backend.model.XApiState state = new com.eduflex.backend.model.XApiState();
        state.setActorEmail(actorEmail);
        state.setActivityId(packageId);
        state.setStateId("LMS.LaunchData");
        state.setRegistration(registration);

        // Basic LMS.LaunchData document
        // Return URL is usually where the AU sends the user after exit.
        // We can point to a simple close page or the LMS dashboard.
        String launchData = """
                {
                    "launchMode": "Normal",
                    "launchParameters": "",
                    "moveOn": "NotApplicable",
                    "masteryScore": 0.8,
                    "returnURL": ""
                }
                """;
        state.setStateData(launchData);
        stateRepository.save(state);
    }
}
