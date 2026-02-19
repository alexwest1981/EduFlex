package com.eduflex.backend.service.ai;

import com.eduflex.backend.model.Assignment;
import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.EduAIQuest;
import com.eduflex.backend.model.Lesson;
import com.eduflex.backend.model.Quiz;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.AssignmentRepository;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.EduAIQuestRepository;
import com.eduflex.backend.repository.LessonRepository;
import com.eduflex.backend.repository.QuizRepository;
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
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final QuizRepository quizRepository;
    private final AssignmentRepository assignmentRepository;
    private final com.eduflex.backend.service.GamificationService gamificationService;
    private final ObjectMapper objectMapper;

    public EduAIService(GeminiService geminiService, EduAIQuestRepository questRepository,
            UserRepository userRepository, CourseRepository courseRepository,
            LessonRepository lessonRepository, QuizRepository quizRepository,
            AssignmentRepository assignmentRepository,
            com.eduflex.backend.service.GamificationService gamificationService,
            ObjectMapper objectMapper) {
        this.geminiService = geminiService;
        this.questRepository = questRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
        this.quizRepository = quizRepository;
        this.assignmentRepository = assignmentRepository;
        this.gamificationService = gamificationService;
        this.objectMapper = objectMapper;
    }

    private static final String QUEST_SYSTEM_PROMPT = """
            Du är en Gamification Master och AI-Tutor för EduFlex.
            Din uppgift är att skapa engagerande "Quests" (uppdrag) för studenter baserat på deras kurser och lektioner.

            VIKTIGT:
            1. Skapa 3 unika uppdrag.
            2. Varje uppdrag ska ha en "narrative" (story) som gör det spännande.
            3. Du MÅSTE välja objectiveId från listan av tillgängliga lektioner/quiz nedan.
            4. Sätt rimliga XP-belöningar (50-500 XP).
            5. Du MÅSTE inkludera både 'courseId' och 'objectiveId' som NUMMER i JSON-svaret.

            FORMAT:
            Du MÅSTE svara med giltig JSON (ingen markdown):
            [
              {
                "title": "Titel på uppdraget",
                "narrative": "En kort, spännande berättelse...",
                "description": "Vad studenten faktiskt ska göra",
                "objectiveType": "LESSON", // Eller "QUIZ" eller "ASSIGNMENT"
                "objectiveId": 42,
                "courseId": 5,
                "rewardXp": 100
              }
            ]
            """;

    public List<EduAIQuest> generateQuests(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        // Hämta studentens kurser, lektioner och quiz
        List<Course> courses = courseRepository.findByStudentsId(userId);
        StringBuilder catalog = new StringBuilder();
        catalog.append("Student: ").append(user.getFullName()).append(" (Level ").append(user.getLevel())
                .append(")\n\n");

        if (courses.isEmpty()) {
            catalog.append("Studenten har inga kurser ännu.\n");
        } else {
            catalog.append("TILLGÄNGLIGA LEKTIONER OCH QUIZ:\n");
            for (Course course : courses) {
                catalog.append("\nKurs: \"").append(course.getName()).append("\" (courseId=").append(course.getId())
                        .append(")\n");

                List<Lesson> lessons = lessonRepository.findByCourseIdOrderBySortOrderAsc(course.getId());
                for (Lesson lesson : lessons) {
                    catalog.append("  - LESSON id=").append(lesson.getId()).append(": \"").append(lesson.getTitle())
                            .append("\"\n");
                }

                List<Quiz> quizzes = quizRepository.findByCourseId(course.getId());
                for (Quiz quiz : quizzes) {
                    catalog.append("  - QUIZ id=").append(quiz.getId()).append(": \"").append(quiz.getTitle())
                            .append("\"\n");
                }

                List<Assignment> assignments = assignmentRepository.findByCourseId(course.getId());
                for (Assignment assignment : assignments) {
                    catalog.append("  - ASSIGNMENT id=").append(assignment.getId()).append(": \"")
                            .append(assignment.getTitle()).append("\"\n");
                }
            }
        }

        String prompt = QUEST_SYSTEM_PROMPT + "\n\nKONTEXT:\n" + catalog;

        try {
            String jsonResponse = geminiService.generateResponse(prompt);
            jsonResponse = cleanJson(jsonResponse);

            logger.info("AI Response for Quests: {}", jsonResponse);

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

                // Hämta objectiveId och courseId från AI-svaret - hantera både String och
                // Number
                if (data.get("objectiveId") != null) {
                    Object objId = data.get("objectiveId");
                    if (objId instanceof Number) {
                        quest.setObjectiveId(((Number) objId).longValue());
                    } else if (objId instanceof String) {
                        try {
                            quest.setObjectiveId(Long.parseLong((String) objId));
                        } catch (Exception e) {
                            logger.warn("Failed to parse objectiveId from AI: {}", objId);
                        }
                    }
                }

                if (data.get("courseId") != null) {
                    Object cId = data.get("courseId");
                    if (cId instanceof Number) {
                        quest.setCourseId(((Number) cId).longValue());
                    } else if (cId instanceof String) {
                        try {
                            quest.setCourseId(Long.parseLong((String) cId));
                        } catch (Exception e) {
                            logger.warn("Failed to parse courseId from AI: {}", cId);
                        }
                    }
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

        // Award XP
        if (quest.getRewardXp() > 0) {
            gamificationService.addPoints(quest.getUserId(), quest.getRewardXp());
        }

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
