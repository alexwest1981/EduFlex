package com.eduflex.backend.listener;

import com.eduflex.backend.event.CourseResultGradedEvent;
import com.eduflex.backend.model.CourseResult;
import com.eduflex.backend.service.AutoDocumentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Listens for course result graded events and automatically generates documents.
 * Uses @Async to avoid blocking the grading process.
 */
@Component
public class CourseResultEventListener {
    
    private static final Logger logger = LoggerFactory.getLogger(CourseResultEventListener.class);
    private final AutoDocumentService autoDocumentService;
    
    public CourseResultEventListener(AutoDocumentService autoDocumentService) {
        this.autoDocumentService = autoDocumentService;
    }
    
    /**
     * Triggered when a CourseResult is graded.
     * Generates and stores a certificate PDF if status is PASSED.
     */
    @Async
    @EventListener
    public void onCourseResultGraded(CourseResultGradedEvent event) {
        CourseResult result = event.getCourseResult();
        
        logger.info("Received CourseResultGradedEvent for student: {}, course: {}, status: {}",
                result.getStudent().getFullName(),
                result.getCourse().getName(),
                result.getStatus());
        
        // Only generate certificate if PASSED
        if (result.getStatus() == CourseResult.Status.PASSED) {
            try {
                autoDocumentService.generateCourseCertificate(result);
                logger.info("Successfully triggered certificate generation for CourseResult ID: {}", 
                        result.getId());
            } catch (Exception e) {
                logger.error("Failed to generate certificate for CourseResult ID: {}", 
                        result.getId(), e);
            }
        } else {
            logger.debug("Skipping certificate generation - status is not PASSED");
        }
    }
}
