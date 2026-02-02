package com.eduflex.backend.service;

import com.eduflex.backend.service.ai.EduAIService;

import com.eduflex.backend.model.*;
import com.eduflex.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FlashcardService {

    private final FlashcardDeckRepository deckRepository;
    private final FlashcardRepository cardRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final EduAIService eduAIService;

    public FlashcardService(FlashcardDeckRepository deckRepository,
            FlashcardRepository cardRepository,
            CourseRepository courseRepository,
            LessonRepository lessonRepository,
            UserRepository userRepository,
            EduAIService eduAIService) {
        this.deckRepository = deckRepository;
        this.cardRepository = cardRepository;
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
        this.userRepository = userRepository;
        this.eduAIService = eduAIService;
    }

    public List<FlashcardDeck> getDecksForUser(Long userId) {
        return deckRepository.findByUserId(userId);
    }

    public FlashcardDeck getDeck(Long deckId) {
        return deckRepository.findById(deckId).orElseThrow(() -> new RuntimeException("Deck not found"));
    }

    @Transactional
    public FlashcardDeck generateDeckFromCourse(Long courseId, Long userId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Kursen hittades inte."));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Användaren hittades inte."));

        // 1. Aggregate Content
        List<Lesson> lessons = lessonRepository.findByCourseIdOrderBySortOrderAsc(courseId);
        StringBuilder contentBuilder = new StringBuilder();

        if (lessons != null && !lessons.isEmpty()) {
            contentBuilder.append("--- KURSMATERIAL (LEKTIONER) ---\n");
            int lessonCount = 0;
            for (Lesson lesson : lessons) {
                if (lessonCount > 10)
                    break; // Increased from 5
                contentBuilder.append("Lektion: ").append(lesson.getTitle()).append("\n");
                if (lesson.getContent() != null) {
                    contentBuilder.append(lesson.getContent()).append("\n\n");
                }
                lessonCount++;
            }
        }

        // Fallback or Addition: Course Description
        if (course.getDescription() != null && !course.getDescription().isBlank()) {
            contentBuilder.append("--- KURSBESKRIVNING ---\n");
            contentBuilder.append(course.getDescription()).append("\n\n");
        }

        // Fallback or Addition: Material titles/content
        List<CourseMaterial> materials = course.getMaterials();
        if (materials != null && !materials.isEmpty()) {
            contentBuilder.append("--- ÖVRIGT MATERIAL ---\n");
            for (CourseMaterial mat : materials) {
                contentBuilder.append("Material: ").append(mat.getTitle()).append("\n");
                if (mat.getContent() != null && !mat.getContent().isBlank()) {
                    contentBuilder.append(mat.getContent()).append("\n");
                }
            }
        }

        // Fallback: Tags
        if (course.getTags() != null && !course.getTags().isBlank()) {
            contentBuilder.append("--- TAGGAR / ÄMNEN ---\n");
            contentBuilder.append(course.getTags()).append("\n\n");
        }

        String context = contentBuilder.toString();
        if (context.trim().isEmpty()) {
            throw new RuntimeException(
                    "Kunde inte hitta tillräckligt med innehåll i kursen för att skapa flashcards. Lägg till lektioner eller en kursbeskrivning.");
        }

        // 2. Generate Q/A pairs via Gemini
        String prompt = "Du är en AI-lärare. Skapa 10 pedagogiska flashcards (fråga/svar) baserat på följande kursinnehåll. "
                +
                "Svara STRICTLY med en JSON-lista av objekt med 'front' och 'back' nycklar. " +
                "Front ska vara en fråga eller ett koncept, Back ska vara svaret eller definitionen. " +
                "Håll svaren koncisa men informativa. Språk: Svenska.\n\nINNEHÅLL:\n" + context;

        String jsonResponse;
        try {
            jsonResponse = eduAIService.generateResponse(prompt);
        } catch (Exception e) {
            throw new RuntimeException("Gick inte att ansluta till AI-tjänsten (Gemini). Kontrollera API-nyckeln.");
        }

        List<FlashcardContent> parsedCards = parseFlashcardsFromJson(jsonResponse);
        if (parsedCards.isEmpty()) {
            throw new RuntimeException("AI-tjänsten returnerade inga giltiga flashcards. Försök igen.");
        }

        // 3. Save Deck
        FlashcardDeck deck = new FlashcardDeck();
        deck.setTitle(course.getName() + " - AI Deck");
        deck.setDescription("Auto-genererad från kursinnehåll.");
        deck.setCourse(course);
        deck.setUser(user);
        deck.setTotalCards(parsedCards.size());
        deck.setCardsDue(parsedCards.size());

        deck = deckRepository.save(deck);

        // 4. Save Cards
        List<Flashcard> cards = new ArrayList<>();
        for (FlashcardContent content : parsedCards) {
            Flashcard card = new Flashcard();
            card.setDeck(deck);
            card.setFront(content.front);
            card.setBack(content.back);
            card.setDifficulty("Medium");
            card.setLastReviewed(null);
            card.setNextReview(LocalDateTime.now()); // Due immediately
            card.setEaseFactor(2.5);
            card.setRepetitions(0);
            cards.add(card);
        }
        cardRepository.saveAll(cards);

        return deck;
    }

    @Transactional
    public void submitStudySession(Long deckId, List<CardReviewResult> results) {
        FlashcardDeck deck = deckRepository.findById(deckId).orElseThrow();

        for (CardReviewResult result : results) {
            Flashcard card = cardRepository.findById(result.cardId).orElseThrow();
            updateCardSpacedRepetition(card, result.quality);
            cardRepository.save(card);
        }

        deck.setLastStudiedAt(LocalDateTime.now());
        // Recalculate due cards
        long due = cardRepository.findByDeckId(deckId).stream()
                .filter(c -> c.getNextReview().isBefore(LocalDateTime.now()))
                .count();
        deck.setCardsDue((int) due);
        deckRepository.save(deck);
    }

    // SuperMemo-2 Algorithm implementation
    private void updateCardSpacedRepetition(Flashcard card, int quality) {
        // Quality: 0-5 (0=blackout, 5=perfect)

        if (quality >= 3) {
            if (card.getRepetitions() == 0) {
                card.setIntervalDays(1);
            } else if (card.getRepetitions() == 1) {
                card.setIntervalDays(6);
            } else {
                card.setIntervalDays((int) Math.round(card.getIntervalDays() * card.getEaseFactor()));
            }
            card.setRepetitions(card.getRepetitions() + 1);
            card.setLearned(true);
        } else {
            card.setRepetitions(0);
            card.setIntervalDays(1);
        }

        double newEaseFactor = card.getEaseFactor() + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (newEaseFactor < 1.3)
            newEaseFactor = 1.3;
        card.setEaseFactor(newEaseFactor);

        card.setLastReviewed(LocalDateTime.now());
        card.setNextReview(LocalDateTime.now().plusDays(card.getIntervalDays()));
    }

    // Helper classes
    public static class FlashcardContent {
        public String front;
        public String back;
    }

    public static class CardReviewResult {
        public Long cardId;
        public int quality; // 0-5
    }

    private List<FlashcardContent> parseFlashcardsFromJson(String json) {
        // Basic parser helper - in production use Jackson
        // This is a simplified regex/manual parser for the MVP if json is wrapped in MD
        // code blocks
        List<FlashcardContent> list = new ArrayList<>();
        try {
            String cleanJson = json.replace("```json", "").replace("```", "").trim();
            // This is risky without a real JSON lib, ideally injecting ObjectMapper.
            // But let's try a very simple approach or rely on ObjectMapper being available.
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            list = mapper.readValue(cleanJson,
                    new com.fasterxml.jackson.core.type.TypeReference<List<FlashcardContent>>() {
                    });
        } catch (Exception e) {
            System.err.println("Failed to parse Gemini JSON: " + e.getMessage());
            // Fallback: Return 1 error card
            FlashcardContent err = new FlashcardContent();
            err.front = "Error generating cards";
            err.back = "Please try again.";
            list.add(err);
        }
        return list;
    }
}
