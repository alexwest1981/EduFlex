package com.eduflex.backend.repository;
import com.eduflex.backend.model.ForumThread;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ForumThreadRepository extends JpaRepository<ForumThread, Long> {
    List<ForumThread> findByCourseIdOrderByCreatedAtDesc(Long courseId);
}