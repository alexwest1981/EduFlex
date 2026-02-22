package com.eduflex.backend.service;

import com.eduflex.backend.model.*;
import com.eduflex.backend.repository.*;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class GamificationService {

    private final UserRepository userRepository;
    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final GamificationLeagueSettingRepository leagueSettingRepository;

    public GamificationService(UserRepository userRepository, BadgeRepository badgeRepository,
            UserBadgeRepository userBadgeRepository,
            GamificationLeagueSettingRepository leagueSettingRepository) {
        this.userRepository = userRepository;
        this.badgeRepository = badgeRepository;
        this.userBadgeRepository = userBadgeRepository;
        this.leagueSettingRepository = leagueSettingRepository;
    }

    public User addPoints(Long userId, int points) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setPoints(user.getPoints() + points);

        // Uppdatera Liga (Dynamiskt från DB)
        League nextLeague = determineLeagueDynamic(user.getPoints());
        if (nextLeague != user.getCurrentLeague()) {
            user.setCurrentLeague(nextLeague);
        }

        // Enkel Level-logik: Varje 100 poäng är en ny level
        int newLevel = (user.getPoints() / 100) + 1;
        if (newLevel > user.getLevel()) {
            user.setLevel(newLevel);
        }

        return userRepository.save(user);
    }

    public League determineLeagueDynamic(int points) {
        List<GamificationLeagueSetting> settings = leagueSettingRepository.findAll();
        if (settings.isEmpty()) {
            return League.determineLeague(points); // Fallback to enum defaults
        }

        // Search for the highest league the user qualifies for
        return settings.stream()
                .filter(s -> points >= s.getMinPoints())
                .sorted((a, b) -> b.getMinPoints() - a.getMinPoints()) // Descending
                .map(GamificationLeagueSetting::getLeagueKey)
                .findFirst()
                .orElse(League.BRONZE);
    }

    public java.util.Map<String, Object> getClassProgress(Long classGroupId) {
        List<User> students = userRepository.findByClassGroup_Id(classGroupId);
        int totalXp = students.stream().mapToInt(User::getPoints).sum();

        // Dynamiskt mål baserat på antal studenter (t.ex. 500 XP per student)
        int targetXp = students.size() * 500;
        if (targetXp == 0)
            targetXp = 1000; // Fallback

        return java.util.Map.of(
                "totalXp", totalXp,
                "targetXp", targetXp,
                "studentCount", students.size(),
                "percentage", Math.min(100, (totalXp * 100) / targetXp));
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