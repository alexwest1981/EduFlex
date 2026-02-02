package com.eduflex.backend.edugame.repository;

import com.eduflex.backend.edugame.model.Quest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestRepository extends JpaRepository<Quest, Long> {
    List<Quest> findByUserIdAndIsCompletedFalse(Long userId);

    List<Quest> findByUserIdAndType(Long userId, Quest.QuestType type);
}
