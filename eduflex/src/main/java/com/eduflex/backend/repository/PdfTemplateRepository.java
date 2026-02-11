package com.eduflex.backend.repository;

import com.eduflex.backend.model.PdfTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PdfTemplateRepository extends JpaRepository<PdfTemplate, Long> {
    Optional<PdfTemplate> findFirstByTemplateTypeAndIsActiveTrue(String templateType);
    List<PdfTemplate> findByTemplateType(String templateType);
}
