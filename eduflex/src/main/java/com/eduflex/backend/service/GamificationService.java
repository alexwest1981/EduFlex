package com.eduflex.backend.service;

import com.eduflex.backend.model.*;
import com.eduflex.backend.repository.*;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class GamificationService {

    private final UserRepository userRepository;
    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;

    public GamificationService(UserRepository userRepository, BadgeRepository badgeRepository, UserBadgeRepository userBadgeRepository) {
        this.userRepository = userRepository;
        this.badgeRepository = badgeRepository;
        this.userBadgeRepository = userBadgeRepository;
    }

    public User addPoints(Long userId, int points) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setPoints(user.getPoints() + points);

        // Enkel Level-logik: Varje 100 poäng är en ny level
        int newLevel = (user.getPoints() / 100) + 1;
        if (newLevel > user.getLevel()) {
            user.setLevel(newLevel);
            // Här kan man lägga till logik för "Level Up Notification"
        }

        return userRepository.save(user);
    }

    public void awardBadge(Long userId, Long badgeId) {
        User user = userRepository.findById(userId).orElseThrow();
        Badge badge = badgeRepository.findById(badgeId).orElseThrow();

        // Kolla om användaren redan har badgen
        boolean hasBadge = userBadgeRepository.existsByUserIdAndBadgeId(userId, badgeId);
        if (!hasBadge) {
            UserBadge userBadge = new UserBadge(user, badge);
            userBadgeRepository.save(userBadge);
        }
    }

    public List<Badge> getAllBadges() {
        return badgeRepository.findAll();
    }

    // Initieringsmetod för att skapa standard-badges om systemet är tomt
    @PostConstruct
    public void initBadges() {
        if (badgeRepository.count() == 0) {
            Badge b1 = new Badge();
            b1.setName("Första Steget");
            b1.setDescription("Du loggade in och startade din resa.");
            b1.setIconKey("FLAG");

            Badge b2 = new Badge();
            b2.setName("Quiz Master");
            b2.setDescription("Du fick 100% rätt på ett prov.");
            b2.setIconKey("TROPHY");

            Badge b3 = new Badge();
            b3.setName("Flitig Myra");
            b3.setDescription("Du lämnade in en uppgift i tid.");
            b3.setIconKey("CLOCK");

            badgeRepository.save(b1);
            badgeRepository.save(b2);
            badgeRepository.save(b3);
        }
    }
}