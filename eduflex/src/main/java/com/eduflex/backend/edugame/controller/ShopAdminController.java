package com.eduflex.backend.edugame.controller;

import com.eduflex.backend.edugame.model.ShopItem;
import com.eduflex.backend.edugame.service.ShopService;
import com.eduflex.backend.service.StorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/admin/shop")
@PreAuthorize("hasRole('ADMIN')")
public class ShopAdminController {

    private final ShopService shopService;
    private final StorageService storageService;

    public ShopAdminController(ShopService shopService, StorageService storageService) {
        this.shopService = shopService;
        this.storageService = storageService;
    }

    @GetMapping("/items")
    public ResponseEntity<List<ShopItem>> getAllItems() {
        return ResponseEntity.ok(shopService.getAllItems());
    }

    @PostMapping("/items")
    public ResponseEntity<ShopItem> createItem(@RequestBody ShopItem item) {
        ShopItem savedItem = shopService.saveItem(item);
        return ResponseEntity.created(URI.create("/api/edugame/shop/items/" + savedItem.getId()))
                .body(savedItem);
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<ShopItem> updateItem(@PathVariable Long id, @RequestBody ShopItem item) {
        return shopService.getItem(id)
                .map(existingItem -> {
                    existingItem.setName(item.getName());
                    existingItem.setDescription(item.getDescription());
                    existingItem.setCost(item.getCost());
                    existingItem.setType(item.getType());
                    existingItem.setRarity(item.getRarity());
                    existingItem.setLimited(item.isLimited());
                    existingItem.setImageUrl(item.getImageUrl());
                    existingItem.setUnlockCriteria(item.getUnlockCriteria());
                    return ResponseEntity.ok(shopService.saveItem(existingItem));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        shopService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadItemImage(@RequestParam("file") MultipartFile file) {
        try {
            String storageId = storageService.save(file);
            // Return the relative URL that the frontend can use
            return ResponseEntity.ok("/api/files/" + storageId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Upload failed: " + e.getMessage());
        }
    }
}
