package com.eduflex.backend.repository;

import com.eduflex.backend.model.UserDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserDocumentRepository extends JpaRepository<UserDocument, Long> {
    // Hämta alla dokument som tillhör en specifik användare
    List<UserDocument> findByOwnerId(Long userId);
}