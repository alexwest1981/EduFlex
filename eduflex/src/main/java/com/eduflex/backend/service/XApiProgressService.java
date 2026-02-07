package com.eduflex.backend.service;

import com.eduflex.backend.model.XApiStatement;
import com.eduflex.backend.model.Course;
import com.eduflex.backend.repository.CourseRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class XApiProgressService {

    private static final Logger logger = LoggerFactory.getLogger(XApiProgressService.class);
    private final CourseRepository courseRepository;
    private final ObjectMapper objectMapper;

    // xAPI Verbs
    private static final String VERB_COMPLETED = "http://adlnet.gov/expapi/verbs/completed";
    private static final String VERB_PASSED = "http://adlnet.gov/expapi/verbs/passed";
    private static final String VERB_FAILED = "http://adlnet.gov/expapi/verbs/failed";
    private static final String VERB_INITIALIZED = "http://adlnet.gov/expapi/verbs/initialized";

    public XApiProgressService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Process a new statement to update progress.
     * This is called asynchronously or directly from LrsController.
     */
    @Transactional
    public void processStatement(XApiStatement statement) {
        try {
            String verbId = statement.getVerbId();
            String objectId = statement.getObjectId();
            String actorEmail = statement.getActorEmail();

            logger.debug("Processing xAPI Statement: Verb={}, Actor={}, Object={}", verbId, actorEmail, objectId);

            if (VERB_COMPLETED.equals(verbId) || VERB_PASSED.equals(verbId)) {
                handleCompletion(actorEmail, objectId, statement.getRawStatement());
            } else if (VERB_FAILED.equals(verbId)) {
                handleFailure(actorEmail, objectId);
            }

        } catch (Exception e) {
            logger.error("Error processing xAPI statement for progress: {}", e.getMessage());
        }
    }

    private void handleCompletion(String email, String objectId, String rawJson) {
        logger.info("🎓 User {} completed activity {}", email, objectId);

        // TODO: Logic to link 'objectId' (which might be a URL) to a Lesson or Course
        // in DB.
        // For cmi5, the objectId is often the AU URL.
        // We need a mapping or lookup.
        // If objectId matches a Cmi5Package launch URL, we mark that package as done
        // for the user.

        // Example logic (Placeholder for real CourseProgress update):
        // 1. Find Cmi5Package by launchUrl (or part of it)
        // 2. Find User by email
        // 3. Update CourseProgress

        // Parsing score if available
        try {
            JsonNode root = objectMapper.readTree(rawJson);
            if (root.has("result") && root.get("result").has("score")) {
                JsonNode scoreNode = root.get("result").get("score");
                double scaled = scoreNode.has("scaled") ? scoreNode.get("scaled").asDouble() : 0.0;
                logger.info("   Score: {}%", scaled * 100);
            }
        } catch (Exception e) {
            logger.warn("Could not parse score: {}", e.getMessage());
        }
    }

    private void handleFailure(String email, String objectId) {
        logger.info("❌ User {} failed activity {}", email, objectId);
    }
}
