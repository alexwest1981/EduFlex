package com.eduflex.backend.repository;

import com.eduflex.backend.model.Flashcard;
import com.eduflex.backend.model.User;
import com.eduflex.backend.model.UserFlashcardProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserFlashcardProgressRepository extends JpaRepository<UserFlashcardProgress, Long> {
    Optional<UserFlashcardProgress> findByUserAndFlashcard(User user, Flashcard flashcard);

    @Query("SELECT p FROM UserFlashcardProgress p WHERE p.user = :user AND p.nextReview <= :now ORDER BY p.nextReview ASC")
    List<UserFlashcardProgress> findDueReviews(@Param("user") User user, @Param("now") LocalDateTime now);

    @Query("SELECT COUNT(p) FROM UserFlashcardProgress p WHERE p.user = :user AND p.nextReview <= :now")
    long countDueReviews(@Param("user") User user, @Param("now") LocalDateTime now);
}
