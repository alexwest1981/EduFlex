package com.eduflex.backend.edugame.controller;

import com.eduflex.backend.edugame.model.Friendship;
import com.eduflex.backend.edugame.service.SocialService;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/edugame/social")
public class SocialController {

    private final SocialService socialService;
    private final UserRepository userRepository;

    public SocialController(SocialService socialService, UserRepository userRepository) {
        this.socialService = socialService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/friends")
    public ResponseEntity<List<Friendship>> getFriends() {
        return ResponseEntity.ok(socialService.getMyFriends(getCurrentUser().getId()));
    }

    @GetMapping("/requests")
    public ResponseEntity<List<Friendship>> getPendingRequests() {
        return ResponseEntity.ok(socialService.getPendingRequests(getCurrentUser().getId()));
    }

    @PostMapping("/request")
    public ResponseEntity<?> sendRequest(@RequestBody Map<String, String> payload) {
        try {
            User user = getCurrentUser();
            String targetUsername = payload.get("username");
            socialService.sendFriendRequest(user.getId(), targetUsername);
            return ResponseEntity.ok("Friend request sent!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/accept/{friendshipId}")
    public ResponseEntity<?> acceptRequest(@PathVariable Long friendshipId) {
        try {
            User user = getCurrentUser();
            socialService.acceptFriendRequest(user.getId(), friendshipId);
            return ResponseEntity.ok("Friend request accepted!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
