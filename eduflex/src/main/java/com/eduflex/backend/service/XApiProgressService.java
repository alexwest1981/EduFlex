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
    private final com.eduflex.backend.repository.UserRepository userRepository;
    private final com.eduflex.backend.repository.Cmi5PackageRepository cmi5PackageRepository;
    private final com.eduflex.backend.repository.Cmi5ProgressRepository cmi5ProgressRepository;
    private final com.eduflex.backend.repository.CourseResultRepository courseResultRepository;
    private final CourseRepository courseRepository;
    private final ObjectMapper objectMapper;

    // xAPI Verbs
    private static final String VERB_COMPLETED = "http://adlnet.gov/expapi/verbs/completed";
    private static final String VERB_PASSED = "http://adlnet.gov/expapi/verbs/passed";
    private static final String VERB_FAILED = "http://adlnet.gov/expapi/verbs/failed";
    private static final String VERB_INITIALIZED = "http://adlnet.gov/expapi/verbs/initialized";

    public XApiProgressService(CourseRepository courseRepository,
            com.eduflex.backend.repository.UserRepository userRepository,
            com.eduflex.backend.repository.Cmi5PackageRepository cmi5PackageRepository,
            com.eduflex.backend.repository.Cmi5ProgressRepository cmi5ProgressRepository,
            com.eduflex.backend.repository.CourseResultRepository courseResultRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.cmi5PackageRepository = cmi5PackageRepository;
        this.cmi5ProgressRepository = cmi5ProgressRepository;
        this.courseResultRepository = courseResultRepository;
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
            String registration = statement.getRegistration(); // Assuming we added this to XApiStatement model

            logger.debug("Processing xAPI Statement: Verb={}, Actor={}, Object={}, Registration={}", verbId, actorEmail,
                    objectId, registration);

            if (VERB_COMPLETED.equals(verbId) || VERB_PASSED.equals(verbId)) {
                handleCompletion(actorEmail, objectId, registration, statement.getRawStatement(), verbId);
            } else if (VERB_FAILED.equals(verbId)) {
                handleFailure(actorEmail, objectId, registration, statement.getRawStatement());
            }

        } catch (Exception e) {
            logger.error("Error processing xAPI statement for progress: {}", e.getMessage());
        }
    }

    private void handleCompletion(String email, String objectId, String registration, String rawJson, String verbId) {
        logger.info("🎓 User {} completed activity {}", email, objectId);

        // 1. Find User
        com.eduflex.backend.model.User user = userRepository.findByEmail(email)
                .orElse(null);
        if (user == null) {
            // Try username fallback if email is actually a username (common in dev)
            user = userRepository.findByUsername(email).orElse(null);
            if (user == null) {
                logger.warn("User not found for email/username: {}", email);
                return;
            }
        }

        // 2. Find Cmi5Package
        // The objectId in cmi5 is the AU URL. We stored the full launch URL in
        // Cmi5Package.
        // We need to match it. Since we generated the URL, we can likely match by
        // containment or exact match if careful.
        // Better yet, if we had the packageId in the statement context, but we might
        // not.
        // Let's try to match by Launch URL.

        // Strategy: Link exact objectID if possible, or fallback to matching package by
        // ID if encoded in URL
        // Our URLs are like: .../api/storage/cmi5/{packageId}/...

        com.eduflex.backend.model.Cmi5Package pkg = findPackageByObjectId(objectId);
        if (pkg == null) {
            logger.warn("No Cmi5Package found for objectId: {}", objectId);
            return;
        }

        // 3. Update Cmi5Progress
        com.eduflex.backend.model.Cmi5Progress progress = cmi5ProgressRepository
                .findByUserIdAndCmi5PackageIdAndRegistration(user.getId(), pkg.getId(), registration)
                .orElse(new com.eduflex.backend.model.Cmi5Progress());

        if (progress.getId() == null) {
            progress.setUser(user);
            progress.setCmi5Package(pkg);
            progress.setRegistration(registration);
        }

        String status = VERB_PASSED.equals(verbId) ? "PASSED" : "COMPLETED";

        // If already PASSED, don't downgrade to COMPLETED (unless it's a new attempt,
        // but registration handles that)
        if (!"PASSED".equals(progress.getStatus())) {
            progress.setStatus(status);
            progress.setCompletedAt(LocalDateTime.now());
        }

        // Extract Score
        try {
            JsonNode root = objectMapper.readTree(rawJson);
            if (root.has("result") && root.get("result").has("score")) {
                JsonNode scoreNode = root.get("result").get("score");
                if (scoreNode.has("scaled")) {
                    progress.setScore(scoreNode.get("scaled").asDouble());
                }
            }
        } catch (Exception e) {
            logger.warn("Could not parse score: {}", e.getMessage());
        }

        cmi5ProgressRepository.save(progress);

        // 4. Check Course Completion
        checkCourseCompletion(user, pkg.getCourse());
    }

    private void handleFailure(String email, String objectId, String registration, String rawJson) {
        logger.info("❌ User {} failed activity {}", email, objectId);
        // Similar lookup logic, set status to FAILED
        com.eduflex.backend.model.User user = userRepository.findByEmail(email).orElse(null);
        if (user == null)
            user = userRepository.findByUsername(email).orElse(null);
        if (user == null)
            return;

        com.eduflex.backend.model.Cmi5Package pkg = findPackageByObjectId(objectId);
        if (pkg == null)
            return;

        com.eduflex.backend.model.Cmi5Progress progress = cmi5ProgressRepository
                .findByUserIdAndCmi5PackageIdAndRegistration(user.getId(), pkg.getId(), registration)
                .orElse(new com.eduflex.backend.model.Cmi5Progress());

        if (progress.getId() == null) {
            progress.setUser(user);
            progress.setCmi5Package(pkg);
            progress.setRegistration(registration);
        }
        progress.setStatus("FAILED");

        // Extract Score
        try {
            JsonNode root = objectMapper.readTree(rawJson);
            if (root.has("result") && root.get("result").has("score")) {
                JsonNode scoreNode = root.get("result").get("score");
                if (scoreNode.has("scaled")) {
                    progress.setScore(scoreNode.get("scaled").asDouble());
                }
            }
        } catch (Exception e) {
            // ignore
        }
        cmi5ProgressRepository.save(progress);
    }

    private com.eduflex.backend.model.Cmi5Package findPackageByObjectId(String objectId) {
        // This is tricky. The objectID from the AU might be an absolute URL defined in
        // cmi5.xml.
        // It does NOT necessarily match our launch URL.
        // However, usually for imported packages, we might not have control over the
        // ID.
        // BUT, if we use the 'context.contextActivities.grouping' id, that is often the
        // course or package ID.

        // FALLBACK: Since we are creating a MVP, let's assume the user has only a few
        // packages.
        // Ideally, we should have stored the AU's intended ID during import (parsing
        // cmi5.xml).
        // Since we didn't store the AU ID in Cmi5Package yet, we might need a loose
        // match or extraction.

        // For now, let's try to match if the objectId contains the packageId (GUID)
        // which is in our URL.
        // Our URL: .../cmi5/{packageId}/...

        // 1. Try to find a packageId (UUID) in the objectId string.
        String uuidPattern = "[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}";
        java.util.regex.Pattern p = java.util.regex.Pattern.compile(uuidPattern);
        java.util.regex.Matcher m = p.matcher(objectId);

        if (m.find()) {
            String potentialId = m.group();
            return cmi5PackageRepository.findByPackageId(potentialId).orElse(null);
        }

        // If not found, maybe iterate all packages and check if launchUrl equals
        // objectId?
        // Unlikely to match exactly due to hosting domain.
        return null;
    }

    private void checkCourseCompletion(com.eduflex.backend.model.User user, Course course) {
        // Logic: specific to CMI5 packages for now.
        // If all CMI5 packages in the course have a status of PASSED or COMPLETED, mark
        // course as PASSED.

        java.util.List<com.eduflex.backend.model.Cmi5Package> packages = cmi5PackageRepository
                .findByCourseId(course.getId());
        if (packages.isEmpty())
            return;

        boolean allDone = true;
        for (com.eduflex.backend.model.Cmi5Package pkg : packages) {
            // Check if user has ANY progress record that is PASSED/COMPLETED for this
            // package
            java.util.List<com.eduflex.backend.model.Cmi5Progress> progressList = cmi5ProgressRepository
                    .findByUserIdAndCmi5PackageId(user.getId(), pkg.getId());
            boolean pkgDone = progressList.stream()
                    .anyMatch(p -> "PASSED".equals(p.getStatus()) || "COMPLETED".equals(p.getStatus()));

            if (!pkgDone) {
                allDone = false;
                break;
            }
        }

        if (allDone) {
            com.eduflex.backend.model.CourseResult result = courseResultRepository
                    .findByCourseIdAndStudentId(course.getId(), user.getId())
                    .orElse(new com.eduflex.backend.model.CourseResult());

            if (result.getId() == null) {
                result.setCourse(course);
                result.setStudent(user);
            }

            if (result.getStatus() != com.eduflex.backend.model.CourseResult.Status.PASSED) {
                result.setStatus(com.eduflex.backend.model.CourseResult.Status.PASSED);
                result.setGradedAt(LocalDateTime.now());
                result.setNote("Completed via CMI5 xAPI");
                com.eduflex.backend.model.CourseResult savedResult = courseResultRepository.save(result); // Save and
                                                                                                          // get result
                logger.info("🎉 Course {} marked as PASSED for user {}", course.getId(), user.getEmail());

                // --- LTI ADVANTAGE: AGS SYNC ---
                try {
                    com.eduflex.backend.service.LtiAgsService ltiAgsService = org.springframework.web.context.ContextLoader
                            .getCurrentWebApplicationContext()
                            .getBean(com.eduflex.backend.service.LtiAgsService.class);

                    // Post score 1.0 (100%)
                    ltiAgsService.syncGrade(user, course, 1.0d);
                } catch (Exception e) {
                    logger.warn("⚠️ Failed to trigger LTI Grade Sync: {}", e.getMessage());
                }
            }
        }
    }
}
