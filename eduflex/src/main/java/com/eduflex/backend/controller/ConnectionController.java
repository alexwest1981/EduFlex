package com.eduflex.backend.controller;

import com.eduflex.backend.model.Connection;
import com.eduflex.backend.model.ConnectionStatus;
import com.eduflex.backend.service.ConnectionService;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/connections")
public class ConnectionController {

    @Autowired
    private ConnectionService connectionService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/request/{receiverId}")
    public ResponseEntity<?> sendRequest(@PathVariable Long receiverId, @AuthenticationPrincipal Object principal) {
        Long requesterId = getUserIdFromPrincipal(principal);
        try {
            Connection connection = connectionService.sendRequest(requesterId, receiverId);
            return ResponseEntity.ok(connection);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/accept/{connectionId}")
    public ResponseEntity<?> acceptRequest(@PathVariable Long connectionId, @AuthenticationPrincipal Object principal) {
        Long userId = getUserIdFromPrincipal(principal);
        try {
            Connection connection = connectionService.acceptRequest(connectionId, userId);
            return ResponseEntity.ok(connection);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/reject/{connectionId}")
    public ResponseEntity<?> rejectRequest(@PathVariable Long connectionId, @AuthenticationPrincipal Object principal) {
        Long userId = getUserIdFromPrincipal(principal);
        try {
            connectionService.rejectRequest(connectionId, userId);
            return ResponseEntity.ok("Request rejected");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/requests")
    public ResponseEntity<?> getIncomingRequests(@AuthenticationPrincipal Object principal) {
        Long userId = getUserIdFromPrincipal(principal);
        List<Connection> requests = connectionService.getIncomingRequests(userId);
        return ResponseEntity.ok(requests);
    }

    @DeleteMapping("/{targetUserId}")
    public ResponseEntity<?> removeConnection(@PathVariable Long targetUserId,
            @AuthenticationPrincipal Object principal) {
        Long userId = getUserIdFromPrincipal(principal);
        try {
            connectionService.removeConnection(userId, targetUserId);
            return ResponseEntity.ok("Connection removed");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/block/{targetUserId}")
    public ResponseEntity<?> blockUser(@PathVariable Long targetUserId, @AuthenticationPrincipal Object principal) {
        Long userId = getUserIdFromPrincipal(principal);
        try {
            connectionService.blockUser(userId, targetUserId);
            return ResponseEntity.ok("User blocked");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/unblock/{targetUserId}")
    public ResponseEntity<?> unblockUser(@PathVariable Long targetUserId, @AuthenticationPrincipal Object principal) {
        Long userId = getUserIdFromPrincipal(principal);
        try {
            connectionService.unblockUser(userId, targetUserId);
            return ResponseEntity.ok("User unblocked");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/status/{otherUserId}")
    public ResponseEntity<?> getStatus(@PathVariable Long otherUserId, @AuthenticationPrincipal Object principal) {
        try {
            Long userId = getUserIdFromPrincipal(principal);
            ConnectionStatus status = connectionService.getConnectionStatus(userId, otherUserId);
            return ResponseEntity.ok(Map.of("status", status != null ? status : "NONE"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage(), "trace", e.toString()));
        }
    }

    private Long getUserIdFromPrincipal(Object principal) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findByEmail(username)
                        .orElseThrow(() -> new RuntimeException("User not found: " + username)))
                .getId();
    }
}
