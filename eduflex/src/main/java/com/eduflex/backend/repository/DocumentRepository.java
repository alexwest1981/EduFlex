package com.eduflex.backend.repository;

import com.eduflex.backend.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByOwnerId(Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT d FROM Document d LEFT JOIN d.sharedWith s WHERE d.owner.id = :userId OR s.id = :userId")
    List<Document> findByOwnerIdOrSharedWithId(@org.springframework.data.repository.query.Param("userId") Long userId);
}