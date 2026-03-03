package com.eduflex.scorm.service;

import com.eduflex.scorm.model.ScormPackage;
import com.eduflex.scorm.repository.ScormPackageRepository;
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
public class ScormService {

    private static final Logger log = LoggerFactory.getLogger(ScormService.class);

    private final ScormPackageRepository scormPackageRepository;
    private final MinioService minioService;
    private final XmlMapper xmlMapper;

    public ScormService(ScormPackageRepository scormPackageRepository, MinioService minioService) {
        this.scormPackageRepository = scormPackageRepository;
        this.minioService = minioService;
        this.xmlMapper = new XmlMapper();
    }

    @Transactional
    public List<ScormPackage> uploadPackages(Long courseId, MultipartFile[] files) throws Exception {
        log.info("Starting SCORM package upload for course {}", courseId);
        List<ScormPackage> savedPackages = new ArrayList<>();

        for (MultipartFile file : files) {
            String packageId = UUID.randomUUID().toString();
            String directoryPath = "scorm/" + packageId + "/";
            byte[] manifestBytes = null;
            byte[] fileBytes = file.getBytes();

            try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(fileBytes))) {
                ZipEntry entry;
                while ((entry = zis.getNextEntry()) != null) {
                    if (!entry.isDirectory()) {
                        String entryName = entry.getName().replace("\\", "/");
                        String contentType = URLConnection.guessContentTypeFromName(entryName);
                        if (contentType == null)
                            contentType = "application/octet-stream";

                        String customId = directoryPath + entryName;

                        if (entryName.equalsIgnoreCase("imsmanifest.xml")) {
                            ByteArrayOutputStream baos = new ByteArrayOutputStream();
                            byte[] buffer = new byte[8192];
                            int len;
                            while ((len = zis.read(buffer)) > 0)
                                baos.write(buffer, 0, len);
                            manifestBytes = baos.toByteArray();
                            minioService.uploadFile(new ByteArrayInputStream(manifestBytes), manifestBytes.length,
                                    customId, contentType);
                        } else {
                            // Extract to temp file or buffer because we need length for
                            // MinioClient.putObject in some versions
                            // In our simplified MinioService we need length. We use a ByteArray for
                            // simplicity as these entries are usually small individually.
                            ByteArrayOutputStream baos = new ByteArrayOutputStream();
                            byte[] buffer = new byte[8192];
                            int len;
                            while ((len = zis.read(buffer)) > 0)
                                baos.write(buffer, 0, len);
                            byte[] currentEntryBytes = baos.toByteArray();
                            minioService.uploadFile(new ByteArrayInputStream(currentEntryBytes),
                                    currentEntryBytes.length, customId, contentType);
                        }
                    }
                    zis.closeEntry();
                }
            }

            String launchFile = identifyLaunchFile(manifestBytes);

            ScormPackage pkg = new ScormPackage();
            pkg.setCourseId(courseId);
            pkg.setTitle(file.getOriginalFilename().replace(".zip", ""));
            pkg.setPackageId(packageId);
            pkg.setDirectoryPath(directoryPath);
            pkg.setLaunchFile(launchFile);
            pkg.setSizeBytes(file.getSize());

            savedPackages.add(scormPackageRepository.save(pkg));
            log.info("Successfully imported SCORM package: {} (Launch: {})", pkg.getTitle(), launchFile);
        }
        return savedPackages;
    }

    private String identifyLaunchFile(byte[] manifestBytes) {
        if (manifestBytes == null || manifestBytes.length == 0)
            return "index.html";
        try {
            JsonNode root = xmlMapper.readTree(manifestBytes);
            JsonNode organizations = root.path("organizations");
            String defaultOrgId = organizations.path("default").asText();
            JsonNode organizationList = organizations.path("organization");

            JsonNode targetOrg = null;
            if (organizationList.isArray()) {
                for (JsonNode org : organizationList) {
                    if (defaultOrgId.isEmpty() || org.path("identifier").asText().equals(defaultOrgId)) {
                        targetOrg = org;
                        break;
                    }
                }
            } else if (!organizationList.isMissingNode()) {
                targetOrg = organizationList;
            }

            if (targetOrg != null) {
                Map<String, String> resourceMap = new HashMap<>();
                JsonNode resources = root.path("resources").path("resource");
                java.util.function.Consumer<JsonNode> mapper = (res) -> {
                    String id = res.path("identifier").asText();
                    String href = res.path("href").asText();
                    if (!id.isEmpty())
                        resourceMap.put(id, href);
                };

                if (resources.isArray()) {
                    for (JsonNode res : resources)
                        mapper.accept(res);
                } else if (!resources.isMissingNode()) {
                    mapper.accept(resources);
                }

                String href = findScoHref(targetOrg, resourceMap);
                if (href != null)
                    return href;
            }
        } catch (Exception e) {
            log.error("Failed to parse imsmanifest.xml", e);
        }
        return "index.html";
    }

    private String findScoHref(JsonNode node, Map<String, String> resourceMap) {
        if (node.has("identifierref")) {
            String ref = node.path("identifierref").asText();
            return resourceMap.get(ref);
        }
        JsonNode items = node.path("item");
        if (items.isArray()) {
            for (JsonNode item : items) {
                String href = findScoHref(item, resourceMap);
                if (href != null)
                    return href;
            }
        } else if (!items.isMissingNode()) {
            return findScoHref(items, resourceMap);
        }
        return null;
    }

    public List<ScormPackage> getPackagesByCourse(Long courseId) {
        return scormPackageRepository.findByCourseId(courseId);
    }

    public ScormPackage getPackage(Long id) {
        return scormPackageRepository.findById(id).orElse(null);
    }

    public void deletePackage(Long id) {
        scormPackageRepository.findById(id).ifPresent(pkg -> {
            scormPackageRepository.delete(pkg);
            // Prefix deletion in MinIO would happen here via MinioService
        });
    }
}
