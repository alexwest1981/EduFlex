package com.eduflex.backend.controller;

import com.eduflex.backend.model.SavedInternship;
import com.eduflex.backend.service.EduCareerService;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/career")
@RequiredArgsConstructor
public class EduCareerController {

    private final EduCareerService careerService;
    private final UserRepository userRepo;

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchInternships(Principal principal) {
        User user = getUserFromPrincipal(principal);
        return ResponseEntity.ok(careerService.getRecommendedInternships(user.getId()));
    }

    @PostMapping("/save")
    public ResponseEntity<SavedInternship> saveInternship(Principal principal,
            @RequestBody Map<String, Object> adData) {
        User user = getUserFromPrincipal(principal);
        return ResponseEntity.ok(careerService.saveInternship(user.getId(), adData));
    }

    @GetMapping("/saved")
    public ResponseEntity<List<SavedInternship>> getSavedInternships(Principal principal) {
        User user = getUserFromPrincipal(principal);
        return ResponseEntity.ok(careerService.getSavedInternships(user.getId()));
    }

    private User getUserFromPrincipal(Principal principal) {
        return userRepo.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
