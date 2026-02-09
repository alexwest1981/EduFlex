package com.eduflex.backend.repository;

import com.eduflex.backend.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByOwnerId(Long userId);

    List<Document> findByOwnerIdAndFolderId(Long ownerId, Long folderId);

    List<Document> findByOwnerIdAndFolderIsNull(Long ownerId);

    @org.springframework.data.jpa.repository.Query("SELECT d FROM Document d WHERE d.owner.id = :userId OR d.id IN (SELECT s.document.id FROM FileShare s WHERE s.targetType = 'USER' AND s.targetId = :userId)")
    List<Document> findByOwnerIdOrSharedWithUser(
            @org.springframework.data.repository.query.Param("userId") Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(d.size), 0) FROM Document d WHERE d.owner.id = :userId")
    Long getTotalSizeByOwnerId(@org.springframework.data.repository.query.Param("userId") Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(d.size), 0) FROM Document d")
    Long getTotalSizeForAllUsers();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(d) FROM Document d")
    long countTotalDocuments();

    List<Document> findByOwnerIdAndOfficialTrue(Long userId);

    List<Document> findByIsGlobalTrue();
    
    // Find document by verification code for QR code verification
    Optional<Document> findByVerificationCode(String verificationCode);
}