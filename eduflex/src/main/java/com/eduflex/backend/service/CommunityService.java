package com.eduflex.backend.service;

import com.eduflex.backend.config.tenant.TenantContext;
import com.eduflex.backend.dto.community.*;
import com.eduflex.backend.model.*;
import com.eduflex.backend.model.community.*;
import com.eduflex.backend.repository.*;
import com.eduflex.backend.repository.community.*;
import com.eduflex.backend.dto.community.AuthorProfileDTO;
import com.eduflex.backend.dto.community.CommunityLeaderboardDTO;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.model.QuestionBankItem;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CommunityService {

    private static final Logger logger = LoggerFactory.getLogger(CommunityService.class);

    private final CommunityItemRepository itemRepository;
    private final CommunityRatingRepository ratingRepository;
    private final CommunityDownloadRepository downloadRepository;
    private final QuizRepository quizRepository;
    private final AssignmentRepository assignmentRepository;
    private final LessonRepository lessonRepository;
    private final ResourceRepository resourceRepository;
    private final TenantRepository tenantRepository;
    private final QuestionBankRepository questionBankRepository;
    private final SocialIntegrationService socialService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public CommunityService(
            CommunityItemRepository itemRepository,
            CommunityRatingRepository ratingRepository,
            CommunityDownloadRepository downloadRepository,
            QuizRepository quizRepository,
            AssignmentRepository assignmentRepository,
            LessonRepository lessonRepository,
            ResourceRepository resourceRepository,
            TenantRepository tenantRepository,
            QuestionBankRepository questionBankRepository,
            SocialIntegrationService socialService,
            UserRepository userRepository,
            ObjectMapper objectMapper) {
        this.itemRepository = itemRepository;
        this.ratingRepository = ratingRepository;
        this.downloadRepository = downloadRepository;
        this.quizRepository = quizRepository;
        this.assignmentRepository = assignmentRepository;
        this.lessonRepository = lessonRepository;
        this.resourceRepository = resourceRepository;
        this.tenantRepository = tenantRepository;
        this.questionBankRepository = questionBankRepository;
        this.socialService = socialService;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    // ==================== PUBLISHING ====================

    @Transactional
    public CommunityItem publishQuiz(Long quizId, CommunityPublishRequest request, User currentUser) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found: " + quizId));

        // Verify ownership
        if (!quiz.getAuthor().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only publish your own quizzes");
        }

        CommunityItem item = new CommunityItem();
        item.setContentType(ContentType.QUIZ);
        item.setTitle(quiz.getTitle());
        item.setDescription(request.publicDescription() != null ? request.publicDescription() : quiz.getDescription());
        item.setContentJson(serializeQuiz(quiz));
        item.setSubject(parseSubject(request.subject()));
        item.setDifficulty(request.difficulty());
        item.setGradeLevel(request.gradeLevel());
        item.setTags(request.tags() != null ? request.tags() : new ArrayList<>());
        item.setStatus(PublishStatus.PENDING);

        // Set author info (denormalized)
        setAuthorInfo(item, currentUser);

        // Set metadata
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("questionCount", quiz.getQuestions() != null ? quiz.getQuestions().size() : 0);
        metadata.put("estimatedMinutes", calculateEstimatedTime(quiz));
        metadata.put("originalId", quizId);
        item.setMetadata(toJson(metadata));

        logger.info("Publishing quiz {} to Community by user {}", quizId, currentUser.getUsername());

        String originalTenant = TenantContext.getCurrentTenant();
        try {
            TenantContext.setCurrentTenant("public");
            return itemRepository.save(item);
        } finally {
            TenantContext.setCurrentTenant(originalTenant);
        }
    }

    @Transactional
    public CommunityItem publishAssignment(Long assignmentId, CommunityPublishRequest request, User currentUser) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found: " + assignmentId));

        if (!assignment.getAuthor().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only publish your own assignments");
        }

        CommunityItem item = new CommunityItem();
        item.setContentType(ContentType.ASSIGNMENT);
        item.setTitle(assignment.getTitle());
        item.setDescription(
                request.publicDescription() != null ? request.publicDescription() : assignment.getDescription());
        item.setContentJson(serializeAssignment(assignment));
        item.setSubject(parseSubject(request.subject()));
        item.setDifficulty(request.difficulty());
        item.setGradeLevel(request.gradeLevel());
        item.setTags(request.tags() != null ? request.tags() : new ArrayList<>());
        item.setStatus(PublishStatus.PENDING);

        setAuthorInfo(item, currentUser);

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("attachmentCount", assignment.getAttachments() != null ? assignment.getAttachments().size() : 0);
        metadata.put("xpReward", assignment.getXpReward());
        metadata.put("originalId", assignmentId);
        item.setMetadata(toJson(metadata));

        logger.info("Publishing assignment {} to Community by user {}", assignmentId, currentUser.getUsername());

        String originalTenant = TenantContext.getCurrentTenant();
        try {
            TenantContext.setCurrentTenant("public");
            return itemRepository.save(item);
        } finally {
            TenantContext.setCurrentTenant(originalTenant);
        }
    }

    @Transactional
    public CommunityItem publishLesson(Long lessonId, CommunityPublishRequest request, User currentUser) {
        // Find as Lesson first
        Optional<Lesson> lessonOpt = lessonRepository.findById(lessonId);

        if (lessonOpt.isPresent()) {
            Lesson lesson = lessonOpt.get();
            if (!lesson.getAuthor().getId().equals(currentUser.getId())) {
                throw new RuntimeException("You can only publish your own lessons");
            }
            return publishLessonEntity(lesson, request, currentUser);
        }

        // Try as Resource
        Optional<Resource> resourceOpt = resourceRepository.findById(lessonId);
        if (resourceOpt.isPresent()) {
            Resource resource = resourceOpt.get();
            if (!resource.getOwner().getId().equals(currentUser.getId())) {
                throw new RuntimeException("You can only publish your own resources");
            }
            return publishResourceAsLesson(resource, request, currentUser);
        }

        throw new RuntimeException("Lesson or Resource not found: " + lessonId);
    }

    private CommunityItem publishLessonEntity(Lesson lesson, CommunityPublishRequest request, User currentUser) {
        CommunityItem item = new CommunityItem();
        item.setContentType(ContentType.LESSON);
        item.setTitle(lesson.getTitle());
        item.setDescription(
                request.publicDescription() != null ? request.publicDescription() : truncate(lesson.getContent(), 500));
        item.setContentJson(serializeLesson(lesson));
        item.setSubject(parseSubject(request.subject()));
        item.setDifficulty(request.difficulty());
        item.setGradeLevel(request.gradeLevel());
        item.setTags(request.tags() != null ? request.tags() : new ArrayList<>());
        item.setStatus(PublishStatus.PENDING);

        setAuthorInfo(item, currentUser);

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("hasVideo", lesson.getVideoUrl() != null && !lesson.getVideoUrl().isEmpty());
        metadata.put("hasAttachment", lesson.getAttachmentUrl() != null && !lesson.getAttachmentUrl().isEmpty());
        metadata.put("contentLength", lesson.getContent() != null ? lesson.getContent().length() : 0);
        metadata.put("originalId", lesson.getId());
        metadata.put("sourceType", "LESSON");
        item.setMetadata(toJson(metadata));

        logger.info("Publishing lesson {} to Community by user {}", lesson.getId(), currentUser.getUsername());

        String originalTenant = TenantContext.getCurrentTenant();
        try {
            TenantContext.setCurrentTenant("public");
            return itemRepository.save(item);
        } finally {
            TenantContext.setCurrentTenant(originalTenant);
        }
    }

    private CommunityItem publishResourceAsLesson(Resource resource, CommunityPublishRequest request,
            User currentUser) {
        CommunityItem item = new CommunityItem();
        item.setContentType(ContentType.LESSON);
        item.setTitle(resource.getName());
        item.setDescription(
                request.publicDescription() != null ? request.publicDescription()
                        : truncate(resource.getContent(), 500));
        item.setContentJson(serializeResource(resource));
        item.setSubject(parseSubject(request.subject()));
        item.setDifficulty(request.difficulty());
        item.setGradeLevel(request.gradeLevel());
        item.setTags(request.tags() != null ? request.tags() : new ArrayList<>());
        item.setStatus(PublishStatus.PENDING);

        setAuthorInfo(item, currentUser);

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("originalId", resource.getId());
        metadata.put("sourceType", "RESOURCE");
        metadata.put("resourceType", resource.getType().name());
        item.setMetadata(toJson(metadata));

        logger.info("Publishing Resource {} as Lesson to Community by user {}", resource.getId(),
                currentUser.getUsername());

        String originalTenant = TenantContext.getCurrentTenant();
        try {
            TenantContext.setCurrentTenant("public");
            return itemRepository.save(item);
        } finally {
            TenantContext.setCurrentTenant(originalTenant);
        }
    }

    // ==================== BROWSING ====================

    public Page<CommunityItemDTO> browse(
            String subject,
            ContentType contentType,
            Long authorId,
            String sortBy,
            Pageable pageable) {
        String originalTenant = TenantContext.getCurrentTenant();
        try {
            // Community browsing is cross-tenant, always use public schema context
            TenantContext.setCurrentTenant("public");

            Page<CommunityItem> items;
            PublishStatus status = PublishStatus.PUBLISHED;
            CommunitySubject subjectEnum = parseSubject(subject);

            // Build query based on filters
            if (authorId != null) {
                items = switch (sortBy) {
                    case "popular" ->
                        itemRepository.findByStatusAndAuthorUserIdOrderByDownloadCountDesc(status, authorId, pageable);
                    case "rating" ->
                        itemRepository.findByStatusAndAuthorUserIdOrderByAverageRatingDesc(status, authorId, pageable);
                    default ->
                        itemRepository.findByStatusAndAuthorUserIdOrderByPublishedAtDesc(status, authorId, pageable);
                };
            } else if (subjectEnum != null && contentType != null) {
                items = switch (sortBy) {
                    case "popular" ->
                        itemRepository.findByStatusAndSubjectAndContentTypeOrderByDownloadCountDesc(status,
                                subjectEnum, contentType, pageable);
                    case "rating" -> itemRepository.findByStatusAndSubjectAndContentTypeOrderByAverageRatingDesc(status,
                            subjectEnum, contentType, pageable);
                    default -> itemRepository.findByStatusAndSubjectAndContentTypeOrderByPublishedAtDesc(status,
                            subjectEnum, contentType, pageable);
                };
            } else if (subjectEnum != null) {
                items = switch (sortBy) {
                    case "popular" ->
                        itemRepository.findByStatusAndSubjectOrderByDownloadCountDesc(status, subjectEnum, pageable);
                    case "rating" ->
                        itemRepository.findByStatusAndSubjectOrderByAverageRatingDesc(status, subjectEnum, pageable);
                    default ->
                        itemRepository.findByStatusAndSubjectOrderByPublishedAtDesc(status, subjectEnum, pageable);
                };
            } else if (contentType != null) {
                items = switch (sortBy) {
                    case "popular" ->
                        itemRepository.findByStatusAndContentTypeOrderByDownloadCountDesc(status, contentType,
                                pageable);
                    case "rating" ->
                        itemRepository.findByStatusAndContentTypeOrderByAverageRatingDesc(status, contentType,
                                pageable);
                    default ->
                        itemRepository.findByStatusAndContentTypeOrderByPublishedAtDesc(status, contentType, pageable);
                };
            } else {
                items = switch (sortBy) {
                    case "popular" -> itemRepository.findByStatusOrderByDownloadCountDesc(status, pageable);
                    case "rating" -> itemRepository.findByStatusOrderByAverageRatingDesc(status, pageable);
                    default -> itemRepository.findByStatusOrderByPublishedAtDesc(status, pageable);
                };
            }

            return items.map(item -> CommunityItemDTO.fromEntity(item, parseMetadata(item.getMetadata())));
        } finally {
            TenantContext.setCurrentTenant(originalTenant);
        }
    }

    public Page<CommunityItemDTO> search(String query, Pageable pageable) {
        String originalTenant = TenantContext.getCurrentTenant();
        try {
            TenantContext.setCurrentTenant("public");
            Page<CommunityItem> items = itemRepository.searchByQuery(PublishStatus.PUBLISHED, query, pageable);
            return items.map(item -> CommunityItemDTO.fromEntity(item, parseMetadata(item.getMetadata())));
        } finally {
            TenantContext.setCurrentTenant(originalTenant);
        }
    }

    // ==================== ITEM DETAILS ====================

    public CommunityItemDetailDTO getItemDetails(String itemId, Long userId, String tenantId) {
        String originalTenant = TenantContext.getCurrentTenant();
        try {
            TenantContext.setCurrentTenant("public");
            CommunityItem item = itemRepository.findById(itemId)
                    .orElseThrow(() -> new RuntimeException("Community item not found: " + itemId));

            List<CommunityRating> recentRatings = ratingRepository
                    .findTop5ByCommunityItemIdOrderByCreatedAtDesc(itemId);
            List<CommunityRatingDTO> ratingDTOs = recentRatings.stream()
                    .map(CommunityRatingDTO::fromEntity)
                    .toList();

            boolean alreadyInstalled = downloadRepository.existsByCommunityItemIdAndUserIdAndTenantId(itemId, userId,
                    tenantId);

            return CommunityItemDetailDTO.fromEntity(item, parseMetadata(item.getMetadata()), ratingDTOs,
                    alreadyInstalled);
        } finally {
            TenantContext.setCurrentTenant(originalTenant);
        }
    }

    // ==================== INSTALLATION ====================

    @Transactional
    public Long installItem(String itemId, User currentUser, Long targetCourseId) {
        String tenantId = TenantContext.getCurrentTenant();

        // 1. Fetch item from public schema
        String originalTenant = TenantContext.getCurrentTenant();
        CommunityItem item;
        try {
            TenantContext.setCurrentTenant("public");
            item = itemRepository.findById(itemId)
                    .orElseThrow(() -> new RuntimeException("Community item not found: " + itemId));

            if (item.getStatus() != PublishStatus.PUBLISHED) {
                throw new RuntimeException("Can only install published items");
            }

            // Check if already installed (also in public schema)
            if (downloadRepository.existsByCommunityItemIdAndUserIdAndTenantId(itemId, currentUser.getId(), tenantId)) {
                throw new RuntimeException("You have already installed this item");
            }
        } finally {
            TenantContext.setCurrentTenant(originalTenant);
        }

        // 2. Perform local installation in tenant schema
        Long localId = switch (item.getContentType()) {
            case QUIZ -> installQuiz(item, currentUser, targetCourseId);
            case ASSIGNMENT -> installAssignment(item, currentUser, targetCourseId);
            case LESSON -> installLesson(item, currentUser, targetCourseId);
        };

        // 3. Track download and update count in public schema
        try {
            TenantContext.setCurrentTenant("public");
            CommunityDownload download = new CommunityDownload();
            download.setCommunityItemId(itemId);
            download.setUserId(currentUser.getId());
            download.setTenantId(tenantId);
            download.setLocalItemId(localId);
            download.setLocalItemType(item.getContentType().name());
            downloadRepository.save(download);

            // Increment download count
            item.incrementDownloadCount();
            itemRepository.save(item);
        } finally {
            TenantContext.setCurrentTenant(originalTenant);
        }

        logger.info("User {} installed community item {} as local {} ID {}",
                currentUser.getUsername(), itemId, item.getContentType(), localId);

        return localId;
    }

    private Long installQuiz(CommunityItem item, User currentUser, Long courseId) {
        try {
            Map<String, Object> data = objectMapper.readValue(item.getContentJson(), new TypeReference<>() {
            });

            Quiz quiz = new Quiz();
            quiz.setTitle((String) data.get("title") + " (Community)");
            quiz.setDescription((String) data.get("description"));
            quiz.setAuthor(currentUser);
            quiz.setSourceCommunityItemId(item.getId());

            // Determine category for QuestionBank based on subject
            String questionBankCategory = item.getSubject() != null
                    ? item.getSubject().getDisplayName()
                    : "Community";

            // Set questions
            List<Map<String, Object>> questionsData = (List<Map<String, Object>>) data.get("questions");
            if (questionsData != null) {
                List<Question> questions = new ArrayList<>();
                List<QuestionBankItem> bankItems = new ArrayList<>();

                for (Map<String, Object> qData : questionsData) {
                    Question question = new Question();
                    question.setText((String) qData.get("text"));
                    question.setQuiz(quiz);

                    List<Map<String, Object>> optionsData = (List<Map<String, Object>>) qData.get("options");
                    List<String> optionTexts = new ArrayList<>();
                    String correctAnswer = null;

                    if (optionsData != null) {
                        List<Option> options = new ArrayList<>();
                        for (Map<String, Object> oData : optionsData) {
                            Option option = new Option();
                            String optionText = (String) oData.get("text");
                            option.setText(optionText);
                            option.setCorrect((Boolean) oData.get("isCorrect"));
                            option.setQuestion(question);
                            options.add(option);

                            // Track for QuestionBank
                            optionTexts.add(optionText);
                            if (Boolean.TRUE.equals(oData.get("isCorrect"))) {
                                correctAnswer = optionText;
                            }
                        }
                        question.setOptions(options);
                    }
                    questions.add(question);

                    // Also add to QuestionBank for reuse
                    QuestionBankItem bankItem = new QuestionBankItem();
                    bankItem.setQuestionText((String) qData.get("text"));
                    bankItem.setCategory(questionBankCategory);
                    bankItem.setDifficulty(parseDifficulty(item.getDifficulty()));
                    bankItem.setType(QuestionBankItem.QuestionType.MULTIPLE_CHOICE);
                    bankItem.setOptions(optionTexts);
                    bankItem.setCorrectAnswer(correctAnswer);
                    bankItem.setAuthor(currentUser);
                    bankItems.add(bankItem);
                }
                quiz.setQuestions(questions);

                // Save all questions to QuestionBank
                if (!bankItems.isEmpty()) {
                    questionBankRepository.saveAll(bankItems);
                    logger.info("Added {} questions to QuestionBank from Community item {}",
                            bankItems.size(), item.getId());
                }
            }

            Quiz saved = quizRepository.save(quiz);
            return saved.getId();
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse quiz data", e);
        }
    }

    private QuestionBankItem.Difficulty parseDifficulty(String difficulty) {
        if (difficulty == null)
            return QuestionBankItem.Difficulty.MEDIUM;
        return switch (difficulty.toUpperCase()) {
            case "EASY", "LÄTT" -> QuestionBankItem.Difficulty.EASY;
            case "HARD", "SVÅR" -> QuestionBankItem.Difficulty.HARD;
            default -> QuestionBankItem.Difficulty.MEDIUM;
        };
    }

    private Long installAssignment(CommunityItem item, User currentUser, Long courseId) {
        try {
            Map<String, Object> data = objectMapper.readValue(item.getContentJson(), new TypeReference<>() {
            });

            Assignment assignment = new Assignment();
            assignment.setTitle((String) data.get("title") + " (Community)");
            assignment.setDescription((String) data.get("description"));
            assignment.setAuthor(currentUser);
            assignment.setSourceCommunityItemId(item.getId());

            if (data.get("xpReward") != null) {
                assignment.setXpReward((Integer) data.get("xpReward"));
            }

            Assignment saved = assignmentRepository.save(assignment);
            return saved.getId();
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse assignment data", e);
        }
    }

    private Long installLesson(CommunityItem item, User currentUser, Long courseId) {
        try {
            Map<String, Object> data = objectMapper.readValue(item.getContentJson(), new TypeReference<>() {
            });

            Lesson lesson = new Lesson();
            lesson.setTitle((String) data.get("title") + " (Community)");
            lesson.setContent((String) data.get("content"));
            lesson.setVideoUrl((String) data.get("videoUrl"));
            lesson.setAuthor(currentUser);
            lesson.setSourceCommunityItemId(item.getId());

            Lesson saved = lessonRepository.save(lesson);
            return saved.getId();
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse lesson data", e);
        }
    }

    // ==================== RATING ====================

    @Transactional
    public void rateItem(String itemId, int rating, String comment, User currentUser) {
        String originalTenant = TenantContext.getCurrentTenant();
        try {
            TenantContext.setCurrentTenant("public");
            CommunityItem item = itemRepository.findById(itemId)
                    .orElseThrow(() -> new RuntimeException("Community item not found: " + itemId));

            // Check for existing rating
            Optional<CommunityRating> existing = ratingRepository.findByCommunityItemIdAndUserIdAndTenantId(
                    itemId, currentUser.getId(), originalTenant);

            CommunityRating ratingEntity;
            if (existing.isPresent()) {
                // Update existing rating
                ratingEntity = existing.get();
                ratingEntity.setRating(rating);
                ratingEntity.setComment(comment);
            } else {
                // Create new rating
                ratingEntity = new CommunityRating();
                ratingEntity.setCommunityItemId(itemId);
                ratingEntity.setUserId(currentUser.getId());
                ratingEntity.setTenantId(originalTenant);
                ratingEntity.setRating(rating);
                ratingEntity.setComment(comment);
                ratingEntity.setReviewerName(currentUser.getUsername());
            }

            ratingRepository.save(ratingEntity);

            // Update average rating on item
            List<Object[]> stats = ratingRepository.calculateRatingStats(itemId);
            if (!stats.isEmpty() && stats.get(0)[0] != null) {
                double avg = ((Number) stats.get(0)[0]).doubleValue();
                long count = ((Number) stats.get(0)[1]).longValue();
                item.updateRating(avg, (int) count);
                itemRepository.save(item);
            }

            logger.info("User {} rated community item {} with {} stars", currentUser.getUsername(), itemId, rating);
        } finally {
            TenantContext.setCurrentTenant(originalTenant);
        }
    }

    // ==================== MY PUBLISHED ====================

    public List<CommunityItemDTO> getMyPublished(Long userId, String tenantId) {
        String originalTenant = TenantContext.getCurrentTenant();
        try {
            TenantContext.setCurrentTenant("public");
            List<CommunityItem> items = itemRepository.findByAuthorUserIdAndAuthorTenantIdOrderByCreatedAtDesc(userId,
                    tenantId);
            return items.stream()
                    .map(item -> CommunityItemDTO.fromEntity(item, parseMetadata(item.getMetadata())))
                    .toList();
        } finally {
            TenantContext.setCurrentTenant(originalTenant);
        }
    }

    // ==================== AUTHOR PROFILES ====================

    public AuthorProfileDTO getAuthorProfile(Long userId) {
        String originalTenant = TenantContext.getCurrentTenant();
        try {
            TenantContext.setCurrentTenant("public");
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userId));

            List<CommunityItem> items = itemRepository.findByAuthorUserIdAndAuthorTenantIdOrderByCreatedAtDesc(userId,
                    null);
            // Note: null tenantId for global lookup if needed, but usually we filter by
            // userId for public items

            // If items are empty, user might be from another tenant but public
            if (items.isEmpty()) {
                // Find all items by this userId regardless of tenant (since it's public schema)
                items = itemRepository.findAll().stream()
                        .filter(i -> userId.equals(i.getAuthorUserId()))
                        .sorted(Comparator.comparing(CommunityItem::getCreatedAt).reversed())
                        .toList();
            }

            double avgRating = items.stream().filter(i -> i.getRatingCount() > 0)
                    .mapToDouble(CommunityItem::getAverageRating).average().orElse(0.0);
            int totalDownloads = items.stream().mapToInt(CommunityItem::getDownloadCount).sum();

            List<CommunityItemDTO> recent = items.stream()
                    .limit(5)
                    .map(item -> CommunityItemDTO.fromEntity(item, parseMetadata(item.getMetadata())))
                    .toList();

            return new AuthorProfileDTO(
                    user.getId(),
                    user.getFullName(),
                    "EduFlex", // Could be more dynamic
                    user.getProfilePictureUrl(),
                    "Pedagog på EduFlex Community",
                    user.getLinkedinUrl(),
                    user.getTwitterUrl(),
                    items.size(),
                    avgRating,
                    totalDownloads,
                    user.getCreatedAt(),
                    recent);
        } finally {
            TenantContext.setCurrentTenant(originalTenant);
        }
    }

    public List<CommunityLeaderboardDTO> getLeaderboard() {
        String originalTenant = TenantContext.getCurrentTenant();
        try {
            TenantContext.setCurrentTenant("public");
            // Simple leaderboard logic: find top 10 authors by combined score
            // In a real DB we'd use a native query for better performance
            List<CommunityItem> allPublished = itemRepository.findAll().stream()
                    .filter(i -> i.getStatus() == PublishStatus.PUBLISHED)
                    .toList();

            Map<Long, List<CommunityItem>> authorItems = allPublished.stream()
                    .collect(Collectors.groupingBy(CommunityItem::getAuthorUserId));

            return authorItems.entrySet().stream()
                    .map(entry -> {
                        Long userId = entry.getKey();
                        List<CommunityItem> items = entry.getValue();
                        int downloads = items.stream().mapToInt(CommunityItem::getDownloadCount).sum();
                        double avgRating = items.stream().filter(i -> i.getRatingCount() > 0)
                                .mapToDouble(CommunityItem::getAverageRating).average().orElse(0.0);

                        // Score formula: (downloads * 2) + (resourceCount * 5) + (rating * 10)
                        int score = (downloads * 2) + (items.size() * 5) + (int) (avgRating * 10);

                        CommunityItem representative = items.get(0);
                        return new CommunityLeaderboardDTO(
                                userId,
                                representative.getAuthorName(),
                                representative.getAuthorTenantName(),
                                representative.getAuthorProfilePictureUrl(),
                                items.size(),
                                downloads,
                                avgRating,
                                score);
                    })
                    .sorted(Comparator.comparing(CommunityLeaderboardDTO::score).reversed())
                    .limit(10)
                    .toList();
        } finally {
            TenantContext.setCurrentTenant(originalTenant);
        }
    }

    // ==================== ADMIN MODERATION ====================

    public Page<CommunityItemDTO> getPendingItems(Pageable pageable) {
        String originalTenant = TenantContext.getCurrentTenant();
        try {
            // Admin moderation happens across all tenants in the public schema
            TenantContext.setCurrentTenant("public");
            Page<CommunityItem> items = itemRepository.findByStatusOrderByCreatedAtAsc(PublishStatus.PENDING, pageable);
            return items.map(item -> CommunityItemDTO.fromEntity(item, parseMetadata(item.getMetadata())));
        } finally {
            TenantContext.setCurrentTenant(originalTenant);
        }
    }

    public long getPendingCount() {
        String originalTenant = TenantContext.getCurrentTenant();
        try {
            TenantContext.setCurrentTenant("public");
            return itemRepository.countByStatus(PublishStatus.PENDING);
        } finally {
            TenantContext.setCurrentTenant(originalTenant);
        }
    }

    @Transactional
    public CommunityItem approveItem(String itemId) {
        String originalTenant = TenantContext.getCurrentTenant();
        try {
            TenantContext.setCurrentTenant("public");
            CommunityItem item = itemRepository.findById(itemId)
                    .orElseThrow(() -> new RuntimeException("Community item not found: " + itemId));

            item.setStatus(PublishStatus.PUBLISHED);
            item.setPublishedAt(LocalDateTime.now());
            item.setRejectionReason(null);

            // Social Integration: Notify external channels (Slack/Teams/Recent Activity)
            socialService.notifyNewContent(item.getTitle(), item.getAuthorName(),
                    item.getContentType().name(), "/community/items/" + item.getId());

            logger.info("Community item {} approved and social broadcast sent", itemId);
            return itemRepository.save(item);
        } finally {
            TenantContext.setCurrentTenant(originalTenant);
        }
    }

    @Transactional
    public CommunityItem rejectItem(String itemId, String reason) {
        String originalTenant = TenantContext.getCurrentTenant();
        try {
            TenantContext.setCurrentTenant("public");
            CommunityItem item = itemRepository.findById(itemId)
                    .orElseThrow(() -> new RuntimeException("Community item not found: " + itemId));

            item.setStatus(PublishStatus.REJECTED);
            item.setRejectionReason(reason);

            logger.info("Community item {} rejected: {}", itemId, reason);
            return itemRepository.save(item);
        } finally {
            TenantContext.setCurrentTenant(originalTenant);
        }
    }

    // ==================== SUBJECTS ====================

    public List<SubjectDTO> getSubjectsWithCounts() {
        String originalTenant = TenantContext.getCurrentTenant();
        Map<CommunitySubject, Long> counts = new HashMap<>();

        // Initialize all subjects with 0
        for (CommunitySubject subject : CommunitySubject.values()) {
            counts.put(subject, 0L);
        }

        // Get actual counts (with error handling for when table doesn't exist yet)
        try {
            TenantContext.setCurrentTenant("public");
            List<Object[]> results = itemRepository.countBySubject(PublishStatus.PUBLISHED);
            for (Object[] result : results) {
                if (result[0] != null) {
                    CommunitySubject subject = (CommunitySubject) result[0];
                    Long count = (Long) result[1];
                    counts.put(subject, count);
                }
            }
        } catch (Exception e) {
            // If the table doesn't exist yet, just return subjects with 0 counts
            logger.warn("Could not fetch subject counts (table may not exist yet): {}", e.getMessage());
        } finally {
            TenantContext.setCurrentTenant(originalTenant);
        }

        return Arrays.stream(CommunitySubject.values())
                .map(subject -> SubjectDTO.fromEnum(subject, counts.get(subject)))
                .toList();
    }

    // ==================== HELPER METHODS ====================

    private void setAuthorInfo(CommunityItem item, User user) {
        String tenantId = TenantContext.getCurrentTenant();
        item.setAuthorUserId(user.getId());
        item.setAuthorName(user.getUsername());
        item.setAuthorTenantId(tenantId);
        item.setAuthorProfilePictureUrl(user.getProfilePictureUrl());

        // Get tenant name
        if (tenantId != null && !"public".equals(tenantId)) {
            tenantRepository.findById(tenantId).ifPresent(tenant -> item.setAuthorTenantName(tenant.getName()));
        }
        if (item.getAuthorTenantName() == null) {
            item.setAuthorTenantName("EduFlex");
        }
    }

    private CommunitySubject parseSubject(String subject) {
        if (subject == null || subject.isEmpty() || "ALL".equalsIgnoreCase(subject)) {
            return null;
        }
        try {
            return CommunitySubject.valueOf(subject.toUpperCase());
        } catch (IllegalArgumentException e) {
            logger.warn("Unknown subject: {}", subject);
            return CommunitySubject.OVRIGT;
        }
    }

    private String serializeQuiz(Quiz quiz) {
        Map<String, Object> data = new HashMap<>();
        data.put("title", quiz.getTitle());
        data.put("description", quiz.getDescription());

        if (quiz.getQuestions() != null) {
            List<Map<String, Object>> questions = quiz.getQuestions().stream()
                    .map(q -> {
                        Map<String, Object> qMap = new HashMap<>();
                        qMap.put("text", q.getText());
                        if (q.getOptions() != null) {
                            qMap.put("options", q.getOptions().stream()
                                    .map(o -> Map.of("text", o.getText(), "isCorrect", o.isCorrect()))
                                    .toList());
                        }
                        return qMap;
                    })
                    .toList();
            data.put("questions", questions);
        }

        return toJson(data);
    }

    private String serializeAssignment(Assignment assignment) {
        Map<String, Object> data = new HashMap<>();
        data.put("title", assignment.getTitle());
        data.put("description", assignment.getDescription());
        data.put("xpReward", assignment.getXpReward());
        return toJson(data);
    }

    private String serializeLesson(Lesson lesson) {
        Map<String, Object> data = new HashMap<>();
        data.put("title", lesson.getTitle());
        data.put("content", lesson.getContent());
        data.put("videoUrl", lesson.getVideoUrl());
        return toJson(data);
    }

    private String serializeResource(Resource resource) {
        Map<String, Object> data = new HashMap<>();
        data.put("title", resource.getName());
        data.put("content", resource.getContent());
        data.put("type", resource.getType().name());
        return toJson(data);
    }

    private int calculateEstimatedTime(Quiz quiz) {
        if (quiz.getQuestions() == null)
            return 5;
        // Estimate 1 minute per question
        return Math.max(5, quiz.getQuestions().size());
    }

    private String truncate(String text, int maxLength) {
        if (text == null)
            return null;
        if (text.length() <= maxLength)
            return text;
        return text.substring(0, maxLength) + "...";
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            logger.error("Failed to serialize to JSON", e);
            return "{}";
        }
    }

    private Map<String, Object> parseMetadata(String json) {
        if (json == null || json.isEmpty()) {
            return new HashMap<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<>() {
            });
        } catch (JsonProcessingException e) {
            logger.error("Failed to parse metadata JSON", e);
            return new HashMap<>();
        }
    }
}
