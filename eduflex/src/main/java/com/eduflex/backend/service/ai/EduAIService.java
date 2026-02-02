package com.eduflex.backend.service.ai;

import com.eduflex.backend.model.EduAIQuest;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.EduAIQuestRepository;
import com.eduflex.backend.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class EduAIService {

    private static final Logger logger = LoggerFactory.getLogger(EduAIService.class);

    private final GeminiService geminiService;
    private final EduAIQuestRepository questRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public EduAIService(GeminiService geminiService, EduAIQuestRepository questRepository,
            UserRepository userRepository, ObjectMapper objectMapper) {
        this.geminiService = geminiService;
        this.questRepository = questRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    private static final String QUEST_SYSTEM_PROMPT = """
            Du är en Gamification Master och AI-Tutor för EduFlex.
            Din uppgift är att skapa engagerande "Quests" (uppdrag) för studenter baserat på deras profil.

            VIKTIGT:
            1. Skapa 3 unika uppdrag.
            2. Varje uppdrag ska ha en "narrative" (story) som gör det spännande.
            3. Koppla uppdraget till en typ av aktivitet (LESSON, QUIZ, ASSIGNMENT).
            4. Sätt rimliga XP-belöningar (50-500 XP).

            FORMAT:
            Du MÅSTE svara med giltig JSON (ingen markdown):
            [
              {
                "title": "Titel på uppdraget",
                "narrative": "En kort, spännande berättelse...",
                "description": "Vad studenten faktiskt ska göra (t.ex. 'Klara modulen om Java')",
                "objectiveType": "LESSON",
                "rewardXp": 100
              }
            ]
            """;

    public List<EduAIQuest> generateQuests(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        // Bygg prompt med studentens info (här kan vi lägga till mer data om kurser
        // etc.)
        String userContext = "Student: " + user.getFullName() + " (Level " + user.getLevel() + ")";
        String prompt = QUEST_SYSTEM_PROMPT + "\n\nKONTEXT:\n" + userContext;

        try {
            // Använd GeminiService för att generera JSON
            String jsonResponse = geminiService.generateResponse(prompt);

            // Städa JSON från markdown om det finns
            jsonResponse = cleanJson(jsonResponse);

            List<Map<String, Object>> questDataList = objectMapper.readValue(jsonResponse, new TypeReference<>() {
            });
            List<EduAIQuest> newQuests = new ArrayList<>();

            for (Map<String, Object> data : questDataList) {
                EduAIQuest quest = new EduAIQuest();
                quest.setUserId(userId);
                quest.setTitle((String) data.get("title"));
                quest.setNarrative((String) data.get("narrative"));
                quest.setDescription((String) data.get("description"));

                String typeStr = (String) data.get("objectiveType");
                try {
                    quest.setObjectiveType(EduAIQuest.QuestObjectiveType.valueOf(typeStr.toUpperCase()));
                } catch (Exception e) {
                    quest.setObjectiveType(EduAIQuest.QuestObjectiveType.CUSTOM);
                }

                quest.setRewardXp((Integer) data.get("rewardXp"));
                quest.setCompleted(false);

                newQuests.add(questRepository.save(quest));
            }

            return newQuests;

        } catch (Exception e) {
            logger.error("Failed to generate EduAI quests", e);
            throw new RuntimeException("Could not generate quests");
        }
    }

    // Metod som anropas av andra services (Quiz, Assignment, Lesson) när en
    // aktivitet slutförs
    public void checkAndCompleteQuest(Long userId, EduAIQuest.QuestObjectiveType type, Long objectiveId) {
        List<EduAIQuest> activeQuests = questRepository.findByUserIdAndIsCompletedFalse(userId);

        for (EduAIQuest quest : activeQuests) {
            if (quest.getObjectiveType() == type &&
                    (quest.getObjectiveId() == null || quest.getObjectiveId().equals(objectiveId))) {

                completeQuest(quest.getId());
                logger.info("Auto-completed EduAI quest {} for user {} based on activity", quest.getId(), userId);
            }
        }
    }

    public List<EduAIQuest> getActiveQuests(Long userId) {
        return questRepository.findByUserIdAndIsCompletedFalse(userId);
    }

    public EduAIQuest completeQuest(Long questId) {
        EduAIQuest quest = questRepository.findById(questId).orElseThrow();
        // Förhindra dubbla completions
        if (quest.isCompleted()) {
            return quest;
        }

        quest.setCompleted(true);
        quest.setCompletedAt(LocalDateTime.now());
        questRepository.save(quest);

        // Det är bättre att anropa gamificationService härifrån om möjligt,
        // annars får controllern göra det. Men för auto-completion måste vi göra det
        // här.
        // Vi behöver injicera GamificationService i denna Service (circular dependency
        // risk, se upp!)

        return quest;
    }

    private String cleanJson(String response) {
        if (response == null)
            return "[]";
        response = response.trim();
        if (response.startsWith("```json")) {
            response = response.substring(7);
        } else if (response.startsWith("```")) {
            response = response.substring(3);
        }
        if (response.endsWith("```")) {
            response = response.substring(0, response.length() - 3);
        }
        return response.trim();
    }

    public String generateResponse(String prompt) {
        return geminiService.generateResponse(prompt);
    }
}
