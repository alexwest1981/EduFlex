package com.eduflex.backend.repository;

import com.eduflex.backend.model.Flashcard;
import com.eduflex.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FlashcardRepository extends JpaRepository<Flashcard, Long> {
    List<Flashcard> findByDeckId(Long deckId);

    @Query("SELECT c FROM Flashcard c WHERE c.deck.user = :user AND NOT EXISTS (SELECT p FROM UserFlashcardProgress p WHERE p.user = :user AND p.flashcard = c)")
    List<Flashcard> findNewCardsForUser(@Param("user") User user);

    @Query("SELECT COUNT(c) FROM Flashcard c WHERE c.deck.user = :user AND NOT EXISTS (SELECT p FROM UserFlashcardProgress p WHERE p.user = :user AND p.flashcard = c)")
    long countNewCardsForUser(@Param("user") User user);
}
