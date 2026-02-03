package com.eduflex.backend.repository;

import com.eduflex.backend.model.FileShare;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FileShareRepository extends JpaRepository<FileShare, Long> {
    List<FileShare> findByTargetTypeAndTargetId(FileShare.ShareTargetType type, Long targetId);

    List<FileShare> findByDocumentId(Long documentId);

    Optional<FileShare> findByLinkToken(String token);
}
