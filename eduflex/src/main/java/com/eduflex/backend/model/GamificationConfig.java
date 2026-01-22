package com.eduflex.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "gamification_config")
@Data
public class GamificationConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "organization_id")
    private Long organizationId;

    @Column(name = "enabled", nullable = false)
    private Boolean enabled = false;

    @Column(name = "leaderboards_enabled")
    private Boolean leaderboardsEnabled = true;

    @Column(name = "achievements_enabled")
    private Boolean achievementsEnabled = true;

    @Column(name = "streaks_enabled")
    private Boolean streaksEnabled = true;

    @Column(name = "daily_challenges_enabled")
    private Boolean dailyChallengesEnabled = true;

    @Column(name = "xp_multiplier_max")
    private Integer xpMultiplierMax = 5;

    @Column(name = "time_bonus_enabled")
    private Boolean timeBonusEnabled = true;

    @Column(name = "shop_enabled")
    private Boolean shopEnabled = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    public Boolean getLeaderboardsEnabled() {
        return leaderboardsEnabled;
    }

    public void setLeaderboardsEnabled(Boolean leaderboardsEnabled) {
        this.leaderboardsEnabled = leaderboardsEnabled;
    }

    public Boolean getAchievementsEnabled() {
        return achievementsEnabled;
    }

    public void setAchievementsEnabled(Boolean achievementsEnabled) {
        this.achievementsEnabled = achievementsEnabled;
    }

    public Boolean getStreaksEnabled() {
        return streaksEnabled;
    }

    public void setStreaksEnabled(Boolean streaksEnabled) {
        this.streaksEnabled = streaksEnabled;
    }

    public Boolean getDailyChallengesEnabled() {
        return dailyChallengesEnabled;
    }

    public void setDailyChallengesEnabled(Boolean dailyChallengesEnabled) {
        this.dailyChallengesEnabled = dailyChallengesEnabled;
    }

    public Integer getXpMultiplierMax() {
        return xpMultiplierMax;
    }

    public void setXpMultiplierMax(Integer xpMultiplierMax) {
        this.xpMultiplierMax = xpMultiplierMax;
    }

    public Boolean getTimeBonusEnabled() {
        return timeBonusEnabled;
    }

    public void setTimeBonusEnabled(Boolean timeBonusEnabled) {
        this.timeBonusEnabled = timeBonusEnabled;
    }

    public Boolean getShopEnabled() {
        return shopEnabled;
    }

    public void setShopEnabled(Boolean shopEnabled) {
        this.shopEnabled = shopEnabled;
    }
}
