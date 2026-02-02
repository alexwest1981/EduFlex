package com.eduflex.backend.repository;

import com.eduflex.backend.model.UserLessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserLessonProgressRepository extends JpaRepository<UserLessonProgress, Long> {
    List<UserLessonProgress> findByUserId(Long userId);

    boolean existsByUserIdAndMaterialId(Long userId, Long materialId);

    void deleteByMaterialId(Long materialId);
}
