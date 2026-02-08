package com.eduflex.backend.edugame.dto;

import com.eduflex.backend.edugame.model.ShopItem;

public class ShopItemResponse {
    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private Integer cost;
    private ShopItem.ItemType type;
    private ShopItem.Rarity rarity;
    private boolean isLimited;
    private boolean owned;
    private boolean active;
    private String unlockCriteria;

    public ShopItemResponse(ShopItem item, boolean owned, boolean active) {
        this.id = item.getId();
        this.name = item.getName();
        this.description = item.getDescription();
        this.imageUrl = item.getImageUrl();
        this.cost = item.getCost();
        this.type = item.getType();
        this.rarity = item.getRarity();
        this.isLimited = item.isLimited();
        this.owned = owned;
        this.active = active;
        this.unlockCriteria = item.getUnlockCriteria();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getCost() {
        return cost;
    }

    public void setCost(Integer cost) {
        this.cost = cost;
    }

    public ShopItem.ItemType getType() {
        return type;
    }

    public void setType(ShopItem.ItemType type) {
        this.type = type;
    }

    public ShopItem.Rarity getRarity() {
        return rarity;
    }

    public void setRarity(ShopItem.Rarity rarity) {
        this.rarity = rarity;
    }

    public boolean isLimited() {
        return isLimited;
    }

    public void setLimited(boolean limited) {
        isLimited = limited;
    }

    public boolean isOwned() {
        return owned;
    }

    public void setOwned(boolean owned) {
        this.owned = owned;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getUnlockCriteria() {
        return unlockCriteria;
    }

    public void setUnlockCriteria(String unlockCriteria) {
        this.unlockCriteria = unlockCriteria;
    }
}
