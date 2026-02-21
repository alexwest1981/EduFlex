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
import com.eduflex.backend.repository.SubmissionRepository;
import com.eduflex.backend.model.Submission;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.eduflex.backend.repository.AiSessionResultRepository;
import com.eduflex.backend.model.AiSessionResult;

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
    private final SubmissionRepository submissionRepository;
    private final AiSessionResultRepository aiSessionResultRepository;

    public EduAIService(GeminiService geminiService, EduAIQuestRepository questRepository,
            UserRepository userRepository, CourseRepository courseRepository,
            LessonRepository lessonRepository, QuizRepository quizRepository,
            AssignmentRepository assignmentRepository,
            com.eduflex.backend.service.GamificationService gamificationService,
            ObjectMapper objectMapper,
            SubmissionRepository submissionRepository,
            AiSessionResultRepository aiSessionResultRepository) {
        this.geminiService = geminiService;
        this.questRepository = questRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
        this.quizRepository = quizRepository;
        this.assignmentRepository = assignmentRepository;
        this.gamificationService = gamificationService;
        this.objectMapper = objectMapper;
        this.submissionRepository = submissionRepository;
        this.aiSessionResultRepository = aiSessionResultRepository;
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
                List<Submission> userSubmissions = submissionRepository.findByStudentId(userId);
                for (Assignment assignment : assignments) {
                    boolean hasSubmitted = userSubmissions.stream()
                            .anyMatch(s -> s.getAssignment().getId().equals(assignment.getId()));
                    if (!hasSubmitted) {
                        catalog.append("  - ASSIGNMENT id=").append(assignment.getId()).append(": \"")
                                .append(assignment.getTitle()).append("\"\n");
                    }
                }
            }
        }

        // Lägg till evighetsuppdrag så AI:n alltid har något att generera!
        catalog.append("\nALLTID TILLGÄNGLIGA REPETITIONS-UPPDRAG (Välj dessa om studenten gjort allt annat):\n");
        catalog.append(
                "  - REVISION: \"Spela en runda Time Attack\" (Bygg en story, sätt objectiveType=CUSTOM, objectiveId=1, courseId=0)\n");
        catalog.append(
                "  - REVISION: \"Spela en runda Memory Match\" (Bygg en story, sätt objectiveType=CUSTOM, objectiveId=2, courseId=0)\n");
        catalog.append(
                "  - REVISION: \"Generera och öva på Flashcards\" (Bygg en story, sätt objectiveType=CUSTOM, objectiveId=3, courseId=0)\n");

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
        // Hämta både aktiva OCH slutförda uppdrag från senaste 24 timmarna så eleven
        // kan se sina framsteg
        LocalDateTime yesterday = LocalDateTime.now().minusHours(24);
        List<EduAIQuest> allRecent = questRepository.findByUserId(userId);
        List<Submission> userSubmissions = submissionRepository.findByStudentId(userId);

        // Retroactively complete assignment quests that got graded
        boolean updatedAny = false;
        for (EduAIQuest q : allRecent) {
            if (!q.isCompleted() && q.getObjectiveType() == EduAIQuest.QuestObjectiveType.ASSIGNMENT) {
                boolean isGraded = userSubmissions.stream()
                        .anyMatch(s -> s.getAssignment().getId().equals(q.getObjectiveId())
                                && s.getGrade() != null && !s.getGrade().trim().isEmpty());
                if (isGraded) {
                    completeQuest(q.getId());
                    updatedAny = true;
                }
            }
        }

        // Fetch fresh if anything was updated
        if (updatedAny) {
            allRecent = questRepository.findByUserId(userId);
        }

        return allRecent.stream()
                .filter(q -> !q.isCompleted() || (q.getCompletedAt() != null && q.getCompletedAt().isAfter(yesterday)))
                .toList();
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

    private static final String SESSION_SYSTEM_PROMPT = """
            Du är en expert-tutor (lärare) för EduFlex. Din uppgift är att hålla en anpassad studiesession för en student baserat på valt ämne och typ av session (%s).

            Skapa ett djuplodande och engagerande studiematerial (Markdown-formaterat) samt 3-5 flervalsfrågor för att testa studentens kunskap efteråt.

            FORMAT:
            Du MÅSTE svara med GILTIG JSON (och ingen runtomkringliggande markdown som ```json):
            {
              "title": "Passande rubrik för sessionen",
              "material": "Här skriver du omfattande text i Markdown-format med rubriker (##), punktlistor och pedagogiska förklaringar. Ge dig hän! Bygg en riktig superlesson.",
              "questions": [
                {
                  "question": "Fråga 1?",
                  "options": ["Svar A", "Svar B", "Svar C", "Svar D"],
                  "correctAnswerIndex": 1
                }
              ]
            }
            """;

    public Map<String, Object> generateStudySession(Long userId, Long courseId, String sessionType) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        List<Course> courses = new ArrayList<>();
        if (courseId != null) {
            courseRepository.findById(courseId).ifPresent(courses::add);
        } else {
            courses = courseRepository.findByStudentsId(userId);
        }

        StringBuilder catalog = new StringBuilder();
        catalog.append("Student: ").append(user.getFullName()).append("\n");
        catalog.append("Typ av session: ").append(sessionType).append("\n\n");

        if (!courses.isEmpty()) {
            catalog.append("KURSINNEHÅLL (Använd detta som grund för ditt material):\n");
            for (Course course : courses) {
                catalog.append("Kurs: ").append(course.getName()).append("\n");
                List<Lesson> lessons = lessonRepository.findByCourseIdOrderBySortOrderAsc(course.getId());
                for (Lesson lesson : lessons) {
                    String excerpt = lesson.getContent() != null
                            ? (lesson.getContent().length() > 300 ? lesson.getContent().substring(0, 300) + "..."
                                    : lesson.getContent())
                            : "";
                    catalog.append(" - Lektion: ").append(lesson.getTitle()).append("\n   Utdrag: ").append(excerpt)
                            .append("\n");
                }
            }
        } else {
            catalog.append(
                    "Studenten har inga specifika kurser valda. Ge en allmän studieteknik- eller inspirationssession för en student.\n");
        }

        String prompt = String.format(SESSION_SYSTEM_PROMPT, sessionType) + "\n\nKONTEXT:\n" + catalog;

        try {
            String jsonResponse = geminiService.generateResponse(prompt);
            jsonResponse = cleanJson(jsonResponse);
            logger.info("Generated Study Session for user {}, sessionType {}", userId, sessionType);
            return objectMapper.readValue(jsonResponse, new TypeReference<>() {
            });
        } catch (Exception e) {
            logger.error("Failed to generate study session", e);
            throw new RuntimeException("Could not generate study session");
        }
    }

    public Map<String, Object> saveSessionResultAndGetImprovement(User user, Long courseId, String sessionType,
            Integer score, Integer maxScore) {
        // Hitta förra resultatet för denna specifika kombo
        AiSessionResult previousResult = aiSessionResultRepository
                .findFirstByUserIdAndCourseIdAndSessionTypeOrderByCreatedAtDesc(user.getId(), courseId, sessionType);

        Integer previousScore = null;
        Integer previousMaxScore = null;
        Integer improvement = null;

        if (previousResult != null) {
            previousScore = previousResult.getScore();
            previousMaxScore = previousResult.getMaxScore();
            // Jämför procentuellt
            double currentPercentage = maxScore > 0 ? (double) score / maxScore : 0;
            double prevPercentage = previousMaxScore > 0 ? (double) previousScore / previousMaxScore : 0;
            improvement = (int) Math.round((currentPercentage - prevPercentage) * 100);
        }

        // Spara nya resultatet
        AiSessionResult newResult = AiSessionResult.builder()
                .user(user)
                .courseId(courseId)
                .sessionType(sessionType)
                .score(score)
                .maxScore(maxScore)
                .createdAt(LocalDateTime.now())
                .build();
        aiSessionResultRepository.save(newResult);

        Map<String, Object> response = new HashMap<>();
        response.put("score", score);
        response.put("maxScore", maxScore);
        if (improvement != null) {
            response.put("improvementPercentage", improvement);
            response.put("previousScore", previousScore);
            response.put("previousMaxScore", previousMaxScore);
        }
        return response;
    }
}
