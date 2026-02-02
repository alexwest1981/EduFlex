package com.eduflex.backend.edugame.repository;

import com.eduflex.backend.edugame.model.QuestTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestTemplateRepository extends JpaRepository<QuestTemplate, Long> {
    List<QuestTemplate> findByDifficulty(QuestTemplate.Difficulty difficulty);
}
