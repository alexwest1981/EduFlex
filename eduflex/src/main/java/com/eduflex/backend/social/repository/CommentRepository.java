package com.eduflex.backend.social.repository;

import com.eduflex.backend.social.model.Comment;
import com.eduflex.backend.social.model.TargetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // Fetch only top-level comments (roots) for a specific target
    List<Comment> findByTargetTypeAndTargetIdAndParentIsNullOrderByCreatedAtDesc(TargetType targetType,
            String targetId);

    // Count comments for a target
    long countByTargetTypeAndTargetId(TargetType targetType, String targetId);
}
