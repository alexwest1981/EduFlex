package com.eduflex.backend.repository;
import com.eduflex.backend.model.ForumPost;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ForumPostRepository extends JpaRepository<ForumPost, Long> {
    List<ForumPost> findByThreadIdOrderByCreatedAtAsc(Long threadId);
}