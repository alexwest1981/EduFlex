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
import org.springframework.web.multipart.MultipartFile;

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

    @PostMapping(value = "/send", consumes = { "multipart/form-data" })
    public ResponseEntity<MessageDTO> sendMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("recipientId") Long recipientId,
            @RequestParam("subject") String subject,
            @RequestParam("content") String content,
            @RequestParam(value = "folderSlug", required = false) String folderSlug,
            @RequestParam(value = "parentId", required = false) Long parentId,
            @RequestParam(value = "attachments", required = false) List<MultipartFile> attachments) {
        User sender = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(messageService.sendMessage(sender.getId(), recipientId, subject, content, folderSlug,
                parentId, attachments));
    }

    @GetMapping("/inbox")
    public ResponseEntity<List<MessageDTO>> getInbox(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(messageService.getInbox(user.getId()));
    }

    @GetMapping("/folder/{slug}")
    public ResponseEntity<List<MessageDTO>> getFolder(@AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String slug) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(messageService.getFolderMessages(user.getId(), slug));
    }

    @GetMapping("/folders")
    public ResponseEntity<List<com.eduflex.backend.model.MessageFolder>> getFolders(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(messageService.getFolders(user.getId()));
    }

    @PostMapping("/folders")
    public ResponseEntity<com.eduflex.backend.model.MessageFolder> createFolder(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> payload) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        String name = payload.get("name");
        return ResponseEntity.ok(messageService.createFolder(user.getId(), name));
    }

    @PutMapping("/{id}/move")
    public ResponseEntity<Void> moveMessage(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Long folderId = payload.get("folderId") != null ? Long.valueOf(payload.get("folderId").toString()) : null;
        messageService.moveMessageToFolder(id, folderId);
        return ResponseEntity.ok().build();
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

    @GetMapping("/thread/{messageId}")
    public ResponseEntity<List<MessageDTO>> getThread(@PathVariable Long messageId) {
        return ResponseEntity.ok(messageService.getThread(messageId));
    }

    // FIX: Använd HashMap istället för Map.of för att undvika Type Inference-fel
    @GetMapping("/contacts")
    public ResponseEntity<Map<String, List<Map<String, Object>>>> getContacts(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        Map<String, List<User>> categorized = userService.getCategorizedContacts(user.getId());

        Map<String, List<Map<String, Object>>> result = new HashMap<>();

        categorized.forEach((category, users) -> {
            List<Map<String, Object>> userDtos = users.stream().map(u -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", u.getId());
                map.put("fullName", u.getFullName());
                map.put("role", u.getRole().getName()); // Send Role Name string
                map.put("profilePictureUrl", u.getProfilePictureUrl());
                return map;
            }).collect(Collectors.toList());
            result.put(category, userDtos);
        });

        return ResponseEntity.ok(result);
    }
}