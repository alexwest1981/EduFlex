package com.eduflex.backend.service;

import com.eduflex.backend.security.JwtUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.net.URLConnection;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class Cmi5Service {

    private final JwtUtils jwtUtils;
    private final StorageService storageService;

    public Cmi5Service(JwtUtils jwtUtils, StorageService storageService) {
        this.jwtUtils = jwtUtils;
        this.storageService = storageService;
    }

    public Map<String, Object> importPackage(Long courseId, MultipartFile file) throws IOException {
        String packageId = UUID.randomUUID().toString();

        // Unzip and upload to storage (similar to SCORM)
        String launchUrl = unzipToStorage(file.getInputStream(), packageId);

        Map<String, Object> au = new HashMap<>();
        au.put("id", UUID.randomUUID().toString());
        au.put("title", file.getOriginalFilename().replace(".zip", ""));
        au.put("launchMethod", "Popup");
        au.put("url", "/api/storage/cmi5/" + packageId + "/" + launchUrl);

        return au;
    }

    private String unzipToStorage(InputStream is, String packageId) throws IOException {
        String launchFile = "index.html";
        try (ZipInputStream zis = new ZipInputStream(is)) {
            ZipEntry zipEntry = zis.getNextEntry();
            while (zipEntry != null) {
                if (!zipEntry.isDirectory()) {
                    String entryName = zipEntry.getName();
                    if (entryName.endsWith("cmi5.xml")) {
                        // In a real implementation we'd parse this to find the AU launch URL
                    }

                    String contentType = URLConnection.guessContentTypeFromName(entryName);
                    String customId = "cmi5/" + packageId + "/" + entryName;
                    storageService.save(new NonClosingInputStream(zis), contentType, entryName, customId);
                }
                zipEntry = zis.getNextEntry();
            }
        }
        return launchFile;
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
}
