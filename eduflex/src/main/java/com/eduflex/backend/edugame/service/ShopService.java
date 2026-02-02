package com.eduflex.backend.edugame.service;

import com.eduflex.backend.edugame.model.EduGameProfile;
import com.eduflex.backend.edugame.model.ShopItem;
import com.eduflex.backend.edugame.model.UserInventory;
import com.eduflex.backend.edugame.repository.EduGameProfileRepository;
import com.eduflex.backend.edugame.repository.ShopItemRepository;
import com.eduflex.backend.edugame.repository.UserInventoryRepository;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ShopService {

    private final ShopItemRepository shopItemRepository;
    private final UserInventoryRepository userInventoryRepository;
    private final EduGameProfileRepository eduGameProfileRepository;
    private final UserRepository userRepository;

    public ShopService(ShopItemRepository shopItemRepository,
            UserInventoryRepository userInventoryRepository,
            EduGameProfileRepository eduGameProfileRepository,
            UserRepository userRepository) {
        this.shopItemRepository = shopItemRepository;
        this.userInventoryRepository = userInventoryRepository;
        this.eduGameProfileRepository = eduGameProfileRepository;
        this.userRepository = userRepository;
    }

    public List<ShopItem> getAllItems() {
        return shopItemRepository.findAll();
    }

    @Transactional
    public void buyItem(Long userId, Long itemId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        ShopItem item = shopItemRepository.findById(itemId).orElseThrow(() -> new RuntimeException("Item not found"));

        if (userInventoryRepository.existsByUserIdAndItemId(userId, itemId)) {
            throw new RuntimeException("You already own this item!");
        }

        if (user.getPoints() < item.getCost()) {
            throw new RuntimeException("Insufficient XP! You need " + (item.getCost() - user.getPoints()) + " more.");
        }

        // Deduct XP
        user.setPoints(user.getPoints() - item.getCost());
        userRepository.save(user);

        // Add to inventory
        UserInventory inventory = new UserInventory();
        inventory.setUser(user);
        inventory.setItem(item);
        userInventoryRepository.save(inventory);
    }

    @Transactional
    public void equipItem(Long userId, Long itemId) {
        EduGameProfile profile = eduGameProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId).orElseThrow();
                    return new EduGameProfile(user);
                });

        ShopItem item = shopItemRepository.findById(itemId).orElseThrow();

        // Verify ownership
        if (!userInventoryRepository.existsByUserIdAndItemId(userId, itemId)) {
            throw new RuntimeException("You do not own this item!");
        }

        switch (item.getType()) {
            case FRAME -> profile.setActiveFrame(item.getImageUrl());
            case BACKGROUND -> profile.setActiveBackground(item.getImageUrl());
            case BADGE -> profile.setActiveBadge(item.getImageUrl());
            case TITLE -> profile.setCurrentTitle(item.getName());
        }

        eduGameProfileRepository.save(profile);
    }

    public List<UserInventory> getUserInventory(Long userId) {
        return userInventoryRepository.findByUserId(userId);
    }

    // Initialize some default items if empty
    @PostConstruct
    public void initShop() {
        if (shopItemRepository.count() == 0) {
            shopItemRepository.save(new ShopItem(null, "Neon Frame", "Glowing neon frame", "frame_neon_01.png", 500,
                    ShopItem.ItemType.FRAME, false));
            shopItemRepository.save(new ShopItem(null, "Cyber Punk", "Cyberpunk city background", "bg_cyber_01.png",
                    1000, ShopItem.ItemType.BACKGROUND, false));
            shopItemRepository.save(new ShopItem(null, "Golden Crown", "Exclusive golden crown badge",
                    "badge_gold_crown.png", 2000, ShopItem.ItemType.BADGE, true));
            shopItemRepository.save(new ShopItem(null, "Quiz Wizard", "Title for quiz masters", "title_quiz_wizard",
                    300, ShopItem.ItemType.TITLE, false));
        }
    }
}
