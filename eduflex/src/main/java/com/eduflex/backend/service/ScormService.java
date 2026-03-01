package com.eduflex.backend.service;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.ScormPackage;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.ScormPackageRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.net.URLConnection;
import java.time.LocalDateTime;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class ScormService {

    private static final Logger logger = LoggerFactory.getLogger(ScormService.class);
    private final ScormPackageRepository scormPackageRepository;
    private final CourseRepository courseRepository;
    private final StorageService storageService;

    public ScormService(com.eduflex.backend.repository.ScormPackageRepository scormPackageRepository,
            CourseRepository courseRepository,
            StorageService storageService) {
        this.scormPackageRepository = scormPackageRepository;
        this.courseRepository = courseRepository;
        this.storageService = storageService;
    }

    @Transactional
    public List<ScormPackage> uploadPackages(Long courseId, MultipartFile[] files) throws Exception {
        logger.info("Starting SCORM package upload for course {}", courseId);
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new RuntimeException("Course not found"));
        List<ScormPackage> savedPackages = new ArrayList<>();

        for (MultipartFile file : files) {
            String originalFilename = file.getOriginalFilename();
            logger.debug("Processing file: {} (Size: {} bytes)", originalFilename, file.getSize());

            String packageId = UUID.randomUUID().toString();
            String directoryPath = "scorm/" + packageId + "/";

            byte[] manifestBytes = null;

            // Use a byte array to allow two passes or use a clever single pass
            // Given SCORM packages can be large, we'll stream as much as possible.
            byte[] fileBytes = file.getBytes();

            // Pass 1: Extract all files to MinIO
            int fileCount = 0;
            try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(fileBytes))) {
                ZipEntry entry;
                while ((entry = zis.getNextEntry()) != null) {
                    if (!entry.isDirectory()) {
                        fileCount++;
                        // Normalize backslashes for Windows-zipped packages
                        String entryName = entry.getName().replace("\\", "/");
                        String contentType = URLConnection.guessContentTypeFromName(entryName);
                        if (contentType == null)
                            contentType = "application/octet-stream";

                        String customId = directoryPath + entryName;

                        // If it's the manifest, we need to read it for parsing later
                        if (entryName.equalsIgnoreCase("imsmanifest.xml")) {
                            logger.debug("Found imsmanifest.xml in package {}", originalFilename);
                            ByteArrayOutputStream baos = new ByteArrayOutputStream();
                            byte[] buffer = new byte[8192];
                            int len;
                            while ((len = zis.read(buffer)) > 0) {
                                baos.write(buffer, 0, len);
                            }
                            manifestBytes = baos.toByteArray();
                            // Upload the manifest we just read
                            storageService.save(new ByteArrayInputStream(manifestBytes), contentType, entryName,
                                    customId);
                        } else {
                            // Direct streaming upload to MinIO
                            storageService.save(new NonClosingInputStream(zis), contentType, entryName, customId);
                            // Note: we can't easily get the size from zis without reading it,
                        }
                    }
                    zis.closeEntry();
                }
            }
            logger.debug("Extracted {} files for package {}", fileCount, originalFilename);

            // Pass 2: Identify launch file from manifest bytes
            String launchFile = identifyLaunchFile(manifestBytes, directoryPath);
            logger.info("Identified launch file for {}: {}", originalFilename, launchFile);

            ScormPackage pkg = new ScormPackage();
            pkg.setCourse(course);
            pkg.setTitle(file.getOriginalFilename().replace(".zip", ""));
            pkg.setPackageId(packageId);
            pkg.setDirectoryPath(directoryPath);
            pkg.setLaunchFile(launchFile);
            pkg.setSizeBytes(file.getSize()); // Use original file size
            pkg.setUploadedAt(LocalDateTime.now());

            savedPackages.add(scormPackageRepository.save(pkg));
            logger.info("Successfully imported SCORM package to MinIO: {} (Launch: {})", pkg.getTitle(), launchFile);
        }
        return savedPackages;
    }

    private String identifyLaunchFile(byte[] manifestBytes, String directoryPath) {
        if (manifestBytes == null || manifestBytes.length == 0) {
            logger.warn("No imsmanifest.xml provided for manifest parsing. Defaulting to index.html");
            return "index.html";
        }

        try {
            XmlMapper xmlMapper = new XmlMapper();
            JsonNode root = xmlMapper.readTree(manifestBytes);

            // 1. Find the default organization
            JsonNode organizations = root.path("organizations");
            String defaultOrgId = organizations.path("default").asText();
            JsonNode organizationList = organizations.path("organization");

            logger.debug("Parsing manifest. Default Org ID: {}", defaultOrgId);

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

            if (targetOrg == null && organizationList.isArray() && organizationList.size() > 0) {
                targetOrg = organizationList.get(0);
            }

            if (targetOrg != null) {
                // 2. Find all resources and their properties
                Map<String, ScormResource> resourceMap = new HashMap<>();
                JsonNode resources = root.path("resources").path("resource");

                // Helper to process a resource node
                java.util.function.Consumer<JsonNode> mapper = (res) -> {
                    String id = res.path("identifier").asText();
                    String href = res.path("href").asText();
                    // SCORM 1.2: adlcp:scormtype, SCORM 2004: adlcp:scormType
                    // XmlMapper often flattens this to "scormtype" or similar if ignoring
                    // namespaces
                    String type = res.path("scormType").asText("");
                    if (type.isEmpty())
                        type = res.path("scormtype").asText("");
                    if (type.isEmpty())
                        type = res.path("adlcp:scormtype").asText("");
                    if (type.isEmpty())
                        type = res.path("adlcp:scormType").asText("");

                    if (!id.isEmpty()) {
                        resourceMap.put(id, new ScormResource(id, href, type));
                    }
                };

                if (resources.isArray()) {
                    for (JsonNode res : resources)
                        mapper.accept(res);
                } else if (!resources.isMissingNode()) {
                    mapper.accept(resources);
                }

                // 3. Find the first item that points to a SCO
                String href = findScoHref(targetOrg, resourceMap);
                if (href != null)
                    return href;

                // Fallback: If no SCO found, try any item with a resource reference
                String fallbackHref = findAnyHref(targetOrg, resourceMap);
                if (fallbackHref != null)
                    return fallbackHref;
            }
        } catch (Exception e) {
            logger.error("Failed to parse imsmanifest.xml", e);
        }

        return "index.html";
    }

    private String findScoHref(JsonNode node, Map<String, ScormResource> resourceMap) {
        if (node.has("identifierref")) {
            String ref = node.path("identifierref").asText();
            ScormResource res = resourceMap.get(ref);
            if (res != null && "sco".equalsIgnoreCase(res.type)) {
                return res.href;
            }
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

    private String findAnyHref(JsonNode node, Map<String, ScormResource> resourceMap) {
        if (node.has("identifierref")) {
            String ref = node.path("identifierref").asText();
            ScormResource res = resourceMap.get(ref);
            if (res != null && !res.href.isEmpty()) {
                return res.href;
            }
        }

        JsonNode items = node.path("item");
        if (items.isArray()) {
            for (JsonNode item : items) {
                String href = findAnyHref(item, resourceMap);
                if (href != null)
                    return href;
            }
        } else if (!items.isMissingNode()) {
            return findAnyHref(items, resourceMap);
        }

        return null;
    }

    private static class ScormResource {
        String id;
        String href;
        String type;

        ScormResource(String id, String href, String type) {
            this.id = id;
            this.href = href;
            this.type = type;
        }
    }

    public List<ScormPackage> getPackagesByCourse(Long courseId) {
        List<ScormPackage> packages = scormPackageRepository.findByCourseId(courseId);
        if (!packages.isEmpty())
            return packages;

        // Try public schema
        String currentTenant = com.eduflex.backend.config.tenant.TenantContext.getCurrentTenant();
        try {
            com.eduflex.backend.config.tenant.TenantContext.setCurrentTenant("public");
            return scormPackageRepository.findByCourseId(courseId);
        } finally {
            com.eduflex.backend.config.tenant.TenantContext.setCurrentTenant(currentTenant);
        }
    }

    @Transactional
    public void deletePackage(Long id) {
        scormPackageRepository.findById(id).ifPresent(pkg -> {
            if (pkg.getDirectoryPath() != null) {
                storageService.deleteByPrefix(pkg.getDirectoryPath());
            }
            scormPackageRepository.delete(pkg);
        });
    }

    public ScormPackage getPackage(Long id) {
        ScormPackage pkg = scormPackageRepository.findById(id).orElse(null);
        if (pkg != null)
            return pkg;

        // Try public
        String currentTenant = com.eduflex.backend.config.tenant.TenantContext.getCurrentTenant();
        try {
            com.eduflex.backend.config.tenant.TenantContext.setCurrentTenant("public");
            return scormPackageRepository.findById(id).orElse(null);
        } finally {
            com.eduflex.backend.config.tenant.TenantContext.setCurrentTenant(currentTenant);
        }
    }

    @Transactional
    public ScormPackage updatePackage(Long id, ScormPackage updates) {
        return scormPackageRepository.findById(id).map(pkg -> {
            if (updates.getTitle() != null)
                pkg.setTitle(updates.getTitle());
            return scormPackageRepository.save(pkg);
        }).orElse(null);
    }

    private static class NonClosingInputStream extends FilterInputStream {
        public NonClosingInputStream(InputStream in) {
            super(in);
        }

        @Override
        public void close() throws IOException {
            // Do nothing, let the ZipInputStream loop continue
        }
    }
}
