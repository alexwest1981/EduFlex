package com.eduflex.backend.controller;

import com.eduflex.backend.model.GamificationLeagueSetting;
import com.eduflex.backend.repository.GamificationLeagueSettingRepository;
import com.eduflex.backend.repository.SystemSettingRepository;
import com.eduflex.backend.model.SystemSetting;
import com.eduflex.backend.service.GamificationConfigService;
import com.eduflex.backend.model.GamificationConfig;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/admin/gamification")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class GamificationAdminController {

    private final GamificationLeagueSettingRepository leagueSettingRepository;
    private final GamificationConfigService configService;
    private final SystemSettingRepository settingRepository;

    public GamificationAdminController(GamificationLeagueSettingRepository leagueSettingRepository,
            GamificationConfigService configService,
            SystemSettingRepository settingRepository) {
        this.leagueSettingRepository = leagueSettingRepository;
        this.configService = configService;
        this.settingRepository = settingRepository;
    }

    @GetMapping("/leagues")
    public List<GamificationLeagueSetting> getAllLeagues() {
        return leagueSettingRepository.findAll();
    }

    @PutMapping("/leagues/{id}")
    public ResponseEntity<GamificationLeagueSetting> updateLeague(@PathVariable Long id,
            @RequestBody GamificationLeagueSetting setting) {
        GamificationLeagueSetting existing = leagueSettingRepository.findById(id).orElseThrow();
        existing.setDisplayName(setting.getDisplayName());
        existing.setMinPoints(setting.getMinPoints());
        existing.setIcon(setting.getIcon());
        existing.setRewardDescription(setting.getRewardDescription());
        existing.setColorHex(setting.getColorHex());
        return ResponseEntity.ok(leagueSettingRepository.save(existing));
    }

    @GetMapping("/config")
    public GamificationConfig getSystemConfig() {
        return configService.getConfig(null);
    }

    @PutMapping("/config")
    public GamificationConfig updateSystemConfig(
            @RequestBody GamificationConfig config) {
        GamificationConfig existing = configService.getConfig(null);
        existing.setLeaderboardsEnabled(config.getLeaderboardsEnabled());
        existing.setAchievementsEnabled(config.getAchievementsEnabled());
        existing.setStreaksEnabled(config.getStreaksEnabled());
        existing.setDailyChallengesEnabled(config.getDailyChallengesEnabled());
        existing.setXpMultiplierMax(config.getXpMultiplierMax());
        existing.setTimeBonusEnabled(config.getTimeBonusEnabled());
        existing.setShopEnabled(config.getShopEnabled());
        return configService.updateConfig(existing);
    }

    @GetMapping("/eduai-center")
    public Map<String, String> getEduAiSettings() {
        Map<String, String> settings = new HashMap<>();
        settings.put("eduai_xp_ratio", settingRepository.findBySettingKey("eduai_xp_ratio")
                .map(SystemSetting::getSettingValue).orElse("1.0"));
        settings.put("eduai_credit_earn_rate", settingRepository.findBySettingKey("eduai_credit_earn_rate")
                .map(SystemSetting::getSettingValue).orElse("5"));
        settings.put("eduai_proactivity", settingRepository.findBySettingKey("eduai_proactivity")
                .map(SystemSetting::getSettingValue).orElse("medium"));
        return settings;
    }

    @PutMapping("/eduai-center")
    public ResponseEntity<Void> updateEduAiSettings(@RequestBody Map<String, String> settings) {
        settings.forEach((key, value) -> {
            SystemSetting s = settingRepository.findBySettingKey(key)
                    .orElse(new SystemSetting());
            s.setSettingKey(key);
            s.setSettingValue(value);
            settingRepository.save(s);
        });
        return ResponseEntity.ok().build();
    }
}
