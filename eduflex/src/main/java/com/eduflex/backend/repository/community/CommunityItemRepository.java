package com.eduflex.backend.repository.community;

import com.eduflex.backend.model.community.CommunityItem;
import com.eduflex.backend.model.community.CommunitySubject;
import com.eduflex.backend.model.community.ContentType;
import com.eduflex.backend.model.community.PublishStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityItemRepository extends JpaRepository<CommunityItem, String> {

    // === Browse with pagination ===

    Page<CommunityItem> findByStatusOrderByPublishedAtDesc(PublishStatus status, Pageable pageable);

    Page<CommunityItem> findByStatusOrderByDownloadCountDesc(PublishStatus status, Pageable pageable);

    Page<CommunityItem> findByStatusOrderByAverageRatingDesc(PublishStatus status, Pageable pageable);

    // === Filter by subject ===

    Page<CommunityItem> findByStatusAndSubjectOrderByPublishedAtDesc(
            PublishStatus status, CommunitySubject subject, Pageable pageable);

    Page<CommunityItem> findByStatusAndSubjectOrderByDownloadCountDesc(
            PublishStatus status, CommunitySubject subject, Pageable pageable);

    Page<CommunityItem> findByStatusAndSubjectOrderByAverageRatingDesc(
            PublishStatus status, CommunitySubject subject, Pageable pageable);

    // === Filter by content type ===

    Page<CommunityItem> findByStatusAndContentTypeOrderByPublishedAtDesc(
            PublishStatus status, ContentType contentType, Pageable pageable);

    Page<CommunityItem> findByStatusAndContentTypeOrderByDownloadCountDesc(
            PublishStatus status, ContentType contentType, Pageable pageable);

    Page<CommunityItem> findByStatusAndContentTypeOrderByAverageRatingDesc(
            PublishStatus status, ContentType contentType, Pageable pageable);

    // === Combined filters ===

    Page<CommunityItem> findByStatusAndSubjectAndContentTypeOrderByPublishedAtDesc(
            PublishStatus status, CommunitySubject subject, ContentType contentType, Pageable pageable);

    Page<CommunityItem> findByStatusAndSubjectAndContentTypeOrderByDownloadCountDesc(
            PublishStatus status, CommunitySubject subject, ContentType contentType, Pageable pageable);

    Page<CommunityItem> findByStatusAndSubjectAndContentTypeOrderByAverageRatingDesc(
            PublishStatus status, CommunitySubject subject, ContentType contentType, Pageable pageable);

    // === Full-text search ===

    @Query("SELECT c FROM CommunityItem c WHERE c.status = :status AND " +
            "(LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.authorName) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<CommunityItem> searchByQuery(@Param("status") PublishStatus status,
                                       @Param("query") String query, Pageable pageable);

    // === My published items ===

    List<CommunityItem> findByAuthorUserIdAndAuthorTenantIdOrderByCreatedAtDesc(
            Long authorUserId, String authorTenantId);

    // === Admin: Pending moderation ===

    Page<CommunityItem> findByStatusOrderByCreatedAtAsc(PublishStatus status, Pageable pageable);

    long countByStatus(PublishStatus status);

    // === Statistics ===

    @Query("SELECT c.subject, COUNT(c) FROM CommunityItem c WHERE c.status = :status GROUP BY c.subject")
    List<Object[]> countBySubject(@Param("status") PublishStatus status);
}
