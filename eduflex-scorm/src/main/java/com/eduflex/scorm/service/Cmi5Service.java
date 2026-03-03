package com.eduflex.scorm.service;

import com.eduflex.scorm.model.Cmi5Package;
import com.eduflex.scorm.repository.Cmi5PackageRepository;
import com.eduflex.scorm.repository.XApiStateRepository;
import com.eduflex.scorm.model.XApiState;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.net.URLConnection;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class Cmi5Service {

    private static final Logger log = LoggerFactory.getLogger(Cmi5Service.class);
    private final Cmi5PackageRepository cmi5PackageRepository;
    private final XApiStateRepository stateRepository;
    private final MinioService minioService;
    private final XmlMapper xmlMapper = new XmlMapper();

    public Cmi5Service(Cmi5PackageRepository cmi5PackageRepository, XApiStateRepository stateRepository,
            MinioService minioService) {
        this.cmi5PackageRepository = cmi5PackageRepository;
        this.stateRepository = stateRepository;
        this.minioService = minioService;
    }

    @Transactional
    public Map<String, Object> importPackage(Long courseId, MultipartFile file) throws IOException {
        String packageId = UUID.randomUUID().toString();
        byte[] bytes = file.getBytes();
        String launchUrl = unzipAndParse(new ByteArrayInputStream(bytes), packageId);

        String title = file.getOriginalFilename().replace(".zip", "");
        String fullUrl = "/api/storage/cmi5/" + packageId + "/" + launchUrl;
        String registration = UUID.randomUUID().toString();

        Cmi5Package pkg = new Cmi5Package();
        pkg.setTitle(title);
        pkg.setPackageId(packageId);
        pkg.setLaunchUrl(fullUrl);
        pkg.setRegistration(registration);
        pkg.setCourseId(courseId);
        pkg.setSizeBytes(file.getSize());
        cmi5PackageRepository.save(pkg);

        Map<String, Object> au = new HashMap<>();
        au.put("id", pkg.getId());
        au.put("packageId", packageId);
        au.put("title", title);
        au.put("url", fullUrl);
        au.put("registration", registration);

        return au;
    }

    private String unzipAndParse(InputStream is, String packageId) throws IOException {
        String launchFile = "index.html";
        byte[] zipBytes = is.readAllBytes();

        try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(zipBytes))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if (!entry.isDirectory()) {
                    String entryName = entry.getName();
                    String contentType = URLConnection.guessContentTypeFromName(entryName);
                    if (contentType == null)
                        contentType = "application/octet-stream";
                    String customId = "cmi5/" + packageId + "/" + entryName;

                    ByteArrayOutputStream baos = new ByteArrayOutputStream();
                    byte[] buffer = new byte[8192];
                    int len;
                    while ((len = zis.read(buffer)) > 0)
                        baos.write(buffer, 0, len);
                    byte[] entryBytes = baos.toByteArray();

                    minioService.uploadFile(new ByteArrayInputStream(entryBytes), entryBytes.length, customId,
                            contentType);
                }
                zis.closeEntry();
            }
        }

        try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(zipBytes))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if (!entry.isDirectory() && entry.getName().endsWith("cmi5.xml")) {
                    launchFile = parseCmi5Xml(zis);
                    break;
                }
                zis.closeEntry();
            }
        }
        return launchFile;
    }

    private String parseCmi5Xml(InputStream is) {
        try {
            JsonNode root = xmlMapper.readTree(is);
            JsonNode auNode = root.path("au");
            if (auNode.isMissingNode())
                auNode = root.path("course").path("au");
            if (!auNode.isMissingNode()) {
                if (auNode.isArray() && auNode.size() > 0)
                    return auNode.get(0).path("url").asText("index.html");
                return auNode.path("url").asText("index.html");
            }
        } catch (Exception e) {
            log.warn("Failed to parse cmi5.xml: {}", e.getMessage());
        }
        return "index.html";
    }

    public void initializeLaunchState(String packageId, String registration, String actorEmail) {
        if (stateRepository.findByActorEmailAndActivityIdAndStateIdAndRegistration(actorEmail, packageId,
                "LMS.LaunchData", registration).isPresent()) {
            return;
        }

        XApiState state = new XApiState(actorEmail, packageId, "LMS.LaunchData", "", registration);
        String launchData = "{\"launchMode\":\"Normal\",\"launchParameters\":\"\",\"moveOn\":\"NotApplicable\",\"masteryScore\":0.8,\"returnURL\":\"\"}";
        state.setStateData(launchData);
        stateRepository.save(state);
    }
}
