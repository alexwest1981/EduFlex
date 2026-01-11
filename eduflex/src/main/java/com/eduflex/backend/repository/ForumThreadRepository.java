package com.eduflex.backend.repository;

import com.eduflex.backend.model.ForumThread;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ForumThreadRepository extends JpaRepository<ForumThread, Long> {
    Page<ForumThread> findByCategoryIdOrderByCreatedAtDesc(Long categoryId, Pageable pageable);

    List<ForumThread> findByCourseIdOrderByCreatedAtDesc(Long courseId);

    List<ForumThread> findTop10ByOrderByCreatedAtDesc();
}