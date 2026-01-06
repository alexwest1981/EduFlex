package com.eduflex.backend.controller;

import com.eduflex.backend.dto.MessageDTO;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.service.MessageService;
import com.eduflex.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap; // <--- NY IMPORT
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;
    private final UserService userService;
    private final UserRepository userRepository;

    public MessageController(MessageService messageService, UserService userService, UserRepository userRepository) {
        this.messageService = messageService;
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @PostMapping("/send")
    public ResponseEntity<MessageDTO> sendMessage(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Map<String, Object> payload) {
        User sender = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        Long recipientId = Long.valueOf(payload.get("recipientId").toString());
        String subject = (String) payload.get("subject");
        String content = (String) payload.get("content");

        return ResponseEntity.ok(messageService.sendMessage(sender.getId(), recipientId, subject, content));
    }

    @GetMapping("/inbox")
    public ResponseEntity<List<MessageDTO>> getInbox(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(messageService.getInbox(user.getId()));
    }

    @GetMapping("/sent")
    public ResponseEntity<List<MessageDTO>> getSent(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(messageService.getSent(user.getId()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        messageService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread")
    public ResponseEntity<Long> getUnreadCount(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(messageService.getUnreadCount(user.getId()));
    }

    // FIX: Använd HashMap istället för Map.of för att undvika Type Inference-fel
    @GetMapping("/contacts")
    public ResponseEntity<List<Map<String, Object>>> getContacts(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        List<User> contacts = userService.getContactsForUser(user.getId());

        List<Map<String, Object>> result = contacts.stream().map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("fullName", u.getFullName());
            map.put("role", u.getRole());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}