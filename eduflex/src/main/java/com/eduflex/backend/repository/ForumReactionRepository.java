package com.eduflex.backend.repository;

import com.eduflex.backend.model.ForumReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ForumReactionRepository extends JpaRepository<ForumReaction, Long> {
    List<ForumReaction> findByPostId(Long postId);

    Optional<ForumReaction> findByPostIdAndUserId(Long postId, Long userId);
}
