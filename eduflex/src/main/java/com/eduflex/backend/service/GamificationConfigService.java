package com.eduflex.backend.service;

import com.eduflex.backend.model.GamificationConfig;
import com.eduflex.backend.repository.GamificationConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class GamificationConfigService {

    @Autowired
    private GamificationConfigRepository configRepository;

    /**
     * Get gamification config for organization (or system-wide if organizationId is
     * null)
     */
    public GamificationConfig getConfig(Long organizationId) {
        Optional<GamificationConfig> config;

        if (organizationId != null) {
            config = configRepository.findByOrganizationId(organizationId);
        } else {
            config = configRepository.findByOrganizationIdIsNull();
        }

        // Return existing config or create default
        return config.orElseGet(() -> createDefaultConfig(organizationId));
    }

    /**
     * Check if gamification is enabled
     */
    public boolean isEnabled(Long organizationId) {
        GamificationConfig config = getConfig(organizationId);
        return config.getEnabled();
    }

    /**
     * Update gamification config
     */
    public GamificationConfig updateConfig(GamificationConfig config) {
        return configRepository.save(config);
    }

    /**
     * Create default config
     */
    private GamificationConfig createDefaultConfig(Long organizationId) {
        GamificationConfig config = new GamificationConfig();
        // config.setOrganizationId(organizationId); // TODO: Add organizationId field
        // to GamificationConfig model
        config.setEnabled(false); // Disabled by default
        config.setLeaderboardsEnabled(true);
        config.setAchievementsEnabled(true);
        config.setStreaksEnabled(true);
        config.setDailyChallengesEnabled(true);
        config.setXpMultiplierMax(5);
        config.setTimeBonusEnabled(true);
        config.setShopEnabled(false);
        return configRepository.save(config);
    }
}
