package com.eduflex.backend.edugame.service;

import com.eduflex.backend.edugame.model.EduGameProfile;
import com.eduflex.backend.edugame.model.ShopItem;
import com.eduflex.backend.edugame.model.UserInventory;
import com.eduflex.backend.edugame.dto.ShopItemResponse;
import com.eduflex.backend.edugame.repository.EduGameProfileRepository;
import com.eduflex.backend.edugame.repository.ShopItemRepository;
import com.eduflex.backend.edugame.repository.UserInventoryRepository;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.service.CourseService;
import com.eduflex.backend.repository.QuizResultRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ShopService {

        private final ShopItemRepository shopItemRepository;
        private final UserInventoryRepository userInventoryRepository;
        private final EduGameProfileRepository eduGameProfileRepository;
        private final UserRepository userRepository;
        private final CourseService courseService;
        private final QuizResultRepository quizResultRepository;
        private final ObjectMapper objectMapper;

        public ShopService(ShopItemRepository shopItemRepository,
                        UserInventoryRepository userInventoryRepository,
                        EduGameProfileRepository eduGameProfileRepository,
                        UserRepository userRepository,
                        CourseService courseService,
                        QuizResultRepository quizResultRepository,
                        ObjectMapper objectMapper) {
                this.shopItemRepository = shopItemRepository;
                this.userInventoryRepository = userInventoryRepository;
                this.eduGameProfileRepository = eduGameProfileRepository;
                this.userRepository = userRepository;
                this.courseService = courseService;
                this.quizResultRepository = quizResultRepository;
                this.objectMapper = objectMapper;
        }

        public List<ShopItem> getAllItems() {
                return shopItemRepository.findAll();
        }

        public List<ShopItemResponse> getShopItemsForUser(Long userId) {
                List<ShopItem> allItems = shopItemRepository.findAll();
                List<UserInventory> inventory = userInventoryRepository.findByUserId(userId);
                EduGameProfile profile = eduGameProfileRepository.findByUserId(userId).orElse(null);

                java.util.Set<Long> ownedItemIds = inventory.stream()
                                .map(inv -> inv.getItem().getId())
                                .collect(java.util.stream.Collectors.toSet());

                return allItems.stream().map(item -> {
                        boolean owned = ownedItemIds.contains(item.getId());
                        boolean active = false;

                        if (profile != null) {
                                switch (item.getType()) {
                                        case FRAME -> active = item.getImageUrl().equals(profile.getActiveFrame());
                                        case BACKGROUND ->
                                                active = item.getImageUrl().equals(profile.getActiveBackground());
                                        case BADGE -> active = item.getImageUrl().equals(profile.getActiveBadge());
                                        case TITLE -> active = item.getName().equals(profile.getCurrentTitle());
                                }
                        }

                        return new ShopItemResponse(item, owned, active);
                }).collect(java.util.stream.Collectors.toList());
        }

        @Transactional
        public void buyItem(Long userId, Long itemId) {
                User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
                ShopItem item = shopItemRepository.findById(itemId)
                                .orElseThrow(() -> new RuntimeException("Item not found"));

                if (userInventoryRepository.existsByUserIdAndItemId(userId, itemId)) {
                        throw new RuntimeException("You already own this item!");
                }

                if (!checkUnlockCriteria(item, userId)) {
                        throw new RuntimeException("Item is locked! Requirements not met.");
                }

                if (user.getPoints() < item.getCost()) {
                        throw new RuntimeException(
                                        "Insufficient XP! You need " + (item.getCost() - user.getPoints()) + " more.");
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

        @Transactional
        public void unequipItem(Long userId, String type) {
                EduGameProfile profile = eduGameProfileRepository.findByUserId(userId)
                                .orElseThrow(() -> new RuntimeException("Profile not found"));

                switch (type.toUpperCase()) {
                        case "FRAME" -> profile.setActiveFrame(null);
                        case "BACKGROUND" -> profile.setActiveBackground(null);
                        case "BADGE" -> profile.setActiveBadge(null);
                        case "TITLE" -> profile.setCurrentTitle(null);
                        default -> throw new RuntimeException("Invalid item type: " + type);
                }

                eduGameProfileRepository.save(profile);
        }

        public List<UserInventory> getUserInventory(Long userId) {
                return userInventoryRepository.findByUserId(userId);
        }

        @Transactional
        public ShopItem saveItem(ShopItem item) {
                return shopItemRepository.save(item);
        }

        @Transactional
        public void deleteItem(Long itemId) {
                // First delete from user inventories to respect Foreign Key constraints
                userInventoryRepository.deleteByItemId(itemId);
                shopItemRepository.deleteById(itemId);
        }

        public Optional<ShopItem> getItem(Long itemId) {
                return shopItemRepository.findById(itemId);
        }

        private boolean checkUnlockCriteria(ShopItem item, Long userId) {
                String criteriaJson = item.getUnlockCriteria();
                if (criteriaJson == null || criteriaJson.isBlank()) {
                        return true;
                }

                try {
                        JsonNode root = objectMapper.readTree(criteriaJson);
                        String type = root.path("type").asText();

                        if ("COURSE_COMPLETION".equals(type)) {
                                Long courseId = root.path("referenceId").asLong();
                                // Check if course is passed or completed
                                // Assuming validateCompletion returns true if all assignments are done
                                // Or check for explicit "PASSED" status if available
                                // For now, using validateCompletion
                                return courseService.validateCompletion(courseId, userId);
                        } else if ("QUIZ_SCORE".equals(type)) {
                                Long quizId = root.path("referenceId").asLong();
                                int threshold = root.path("threshold").asInt();

                                // Check if any result for this quiz is >= threshold
                                return quizResultRepository.findByQuizIdAndStudentId(quizId, userId).stream()
                                                .anyMatch(result -> result.getScore() >= threshold);
                        }

                        return true; // Unknown criterion type, fallback to allow? Or deny? default allow to avoid
                                     // blocking
                } catch (Exception e) {
                        System.err.println("Error parsing unlock criteria: " + e.getMessage());
                        return false; // Fail safe
                }
        }

        // Initialize some default items if empty
        @PostConstruct
        public void initShop() {
                if (shopItemRepository.count() == 0) {
                        // FRAMES
                        shopItemRepository.save(
                                        new ShopItem(null, "Neon Frame", "Glowing neon frame", "frame_neon_01.png", 500,
                                                        ShopItem.ItemType.FRAME, false, ShopItem.Rarity.RARE, null));
                        shopItemRepository.save(new ShopItem(null, "Wood Frame", "Rustic wooden frame",
                                        "frame_wood_01.png", 200,
                                        ShopItem.ItemType.FRAME, false, ShopItem.Rarity.COMMON, null));
                        shopItemRepository.save(new ShopItem(null, "Magma Frame", "Burning lava effect",
                                        "frame_magma_01.png", 2500,
                                        ShopItem.ItemType.FRAME, false, ShopItem.Rarity.EPIC, null));
                        shopItemRepository
                                        .save(new ShopItem(null, "Galaxy Frame", "Animated starfield frame",
                                                        "frame_galaxy_01.png", 5000,
                                                        ShopItem.ItemType.FRAME, false, ShopItem.Rarity.LEGENDARY,
                                                        null));

                        // CIRCULAR FRAMES
                        shopItemRepository.save(new ShopItem(null, "Neon Cyan (Circle)", "Circular neon cyan frame",
                                        "frame_circular_neon_cyan.png", 500,
                                        ShopItem.ItemType.FRAME, false, ShopItem.Rarity.RARE, null));
                        shopItemRepository.save(new ShopItem(null, "Neon Gold (Circle)", "Circular neon gold frame",
                                        "frame_circular_neon_gold.png", 1000,
                                        ShopItem.ItemType.FRAME, false, ShopItem.Rarity.EPIC, null));
                        shopItemRepository.save(new ShopItem(null, "Neon Purple (Circle)", "Circular neon purple frame",
                                        "frame_circular_neon_purple.png", 1500,
                                        ShopItem.ItemType.FRAME, false, ShopItem.Rarity.EPIC, null));

                        // BACKGROUNDS
                        shopItemRepository.save(new ShopItem(null, "Cyber Punk", "Cyberpunk city background",
                                        "bg_cyber_01.png",
                                        1000, ShopItem.ItemType.BACKGROUND, false, ShopItem.Rarity.RARE, null));
                        shopItemRepository.save(new ShopItem(null, "Zen Garden", "Peaceful garden background",
                                        "bg_zen_01.png",
                                        1500, ShopItem.ItemType.BACKGROUND, false, ShopItem.Rarity.RARE, null));
                        shopItemRepository.save(new ShopItem(null, "Deep Sea", "Underwater kingdom", "bg_sea_01.png",
                                        3000, ShopItem.ItemType.BACKGROUND, false, ShopItem.Rarity.EPIC, null));

                        // BADGES
                        shopItemRepository.save(new ShopItem(null, "Golden Crown", "Exclusive golden crown badge",
                                        "badge_gold_crown.png", 2000, ShopItem.ItemType.BADGE, true,
                                        ShopItem.Rarity.EPIC, null));
                        shopItemRepository.save(
                                        new ShopItem(null, "Beta Tester", "A badge for early birds", "badge_beta.png",
                                                        100, ShopItem.ItemType.BADGE, true, ShopItem.Rarity.COMMON,
                                                        null));

                        // TITLES
                        shopItemRepository.save(
                                        new ShopItem(null, "Quiz Wizard", "Title for quiz masters", "title_quiz_wizard",
                                                        300, ShopItem.ItemType.TITLE, false, ShopItem.Rarity.COMMON,
                                                        null));
                        shopItemRepository
                                        .save(new ShopItem(null, "The Unstoppable", "For the most dedicated students",
                                                        "title_unstoppable",
                                                        10000, ShopItem.ItemType.TITLE, false,
                                                        ShopItem.Rarity.LEGENDARY, null));
                        shopItemRepository.save(new ShopItem(null, "Bug Hunter", "For those who find mistakes",
                                        "title_bug_hunter",
                                        1500, ShopItem.ItemType.TITLE, false, ShopItem.Rarity.RARE, null));
                }
        }
}
