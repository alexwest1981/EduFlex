package com.eduflex.backend.service;

import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@Primary
@Profile("test")
public class TestFileStorageService implements FileStorageService {

    @Override
    public String storeFile(MultipartFile file) {
        return "http://localhost:9000/test-bucket/" + file.getOriginalFilename();
    }
}
