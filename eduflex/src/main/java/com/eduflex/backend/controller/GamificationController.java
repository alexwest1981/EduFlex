package com.eduflex.backend.controller;

import com.eduflex.backend.model.Badge;
import com.eduflex.backend.model.User;
import com.eduflex.backend.service.GamificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gamification")
@CrossOrigin(origins = "*")
public class GamificationController {

    private final GamificationService gamificationService;

    public GamificationController(GamificationService gamificationService) {
        this.gamificationService = gamificationService;
    }

    @GetMapping("/badges")
    public List<Badge> getAllBadges() {
        return gamificationService.getAllBadges();
    }

    @PostMapping("/init")
    public ResponseEntity<?> init() {
        gamificationService.initBadges();
        return ResponseEntity.ok("Badges created");
    }

    // Endpoint för att manuellt ge poäng (används av lärare eller admin)
    @PostMapping("/award/{userId}")
    public ResponseEntity<User> givePoints(@PathVariable Long userId, @RequestParam int points) {
        return ResponseEntity.ok(gamificationService.addPoints(userId, points));
    }
}