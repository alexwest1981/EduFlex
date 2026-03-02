package com.eduflex.backend.service.ai;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.CourseMaterial;
import com.eduflex.backend.repository.CourseMaterialRepository;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.service.MinioStorageService;
import com.eduflex.backend.service.AiAuditService;
import com.fasterxml.jackson.databind.JsonNode;
import org.apache.poi.xslf.usermodel.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.geom.Rectangle2D;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.UUID;

@Service
public class PowerPointService {

    private static final Logger logger = LoggerFactory.getLogger(PowerPointService.class);

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private MinioStorageService storageService;

    @Autowired
    private CourseMaterialRepository materialRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private AiAuditService aiAuditService;

    @Transactional
    public CourseMaterial generateFromLesson(Long courseId, Long lessonId) {
        String actorId = SecurityContextHolder.getContext().getAuthentication().getName();

        // 1. Get lesson content
        CourseMaterial lesson = materialRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        logger.info("Generating PPT for lesson: {} (Course: {})", lesson.getTitle(), courseId);

        // 2. Structurize using AI
        JsonNode slideData = geminiService.generateSlideContent(lesson.getContent());
        if (slideData == null || !slideData.has("slides")) {
            throw new RuntimeException("AI failed to structure content for PPT");
        }

        // 3. Create PPT using Apache POI
        try (XMLSlideShow ppt = new XMLSlideShow()) {
            JsonNode slides = slideData.get("slides");
            for (JsonNode slideNode : slides) {
                XSLFSlide slide = ppt.createSlide();

                // Add title
                XSLFTextShape titleShape = slide.createTextBox();
                titleShape.setAnchor(new Rectangle2D.Double(50, 50, 620, 100));
                XSLFTextRun titleRun = titleShape.addNewTextParagraph().addNewTextRun();
                titleRun.setText(slideNode.get("title").asText());
                titleRun.setFontSize(32.0);
                titleRun.setBold(true);

                // Add bullet points
                XSLFTextShape bodyShape = slide.createTextBox();
                bodyShape.setAnchor(new Rectangle2D.Double(50, 150, 620, 350));

                JsonNode bullets = slideNode.get("bulletPoints");
                if (bullets != null && bullets.isArray()) {
                    for (JsonNode bullet : bullets) {
                        XSLFTextParagraph p = bodyShape.addNewTextParagraph();
                        p.setBullet(true);
                        p.addNewTextRun().setText(bullet.asText());
                    }
                }
            }

            // 4. Save to ByteArray and upload back to MinIO
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            ppt.write(out);
            byte[] bytes = out.toByteArray();

            String fileName = lesson.getTitle().replaceAll("[^a-zA-Z0-9åäöÅÄÖ\\s]", "") + ".pptx";
            String storageId = UUID.randomUUID().toString() + ".pptx";

            storageService.save(new ByteArrayInputStream(bytes),
                    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                    fileName, storageId);

            // 5. Register as new CourseMaterial
            Course course = courseRepository.findById(courseId).orElseThrow();
            CourseMaterial pptMaterial = new CourseMaterial();
            pptMaterial.setTitle("Presentation: " + lesson.getTitle());
            pptMaterial.setContent("AI-genererad presentation baserad på lektionen: " + lesson.getTitle());
            pptMaterial.setFileUrl("/api/storage/" + storageId);
            pptMaterial.setFileName(fileName);
            pptMaterial.setType(CourseMaterial.MaterialType.FILE); // Categorized as FILE
            pptMaterial.setCourse(course);

            CourseMaterial saved = materialRepository.save(pptMaterial);

            // 6. Log Audit
            aiAuditService.logDecision("PPT_GENERATION", "gemini", actorId,
                    "Generated PPT for: " + lesson.getTitle(), "Slides: " + slides.size(),
                    null, true, null);

            return saved;

        } catch (IOException e) {
            logger.error("Failed to generate PowerPoint", e);
            throw new RuntimeException("Failed to generate PowerPoint: " + e.getMessage());
        }
    }
}
