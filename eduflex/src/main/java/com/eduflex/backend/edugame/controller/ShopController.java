package com.eduflex.backend.edugame.controller;

import com.eduflex.backend.edugame.model.UserInventory;
import com.eduflex.backend.edugame.dto.ShopItemResponse;
import com.eduflex.backend.edugame.service.ShopService;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/edugame/shop")
public class ShopController {

    private final ShopService shopService;
    private final UserRepository userRepository;

    public ShopController(ShopService shopService, UserRepository userRepository) {
        this.shopService = shopService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/items")
    public ResponseEntity<List<ShopItemResponse>> getShopItems() {
        User user = getCurrentUser();
        return ResponseEntity.ok(shopService.getShopItemsForUser(user.getId()));
    }

    @PostMapping("/buy/{itemId}")
    public ResponseEntity<?> buyItem(@PathVariable Long itemId) {
        try {
            User user = getCurrentUser();
            shopService.buyItem(user.getId(), itemId);
            return ResponseEntity.ok("Item purchased successfully!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/equip/{itemId}")
    public ResponseEntity<?> equipItem(@PathVariable Long itemId) {
        try {
            User user = getCurrentUser();
            shopService.equipItem(user.getId(), itemId);
            return ResponseEntity.ok("Item equipped successfully!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/unequip/{type}")
    public ResponseEntity<?> unequipItem(@PathVariable String type) {
        try {
            User user = getCurrentUser();
            shopService.unequipItem(user.getId(), type);
            return ResponseEntity.ok("Item unequipped successfully!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/inventory")
    public ResponseEntity<List<UserInventory>> getMyInventory() {
        User user = getCurrentUser();
        return ResponseEntity.ok(shopService.getUserInventory(user.getId()));
    }
}
