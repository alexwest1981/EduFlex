package com.eduflex.backend.repository;

import com.eduflex.backend.model.AiSessionResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiSessionResultRepository extends JpaRepository<AiSessionResult, Long> {

        List<AiSessionResult> findByUserId(Long userId);

        List<AiSessionResult> findByCourseId(Long courseId);

        List<AiSessionResult> findByUserIdAndCourseIdAndSessionTypeOrderByCreatedAtDesc(Long userId, Long courseId,
                        String sessionType);

        AiSessionResult findFirstByUserIdAndCourseIdAndSessionTypeOrderByCreatedAtDesc(Long userId, Long courseId,
                        String sessionType);
}
