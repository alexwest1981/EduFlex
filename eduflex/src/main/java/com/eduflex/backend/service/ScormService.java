package com.eduflex.backend.service;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.ScormPackage;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.ScormPackageRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.*;
import java.net.URLConnection;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class ScormService {

    private final ScormPackageRepository scormPackageRepository;
    private final CourseRepository courseRepository;
    private final StorageService storageService;

    public ScormService(ScormPackageRepository scormPackageRepository, CourseRepository courseRepository,
            StorageService storageService) {
        this.scormPackageRepository = scormPackageRepository;
        this.courseRepository = courseRepository;
        this.storageService = storageService;
    }

    public ScormPackage uploadPackage(Long courseId, MultipartFile file) throws IOException {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // 1. Unique folder ID for this package
        String packageId = UUID.randomUUID().toString();

        // 2. Unzip and upload each entry to StorageService
        String launchFile = unzipToStorage(file.getInputStream(), packageId);

        // 3. Save metadata
        ScormPackage scorm = new ScormPackage();
        scorm.setTitle(file.getOriginalFilename().replace(".zip", ""));
        scorm.setDirectoryPath("scorm/" + packageId + "/");
        scorm.setLaunchFile(launchFile);
        scorm.setCourse(course);
        scorm.setSizeBytes(file.getSize());

        return scormPackageRepository.save(scorm);
    }

    private String unzipToStorage(InputStream is, String packageId) throws IOException {
        String launchFile = "index.html"; // Default
        String[] candidates = { "index.html", "index_lms.html", "story.html", "launch.html",
                "scormdriver/indexAPI.html" };
        Set<String> entryNames = new HashSet<>();

        try (ZipInputStream zis = new ZipInputStream(is)) {
            ZipEntry zipEntry = zis.getNextEntry();
            while (zipEntry != null) {
                if (!zipEntry.isDirectory()) {
                    String entryName = zipEntry.getName();
                    entryNames.add(entryName);

                    // Determine content type (simplified)
                    String contentType = URLConnection.guessContentTypeFromName(entryName);
                    if (contentType == null) {
                        if (entryName.endsWith(".html") || entryName.endsWith(".htm"))
                            contentType = "text/html";
                        else if (entryName.endsWith(".js"))
                            contentType = "application/javascript";
                        else if (entryName.endsWith(".css"))
                            contentType = "text/css";
                        else if (entryName.endsWith(".xml"))
                            contentType = "application/xml";
                        else
                            contentType = "application/octet-stream";
                    }

                    // Save to storage with path: scorm/packageId/entryName
                    String customId = "scorm/" + packageId + "/" + entryName;

                    // We need to wrap zis to avoid closing it
                    storageService.save(new NonClosingInputStream(zis), contentType, entryName, customId);
                }
                zipEntry = zis.getNextEntry();
            }
        }

        // Detect launch file
        for (String candidate : candidates) {
            if (entryNames.contains(candidate)) {
                launchFile = candidate;
                break;
            }
        }

        return launchFile;
    }

    // Helper class to prevent ZipInputStream from being closed by StorageService
    private static class NonClosingInputStream extends FilterInputStream {
        public NonClosingInputStream(InputStream in) {
            super(in);
        }

        @Override
        public void close() throws IOException {
            // Do nothing
        }
    }

    public List<ScormPackage> getPackagesForCourse(Long courseId) {
        return scormPackageRepository.findByCourseId(courseId);
    }
}
