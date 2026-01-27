package com.eduflex.backend.service;

import com.eduflex.backend.security.JwtUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class Cmi5Service {

    private final Path storageLocation = Paths.get("uploads/cmi5");
    private final JwtUtils jwtUtils;

    public Cmi5Service(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    public Map<String, Object> importPackage(Long courseId, MultipartFile file) throws IOException {
        // 1. Save File (Basic stub implementation)
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        // Files.copy(file.getInputStream(), storageLocation.resolve(filename));

        // 2. Parse cmi5.xml (Mocking parsing logic for now)
        // In reality, we would unzip and read cmi5.xml to find the launch URL.

        Map<String, Object> au = new HashMap<>();
        au.put("id", UUID.randomUUID().toString());
        au.put("title", file.getOriginalFilename().replace(".zip", ""));
        au.put("launchMethod", "Popup");
        au.put("url", "/uploads/cmi5/" + filename + "/index.html"); // Mock path

        return au;
    }

    public String generateLrsToken() {
        // Generate a simplified token for LRS acting
        // In standard implementation, this should be a Basic Auth pair or OAuth token
        return jwtUtils.generateJwtToken("xapi-actor");
    }
}
