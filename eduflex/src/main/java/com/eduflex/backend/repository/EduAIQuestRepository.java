package com.eduflex.backend.repository;

import com.eduflex.backend.model.EduAIQuest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EduAIQuestRepository extends JpaRepository<EduAIQuest, Long> {
    List<EduAIQuest> findByUserIdAndIsCompletedFalse(Long userId);

    List<EduAIQuest> findByUserId(Long userId);
}
