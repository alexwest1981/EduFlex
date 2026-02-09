package com.eduflex.backend.edugame.service;

import com.eduflex.backend.edugame.model.Quest;
import com.eduflex.backend.edugame.model.QuestTemplate;
import com.eduflex.backend.edugame.repository.QuestRepository;
import com.eduflex.backend.edugame.repository.QuestTemplateRepository;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Random;

@Service
public class QuestService {

    private final QuestRepository questRepository;
    private final QuestTemplateRepository questTemplateRepository;
    private final UserRepository userRepository;
    private final org.springframework.core.env.Environment environment;
    private final Random random = new Random();

    public QuestService(QuestRepository questRepository,
            QuestTemplateRepository questTemplateRepository,
            UserRepository userRepository,
            org.springframework.core.env.Environment environment) {
        this.questRepository = questRepository;
        this.questTemplateRepository = questTemplateRepository;
        this.userRepository = userRepository;
        this.environment = environment;
    }

    public List<Quest> getMyDailyQuests(Long userId) {
        // TODO: Ensure quests exist for today, else generate
        List<Quest> quests = questRepository.findByUserIdAndType(userId, Quest.QuestType.DAILY);
        if (quests.isEmpty()) {
            return generateDailyQuests(userId);
        }
        // Simple check if expired (logic can be improved)
        if (quests.get(0).getExpiresAt().isBefore(LocalDate.now())) {
            // In a real app, archive old ones and generate new.
            // For now, just return them or clear and regen.
            return quests;
        }
        return quests;
    }

    @Transactional
    public List<Quest> generateDailyQuests(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        List<QuestTemplate> templates = questTemplateRepository.findAll();

        if (templates.isEmpty()) {
            initTemplates(); // Fallback
            templates = questTemplateRepository.findAll();
        }

        Collections.shuffle(templates);
        List<QuestTemplate> selectedTemplates = templates.stream().limit(3).toList();

        for (QuestTemplate tmpl : selectedTemplates) {
            Quest quest = new Quest();
            quest.setUser(user);
            quest.setType(Quest.QuestType.DAILY);
            quest.setDescription(tmpl.getDescriptionTemplate());

            // Randomize target
            int target = random.nextInt(tmpl.getHiddenTargetCountMax() - tmpl.getHiddenTargetCountMin() + 1)
                    + tmpl.getHiddenTargetCountMin();
            quest.setTargetCount(target);
            quest.setTitle(tmpl.getTitleTemplate().replace("{count}", String.valueOf(target)));
            quest.setRewardXp(tmpl.getBaseRewardXp() * target);
            quest.setExpiresAt(LocalDate.now().atTime(23, 59, 59).toLocalDate()); // End of day

            questRepository.save(quest);
        }

        return questRepository.findByUserIdAndType(userId, Quest.QuestType.DAILY);
    }

    @PostConstruct
    public void initTemplates() {
        if (java.util.Arrays.asList(environment.getActiveProfiles()).contains("test")) {
            return;
        }
        if (questTemplateRepository.count() == 0) {
            QuestTemplate t1 = new QuestTemplate();
            t1.setTitleTemplate("Complete {count} Lesson(s)");
            t1.setDescriptionTemplate("Finish lessons to learn new things.");
            t1.setType(Quest.QuestType.DAILY);
            t1.setHiddenTargetCountMin(1);
            t1.setHiddenTargetCountMax(3);
            t1.setBaseRewardXp(50);
            t1.setActionKey("COMPLETE_LESSON");
            t1.setDifficulty(QuestTemplate.Difficulty.EASY);
            questTemplateRepository.save(t1);

            QuestTemplate t2 = new QuestTemplate();
            t2.setTitleTemplate("Score 100% on {count} Quiz(zes)");
            t2.setDescriptionTemplate("Show your mastery!");
            t2.setType(Quest.QuestType.DAILY);
            t2.setHiddenTargetCountMin(1);
            t2.setHiddenTargetCountMax(1);
            t2.setBaseRewardXp(100);
            t2.setActionKey("PERFECT_QUIZ");
            t2.setDifficulty(QuestTemplate.Difficulty.HARD);
            questTemplateRepository.save(t2);

            QuestTemplate t3 = new QuestTemplate();
            t3.setTitleTemplate("Login {count} time(s)");
            t3.setDescriptionTemplate("Just show up!");
            t3.setType(Quest.QuestType.DAILY);
            t3.setHiddenTargetCountMin(1);
            t3.setHiddenTargetCountMax(1);
            t3.setBaseRewardXp(10);
            t3.setActionKey("LOGIN");
            t3.setDifficulty(QuestTemplate.Difficulty.EASY);
            questTemplateRepository.save(t3);
        }
    }
}
