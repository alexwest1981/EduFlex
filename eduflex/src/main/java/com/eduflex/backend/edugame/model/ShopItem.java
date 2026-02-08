package com.eduflex.backend.edugame.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "edugame_shop_items")
public class ShopItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(nullable = false)
    private Integer cost; // Cost in XP

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Rarity rarity = Rarity.COMMON;

    @Column(name = "is_limited")
    private boolean isLimited = false;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "unlock_criteria", columnDefinition = "jsonb")
    private String unlockCriteria;

    public ShopItem() {
    }

    public ShopItem(Long id, String name, String description, String imageUrl, Integer cost, ItemType type,
            boolean isLimited, Rarity rarity, String unlockCriteria) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.imageUrl = imageUrl;
        this.cost = cost;
        this.type = type;
        this.isLimited = isLimited;
        this.rarity = rarity != null ? rarity : Rarity.COMMON;
        this.unlockCriteria = unlockCriteria;
    }

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

    public ItemType getType() {
        return type;
    }

    public void setType(ItemType type) {
        this.type = type;
    }

    public Rarity getRarity() {
        return rarity;
    }

    public void setRarity(Rarity rarity) {
        this.rarity = rarity;
    }

    public boolean isLimited() {
        return isLimited;
    }

    public void setLimited(boolean limited) {
        isLimited = limited;
    }

    public String getUnlockCriteria() {
        return unlockCriteria;
    }

    public void setUnlockCriteria(String unlockCriteria) {
        this.unlockCriteria = unlockCriteria;
    }

    public enum ItemType {
        FRAME,
        BACKGROUND,
        BADGE,
        TITLE
    }

    public enum Rarity {
        COMMON,
        RARE,
        EPIC,
        LEGENDARY
    }
}
