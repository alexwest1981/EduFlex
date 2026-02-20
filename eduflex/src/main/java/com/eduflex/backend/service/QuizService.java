package com.eduflex.backend.service;

import com.eduflex.backend.model.*;
import com.eduflex.backend.repository.*;
import com.eduflex.backend.dto.LtiScoreDTO;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizResultRepository resultRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    // NYTT: Injicera GamificationService och StudentActivityService
    private final GamificationService gamificationService;
    private final StudentActivityService studentActivityService;
    private final com.eduflex.backend.service.ai.EduAIService eduAIService;
    private final LtiAgsService ltiAgsService;
    private final LtiLaunchRepository ltiLaunchRepository;
    private final EduAiHubService eduAiHubService;

    public QuizService(QuizRepository quizRepository,
            QuizResultRepository resultRepository,
            CourseRepository courseRepository,
            UserRepository userRepository,
            GamificationService gamificationService,
            StudentActivityService studentActivityService,
            com.eduflex.backend.service.ai.EduAIService eduAIService,
            LtiAgsService ltiAgsService,
            LtiLaunchRepository ltiLaunchRepository,
            EduAiHubService eduAiHubService) {
        this.quizRepository = quizRepository;
        this.resultRepository = resultRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.gamificationService = gamificationService;
        this.studentActivityService = studentActivityService;
        this.eduAIService = eduAIService;
        this.ltiAgsService = ltiAgsService;
        this.ltiLaunchRepository = ltiLaunchRepository;
        this.eduAiHubService = eduAiHubService;
    }

    public List<Quiz> getQuizzesByCourse(Long courseId) {
        return quizRepository.findByCourseId(courseId);
    }

    public Quiz createQuiz(Long courseId, Quiz quizData) {
        Course course = courseRepository.findById(courseId).orElseThrow();
        quizData.setCourse(course);

        if (quizData.getQuestions() != null) {
            for (Question q : quizData.getQuestions()) {
                q.setQuiz(quizData);
                if (q.getOptions() != null) {
                    for (Option o : q.getOptions()) {
                        o.setQuestion(q);
                    }
                }
            }
        }
        return quizRepository.save(quizData);
    }

    public Quiz updateQuiz(Long id, Quiz quizData) {
        Quiz existingQuiz = quizRepository.findById(id).orElseThrow();
        existingQuiz.setTitle(quizData.getTitle());
        existingQuiz.setDescription(quizData.getDescription());

        if (existingQuiz.getQuestions() != null) {
            existingQuiz.getQuestions().clear();
        }

        if (quizData.getQuestions() != null) {
            for (Question q : quizData.getQuestions()) {
                q.setQuiz(existingQuiz);
                if (q.getOptions() != null) {
                    for (Option o : q.getOptions()) {
                        o.setQuestion(q);
                    }
                }
                existingQuiz.getQuestions().add(q);
            }
        }
        return quizRepository.save(existingQuiz);
    }

    public QuizResult submitQuiz(Long quizId, Long studentId, Map<Long, Long> answers) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow();
        User student = userRepository.findById(studentId).orElseThrow();

        int score = 0;
        int maxScore = quiz.getQuestions() != null ? quiz.getQuestions().size() : 0;

        if (quiz.getQuestions() != null) {
            for (Question q : quiz.getQuestions()) {
                Long selectedOptionId = answers.get(q.getId());
                if (selectedOptionId != null && q.getOptions() != null) {
                    boolean isCorrect = q.getOptions().stream()
                            .anyMatch(o -> o.getId().equals(selectedOptionId) && o.isCorrect());
                    if (isCorrect)
                        score++;
                }
            }
        }

        // Spara resultatet
        QuizResult result = new QuizResult();
        result.setQuiz(quiz);
        result.setStudent(student);
        result.setScore(score);
        result.setMaxScore(maxScore);

        QuizResult savedResult = resultRepository.save(result);

        // LOGGA AKTIVITET FÖR AI
        studentActivityService.logActivity(studentId, quiz.getCourse().getId(), null,
                StudentActivityLog.ActivityType.QUIZ_ATTEMPT,
                String.format("Genomförde quiz: %s. Resultat: %d/%d", quiz.getTitle(), score, maxScore));

        // --- GAMIFICATION TRIGGERS ---
        // Ge 10 poäng per rätt svar
        if (score > 0) {
            gamificationService.addPoints(studentId, score * 10);
        }

        // Bonus: Om man fick alla rätt, ge en Badge (ID 2 = "Quiz Master" som vi
        // skapade i init)
        if (score == maxScore && maxScore > 0) {
            // Ge extra 50 bonuspoäng för perfekt resultat
            gamificationService.addPoints(studentId, 50);

            // Dela ut utmärkelse (Hårdkodat ID 2 för detta exempel)
            gamificationService.awardBadge(studentId, 2L);
        }
        // -----------------------------

        // --- EDUAI TRIGGER ---
        eduAIService.checkAndCompleteQuest(studentId, com.eduflex.backend.model.EduAIQuest.QuestObjectiveType.QUIZ,
                quizId);

        // Add to Spaced Repetition Hub
        eduAiHubService.addKnowledgeFragment(student, quiz.getTitle(), quiz.getDescription(), "QUIZ", quizId);
        // ---------------------

        // --- LTI ADVANTAGE AGS: Post Grade ---
        try {
            // Find LTI Launch for this student and this quiz
            // We search for launches where targetLinkUri contains this quiz ID
            String quizIdStr = "/quiz/" + quizId;
            Optional<LtiLaunch> launchOpt = ltiLaunchRepository.findAll().stream()
                    .filter(l -> l.getUser() != null && l.getUser().getId().equals(studentId))
                    .filter(l -> l.getTargetLinkUri() != null && l.getTargetLinkUri().contains(quizIdStr))
                    .findFirst();

            if (launchOpt.isPresent()) {
                LtiLaunch launch = launchOpt.get();
                if (launch.getAgsLineItemUrl() != null && !launch.getAgsLineItemUrl().isEmpty()) {
                    LtiScoreDTO ltiScore = LtiScoreDTO.builder()
                            .userId(launch.getUserSub())
                            .scoreGiven((double) score)
                            .scoreMaximum((double) maxScore)
                            .activityProgress("Completed")
                            .gradingProgress("FullyGraded")
                            .timestamp(java.time.Instant.now().toString())
                            .build();

                    ltiAgsService.postScore(launch.getPlatformIssuer(), launch.getAgsLineItemUrl(), ltiScore);
                }
            }
        } catch (Exception ex) {
            // Log but don't fail the submission
            System.err.println("Failed to post LTI score: " + ex.getMessage());
        }
        // -------------------------------------

        return savedResult;
    }

    public void deleteQuiz(Long id) {
        quizRepository.deleteById(id);
    }
}