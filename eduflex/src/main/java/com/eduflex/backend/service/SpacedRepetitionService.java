package com.eduflex.backend.service;

import com.eduflex.backend.model.Flashcard;
import com.eduflex.backend.model.User;
import com.eduflex.backend.model.UserFlashcardProgress;
import com.eduflex.backend.repository.FlashcardRepository;
import com.eduflex.backend.repository.UserFlashcardProgressRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SpacedRepetitionService {

    private static final Logger logger = LoggerFactory.getLogger(SpacedRepetitionService.class);
    private final UserFlashcardProgressRepository progressRepository;
    private final FlashcardRepository flashcardRepository;
    private final GamificationService gamificationService;

    public SpacedRepetitionService(UserFlashcardProgressRepository progressRepository,
            FlashcardRepository flashcardRepository,
            GamificationService gamificationService) {
        this.progressRepository = progressRepository;
        this.flashcardRepository = flashcardRepository;
        this.gamificationService = gamificationService;
    }

    /**
     * Updates flashcard progress using the SM-2 algorithm.
     * 
     * @param user    The user studying
     * @param card    The flashcard studied
     * @param quality Quality score (0-5)
     * @return Updated progress
     */
    @Transactional
    public UserFlashcardProgress updateProgress(User user, Flashcard card, int quality) {
        UserFlashcardProgress progress = progressRepository.findByUserAndFlashcard(user, card)
                .orElseGet(() -> {
                    UserFlashcardProgress newProgress = new UserFlashcardProgress();
                    newProgress.setUser(user);
                    newProgress.setFlashcard(card);
                    return newProgress;
                });

        // 1. Update Ease Factor (EF)
        // EF' := EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        double oldEf = progress.getEaseFactor();
        double newEf = oldEf + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (newEf < 1.3)
            newEf = 1.3;
        progress.setEaseFactor(newEf);

        // 2. Update Interval and Repetitions
        int repetitions = progress.getRepetitions();
        int interval;

        if (quality >= 3) {
            // Success
            if (repetitions == 0) {
                interval = 1;
            } else if (repetitions == 1) {
                interval = 6;
            } else {
                interval = (int) Math.round(progress.getIntervalDays() * newEf);
            }
            progress.setRepetitions(repetitions + 1);

            // Reward XP for successful review
            gamificationService.addPoints(user.getId(), 5 + quality);
        } else {
            // Fail - Reset repetitions and interval
            repetitions = 0;
            interval = 1;
            progress.setRepetitions(0);
        }

        progress.setIntervalDays(interval);
        progress.setNextReview(LocalDateTime.now().plusDays(interval));
        progress.setLastReviewed(LocalDateTime.now());

        if (quality == 5 && repetitions > 5) {
            progress.setLearned(true);
        }

        logger.info("SM-2 Update: User={}, Card={}, Quality={}, NextReview={}, NewEF={}",
                user.getId(), card.getId(), quality, progress.getNextReview(), newEf);

        return progressRepository.save(progress);
    }

    public List<Flashcard> getDueCards(User user) {
        List<Flashcard> dueCards = progressRepository.findDueReviews(user, LocalDateTime.now())
                .stream()
                .map(UserFlashcardProgress::getFlashcard)
                .collect(Collectors.toList());

        List<Flashcard> newCards = flashcardRepository.findNewCardsForUser(user);

        dueCards.addAll(newCards);
        return dueCards;
    }

    public long getDueCount(User user) {
        long dueCount = progressRepository.countDueReviews(user, LocalDateTime.now());
        long newCount = flashcardRepository.countNewCardsForUser(user);
        return dueCount + newCount;
    }
}
