package com.eduflex.backend.service;

import com.eduflex.backend.model.SystemSetting;
import com.eduflex.backend.repository.SystemSettingRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SystemSettingService {

    private final SystemSettingRepository repository;

    public SystemSettingService(SystemSettingRepository repository) {
        this.repository = repository;
    }

    @PostConstruct
    public void initDefaultSettings() {
        // --- GRUNDINSTÄLLNINGAR ---
        createIfMissing("site_name", "EduFlex", "Systemets visningsnamn i menyn.");
        createIfMissing("system_version", "1.0.2", "Systemets nuvarande version (Read-only).");
        createIfMissing("registration_open", "true", "Tillåter nya användare att registrera sig.");

        // --- MODULER (Här lägger vi till de som saknades) ---
        createIfMissing("chat_enabled", "true", "Aktiverar chattfunktionen för alla användare.");
        createIfMissing("gamification_enabled", "false", "Låser upp badges, XP-system och topplistor.");
        createIfMissing("dark_mode_enabled", "false", "Möjliggör mörkt läge för hela plattformen.");
    }

    private void createIfMissing(String key, String defaultValue, String desc) {
        if (repository.findBySettingKey(key).isEmpty()) {
            repository.save(new SystemSetting(key, defaultValue, desc));
        }
    }

    public List<SystemSetting> getAllSettings() {
        return repository.findAll();
    }

    /**
     * Uppdaterar en inställning.
     * ÄNDRING: Om inställningen inte finns, skapas den (Upsert).
     * Detta gör systemet flexibelt för att lägga till nya moduler dynamiskt.
     */
    public SystemSetting updateSetting(String key, String value) {
        SystemSetting setting = repository.findBySettingKey(key)
                .orElse(new SystemSetting(key, value, "Dynamisk inställning"));

        setting.setSettingValue(value);
        return repository.save(setting);
    }

    public boolean isChatEnabled() {
        return repository.findBySettingKey("chat_enabled")
                .map(s -> "true".equalsIgnoreCase(s.getSettingValue()))
                .orElse(true);
    }
}