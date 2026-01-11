package com.eduflex.backend.service;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.ScormPackage;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.ScormPackageRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import jakarta.annotation.PostConstruct;

import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class ScormService {

    private final ScormPackageRepository scormPackageRepository;
    private final CourseRepository courseRepository;

    // Use a local folder "uploads/scorm" for now. In prod, this could be MinIO/S3.
    @Value("${app.upload.dir:uploads}")
    private String baseUploadDir;

    private Path scormStoragePath;

    public ScormService(ScormPackageRepository scormPackageRepository, CourseRepository courseRepository) {
        this.scormPackageRepository = scormPackageRepository;
        this.courseRepository = courseRepository;
    }

    @PostConstruct
    public void init() {
        this.scormStoragePath = Paths.get(baseUploadDir).resolve("scorm").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.scormStoragePath);
        } catch (Exception e) {
            throw new RuntimeException("Could not create SCORM storage directory", e);
        }
    }

    public ScormPackage uploadPackage(Long courseId, MultipartFile file) throws IOException {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // 1. Create a unique folder for this package
        String folderName = UUID.randomUUID().toString();
        Path targetDir = this.scormStoragePath.resolve(folderName);
        Files.createDirectories(targetDir);

        // 2. Unzip the file
        unzip(file.getInputStream(), targetDir);

        // 3. Detect Launch File (imsmanifest.xml parsing is complex, so we guess common
        // defaults for now)
        String launchFile = detectLaunchFile(targetDir);

        // 4. Save metadata
        ScormPackage scorm = new ScormPackage();
        scorm.setTitle(file.getOriginalFilename().replace(".zip", "")); // Default title from filename
        scorm.setDirectoryPath("scorm/" + folderName + "/"); // Relative path for serving
        scorm.setLaunchFile(launchFile);
        scorm.setCourse(course);
        scorm.setSizeBytes(file.getSize());

        return scormPackageRepository.save(scorm);
    }

    private void unzip(InputStream is, Path targetDir) throws IOException {
        try (ZipInputStream zis = new ZipInputStream(is)) {
            ZipEntry zipEntry = zis.getNextEntry();
            while (zipEntry != null) {
                Path newPath = targetDir.resolve(zipEntry.getName()).normalize();

                // Security check to prevent Zip Slip
                if (!newPath.startsWith(targetDir)) {
                    throw new IOException("Entry is outside of the target dir: " + zipEntry.getName());
                }

                if (zipEntry.isDirectory()) {
                    Files.createDirectories(newPath);
                } else {
                    if (newPath.getParent() != null) {
                        Files.createDirectories(newPath.getParent());
                    }
                    try (OutputStream fos = Files.newOutputStream(newPath)) {
                        byte[] buffer = new byte[1024];
                        int length;
                        while ((length = zis.read(buffer)) > 0) {
                            fos.write(buffer, 0, length);
                        }
                    }
                }
                zipEntry = zis.getNextEntry();
            }
        }
    }

    private String detectLaunchFile(Path dir) {
        // Priority list of common SCORM entry points
        String[] candidates = {
                "index.html",
                "index_lms.html",
                "story.html", // Articulate Storyline
                "launch.html",
                "scormdriver/indexAPI.html" // Rustici
        };

        for (String candidate : candidates) {
            if (Files.exists(dir.resolve(candidate))) {
                return candidate;
            }
        }

        // Advanced: We could parse imsmanifest.xml to find <resource href="...">,
        // but for MVP we fallback to first HTML found or default.
        return "index.html"; // Fallback
    }

    public List<ScormPackage> getPackagesForCourse(Long courseId) {
        return scormPackageRepository.findByCourseId(courseId);
    }
}
