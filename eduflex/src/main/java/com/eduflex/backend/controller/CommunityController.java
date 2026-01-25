package com.eduflex.backend.controller;

import com.eduflex.backend.config.tenant.TenantContext;
import com.eduflex.backend.dto.community.*;
import com.eduflex.backend.model.User;
import com.eduflex.backend.model.community.CommunityItem;
import com.eduflex.backend.model.community.ContentType;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.service.CommunityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/community")
@CrossOrigin(origins = "*")
@Tag(name = "Community", description = "EduFlex Community - Marketplace for educational content")
public class CommunityController {

    private static final Logger logger = LoggerFactory.getLogger(CommunityController.class);

    private final CommunityService communityService;
    private final UserRepository userRepository;

    public CommunityController(CommunityService communityService, UserRepository userRepository) {
        this.communityService = communityService;
        this.userRepository = userRepository;
    }

    // ==================== BROWSE & SEARCH ====================

    @GetMapping("/browse")
    @Operation(summary = "Browse community content", description = "Browse published content with filters and sorting")
    public ResponseEntity<Page<CommunityItemDTO>> browse(
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        ContentType contentType = null;
        if (type != null && !type.isEmpty() && !"ALL".equalsIgnoreCase(type)) {
            try {
                contentType = ContentType.valueOf(type.toUpperCase());
            } catch (IllegalArgumentException e) {
                logger.warn("Invalid content type: {}", type);
            }
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<CommunityItemDTO> items = communityService.browse(subject, contentType, sort, pageable);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/search")
    @Operation(summary = "Search community content", description = "Full-text search across titles, descriptions, and authors")
    public ResponseEntity<Page<CommunityItemDTO>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CommunityItemDTO> items = communityService.search(q, pageable);
        return ResponseEntity.ok(items);
    }

    // ==================== ITEM DETAILS ====================

    @GetMapping("/items/{itemId}")
    @Operation(summary = "Get item details", description = "Get full details for a community item including ratings")
    public ResponseEntity<CommunityItemDetailDTO> getItemDetails(
            @PathVariable String itemId,
            Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);
        String tenantId = TenantContext.getCurrentTenant();

        CommunityItemDetailDTO item = communityService.getItemDetails(itemId, currentUser.getId(), tenantId);
        return ResponseEntity.ok(item);
    }

    // ==================== SUBJECTS ====================

    @GetMapping("/subjects")
    @Operation(summary = "Get subjects", description = "Get all subject categories with item counts")
    public ResponseEntity<List<SubjectDTO>> getSubjects() {
        List<SubjectDTO> subjects = communityService.getSubjectsWithCounts();
        return ResponseEntity.ok(subjects);
    }

    // ==================== PUBLISHING ====================

    @PostMapping("/publish/quiz/{quizId}")
    @PreAuthorize("hasAnyAuthority('TEACHER', 'ROLE_TEACHER', 'ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Publish a quiz", description = "Submit a quiz for community review")
    public ResponseEntity<CommunityItemDTO> publishQuiz(
            @PathVariable Long quizId,
            @RequestBody CommunityPublishRequest request,
            Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);
        CommunityItem item = communityService.publishQuiz(quizId, request, currentUser);
        return ResponseEntity.ok(CommunityItemDTO.fromEntity(item, Map.of()));
    }

    @PostMapping("/publish/assignment/{assignmentId}")
    @PreAuthorize("hasAnyAuthority('TEACHER', 'ROLE_TEACHER', 'ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Publish an assignment", description = "Submit an assignment for community review")
    public ResponseEntity<CommunityItemDTO> publishAssignment(
            @PathVariable Long assignmentId,
            @RequestBody CommunityPublishRequest request,
            Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);
        CommunityItem item = communityService.publishAssignment(assignmentId, request, currentUser);
        return ResponseEntity.ok(CommunityItemDTO.fromEntity(item, Map.of()));
    }

    @PostMapping("/publish/lesson/{lessonId}")
    @PreAuthorize("hasAnyAuthority('TEACHER', 'ROLE_TEACHER', 'ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Publish a lesson", description = "Submit a lesson for community review")
    public ResponseEntity<CommunityItemDTO> publishLesson(
            @PathVariable Long lessonId,
            @RequestBody CommunityPublishRequest request,
            Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);
        CommunityItem item = communityService.publishLesson(lessonId, request, currentUser);
        return ResponseEntity.ok(CommunityItemDTO.fromEntity(item, Map.of()));
    }

    // ==================== INSTALL ====================

    @PostMapping("/items/{itemId}/install")
    @Operation(summary = "Install content", description = "Install community content to your local resources")
    public ResponseEntity<Map<String, Object>> installItem(
            @PathVariable String itemId,
            @RequestParam(required = false) Long courseId,
            Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);
        Long localId = communityService.installItem(itemId, currentUser, courseId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "localId", localId,
                "message", "Content installed successfully"
        ));
    }

    // ==================== RATING ====================

    @PostMapping("/items/{itemId}/rate")
    @Operation(summary = "Rate content", description = "Rate and review community content")
    public ResponseEntity<Map<String, Object>> rateItem(
            @PathVariable String itemId,
            @RequestBody CommunityRatingRequest request,
            Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);
        communityService.rateItem(itemId, request.rating(), request.comment(), currentUser);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Rating submitted successfully"
        ));
    }

    // ==================== MY PUBLISHED ====================

    @GetMapping("/my-published")
    @Operation(summary = "Get my published content", description = "Get all content you have submitted to the community")
    public ResponseEntity<List<CommunityItemDTO>> getMyPublished(Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        String tenantId = TenantContext.getCurrentTenant();
        List<CommunityItemDTO> items = communityService.getMyPublished(currentUser.getId(), tenantId);
        return ResponseEntity.ok(items);
    }

    // ==================== ADMIN MODERATION ====================

    @GetMapping("/admin/pending")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Get pending items", description = "Get items awaiting moderation (Admin only)")
    public ResponseEntity<Page<CommunityItemDTO>> getPendingItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CommunityItemDTO> items = communityService.getPendingItems(pageable);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/admin/pending/count")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Get pending count", description = "Get count of items awaiting moderation")
    public ResponseEntity<Map<String, Long>> getPendingCount() {
        long count = communityService.getPendingCount();
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PostMapping("/admin/approve/{itemId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Approve item", description = "Approve a pending item for publication (Admin only)")
    public ResponseEntity<CommunityItemDTO> approveItem(@PathVariable String itemId) {
        CommunityItem item = communityService.approveItem(itemId);
        return ResponseEntity.ok(CommunityItemDTO.fromEntity(item, Map.of()));
    }

    @PostMapping("/admin/reject/{itemId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Reject item", description = "Reject a pending item with a reason (Admin only)")
    public ResponseEntity<CommunityItemDTO> rejectItem(
            @PathVariable String itemId,
            @RequestBody CommunityRejectRequest request
    ) {
        CommunityItem item = communityService.rejectItem(itemId, request.reason());
        return ResponseEntity.ok(CommunityItemDTO.fromEntity(item, Map.of()));
    }

    // ==================== HELPER ====================

    private User getCurrentUser(Authentication authentication) {
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }
}
