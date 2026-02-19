package com.eduflex.backend.service;

import com.eduflex.backend.model.*;
import com.eduflex.backend.repository.*;
import com.eduflex.backend.service.ai.EduAIService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class StudyCoachService {

    private static final Logger logger = LoggerFactory.getLogger(StudyCoachService.class);
    private final EduAIService eduAIService;
    private final CoachRecommendationRepository recommendationRepository;
    private final UserFlashcardProgressRepository flashcardProgressRepository;
    private final QuizResultRepository quizResultRepository;
    private final AttendanceRepository attendanceRepository;
    private final ObjectMapper objectMapper;

    public StudyCoachService(EduAIService eduAIService,
            CoachRecommendationRepository recommendationRepository,
            UserFlashcardProgressRepository flashcardProgressRepository,
            QuizResultRepository quizResultRepository,
            AttendanceRepository attendanceRepository,
            ObjectMapper objectMapper) {
        this.eduAIService = eduAIService;
        this.recommendationRepository = recommendationRepository;
        this.flashcardProgressRepository = flashcardProgressRepository;
        this.quizResultRepository = quizResultRepository;
        this.attendanceRepository = attendanceRepository;
        this.objectMapper = objectMapper;
    }

    public CoachRecommendation generateRecommendation(User user) {
        // 1. Gather context
        long dueCards = flashcardProgressRepository.countDueReviews(user, LocalDateTime.now());
        List<QuizResult> recentQuizzes = quizResultRepository.findTop5ByStudentIdOrderByDateDesc(user.getId());
        long absences = attendanceRepository.countByStudentIdAndIsPresent(user.getId(), false);

        StringBuilder context = new StringBuilder();
        context.append("Elev: ").append(user.getFirstName()).append("\n");
        context.append("Flashcards att repetera: ").append(dueCards).append("\n");
        context.append("Antal frånvarotillfällen: ").append(absences).append("\n");

        if (!recentQuizzes.isEmpty()) {
            context.append("Senaste Quiz-resultat:\n");
            for (QuizResult res : recentQuizzes) {
                context.append("- ").append(res.getQuiz().getTitle())
                        .append(": ").append(res.getScore()).append("/").append(res.getMaxScore()).append("\n");
            }
        }

        // 2. Prompt Gemini
        String prompt = "Du är en personlig AI-studiecoach 'EduAI' för en elev i grundskolan/gymnasiet. " +
                "Baserat på elevens data, ge ett konkret 'Next Best Action' råd för idag. " +
                "Håll tonen uppmuntra, pedagogisk och använd ett språk som en 12-åring förstår (men inte nedlåtande). "
                +
                "Fokusera på att minska stress och ge små, hanterbara steg. " +
                "Svara STRICTLY med en JSON-lista av ett objekt med fälten: 'type', 'content', 'actionUrl'. " +
                "Möjliga typer: 'DAILY_TIP', 'NEXT_ACTION', 'ENCOURAGEMENT'.\n\n" +
                "DATA:\n" + context.toString();

        try {
            String response = eduAIService.generateResponse(prompt);
            String cleanJson = response.replace("```json", "").replace("```", "").trim();

            // Handle both array and single object wrapper if AI is inconsistent
            RecommendationDto dto;
            if (cleanJson.startsWith("[")) {
                RecommendationDto[] dtos = objectMapper.readValue(cleanJson, RecommendationDto[].class);
                dto = dtos[0];
            } else {
                dto = objectMapper.readValue(cleanJson, RecommendationDto.class);
            }

            CoachRecommendation rec = new CoachRecommendation();
            rec.setUser(user);
            rec.setType(dto.type);
            rec.setContent(dto.content);
            rec.setActionUrl(dto.actionUrl != null ? dto.actionUrl : "/dashboard");
            rec.setExpiresAt(LocalDateTime.now().plusHours(24));

            return recommendationRepository.save(rec);
        } catch (Exception e) {
            logger.error("Failed to generate coach recommendation for user {}: {}", user.getId(), e.getMessage());
            return createFallbackRecommendation(user);
        }
    }

    private CoachRecommendation createFallbackRecommendation(User user) {
        CoachRecommendation rec = new CoachRecommendation();
        rec.setUser(user);
        rec.setType("ENCOURAGEMENT");
        rec.setContent(
                "Hej! Bra jobbat idag. Glöm inte att ta en paus mellan dina studier för att hålla energin uppe! 🚀");
        rec.setActionUrl("/dashboard");
        return recommendationRepository.save(rec);
    }

    public List<CoachRecommendation> getActiveRecommendations(User user) {
        return recommendationRepository.findByUserAndIsReadOrderByCreatedAtDesc(user, false);
    }

    private static class RecommendationDto {
        public String type;
        public String content;
        public String actionUrl;
    }
}
