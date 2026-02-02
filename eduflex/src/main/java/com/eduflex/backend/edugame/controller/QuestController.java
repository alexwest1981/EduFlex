package com.eduflex.backend.edugame.controller;

import com.eduflex.backend.edugame.model.Quest;
import com.eduflex.backend.edugame.service.QuestService;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/edugame/quests")
public class QuestController {

    private final QuestService questService;
    private final UserRepository userRepository;

    public QuestController(QuestService questService, UserRepository userRepository) {
        this.questService = questService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/daily")
    public ResponseEntity<List<Quest>> getDailyQuests() {
        User user = getCurrentUser();
        return ResponseEntity.ok(questService.getMyDailyQuests(user.getId()));
    }

    @PostMapping("/generate")
    public ResponseEntity<List<Quest>> forceGenerateDailyQuests() {
        User user = getCurrentUser();
        return ResponseEntity.ok(questService.generateDailyQuests(user.getId()));
    }
}
