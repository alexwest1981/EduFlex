package com.eduflex.backend.repository;
import com.eduflex.backend.model.ForumCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ForumCategoryRepository extends JpaRepository<ForumCategory, Long> {
    List<ForumCategory> findByCourseId(Long courseId);
}