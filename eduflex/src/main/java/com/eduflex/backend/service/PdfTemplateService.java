package com.eduflex.backend.service;

import com.eduflex.backend.model.PdfTemplate;
import com.eduflex.backend.repository.PdfTemplateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;

@Service
public class PdfTemplateService {

    private static final Logger log = LoggerFactory.getLogger(PdfTemplateService.class);

    private final PdfTemplateRepository repository;
    private final StorageService storageService;

    public PdfTemplateService(PdfTemplateRepository repository, StorageService storageService) {
        this.repository = repository;
        this.storageService = storageService;
    }

    @PostConstruct
    @Transactional
    public void initDefaultTemplates() {
        if (repository.count() == 0) {
            log.info("Inga PDF-mallar hittades — skapar standardmallar...");

            PdfTemplate cert = new PdfTemplate();
            cert.setTemplateType("CERTIFICATE");
            cert.setName("Standard Certifikat");
            repository.save(cert);

            PdfTemplate grade = new PdfTemplate();
            grade.setTemplateType("GRADE_REPORT");
            grade.setName("Standard Betygsrapport");
            repository.save(grade);

            log.info("Standardmallar för PDF skapade (CERTIFICATE + GRADE_REPORT)");
        }
    }

    public Optional<PdfTemplate> getActiveTemplate(String templateType) {
        return repository.findFirstByTemplateTypeAndIsActiveTrue(templateType);
    }

    public List<PdfTemplate> getAllTemplates() {
        return repository.findAll();
    }

    public PdfTemplate getTemplate(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PDF-mall hittades inte: " + id));
    }

    @Transactional
    public PdfTemplate saveTemplate(PdfTemplate template) {
        return repository.save(template);
    }

    @Transactional
    public PdfTemplate updateTemplate(Long id, PdfTemplate updates) {
        PdfTemplate existing = getTemplate(id);

        if (updates.getName() != null) existing.setName(updates.getName());
        if (updates.getPrimaryColor() != null) existing.setPrimaryColor(updates.getPrimaryColor());
        if (updates.getSecondaryColor() != null) existing.setSecondaryColor(updates.getSecondaryColor());
        if (updates.getAccentColor() != null) existing.setAccentColor(updates.getAccentColor());
        if (updates.getTitleText() != null) existing.setTitleText(updates.getTitleText());
        if (updates.getSubtitleText() != null) existing.setSubtitleText(updates.getSubtitleText());
        if (updates.getIntroText() != null) existing.setIntroText(updates.getIntroText());
        if (updates.getBodyText() != null) existing.setBodyText(updates.getBodyText());
        if (updates.getGradeLabel() != null) existing.setGradeLabel(updates.getGradeLabel());
        if (updates.getFooterText() != null) existing.setFooterText(updates.getFooterText());
        if (updates.getSignatureTitle() != null) existing.setSignatureTitle(updates.getSignatureTitle());
        existing.setSchoolNameOverride(updates.getSchoolNameOverride());
        if (updates.getShowBorder() != null) existing.setShowBorder(updates.getShowBorder());
        if (updates.getShowCornerDecorations() != null) existing.setShowCornerDecorations(updates.getShowCornerDecorations());
        if (updates.getShowQrCode() != null) existing.setShowQrCode(updates.getShowQrCode());
        if (updates.getQrPosition() != null) existing.setQrPosition(updates.getQrPosition());
        if (updates.getOrientation() != null) existing.setOrientation(updates.getOrientation());
        if (updates.getTitleFontSize() != null) existing.setTitleFontSize(updates.getTitleFontSize());
        if (updates.getBodyFontSize() != null) existing.setBodyFontSize(updates.getBodyFontSize());

        return repository.save(existing);
    }

    @Transactional
    public PdfTemplate uploadLogo(Long templateId, MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Endast bildfiler accepteras för logotyp");
        }

        String storageId = storageService.save(file);
        PdfTemplate template = getTemplate(templateId);
        template.setLogoUrl("/api/storage/" + storageId);
        return repository.save(template);
    }

    @Transactional
    public PdfTemplate uploadBackground(Long templateId, MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Endast bildfiler accepteras för bakgrundsbild");
        }

        String storageId = storageService.save(file);
        PdfTemplate template = getTemplate(templateId);
        template.setBackgroundImageUrl("/api/storage/" + storageId);
        return repository.save(template);
    }

    @Transactional
    public void deleteTemplate(Long id) {
        PdfTemplate template = getTemplate(id);
        template.setIsActive(false);
        repository.save(template);
    }
}
