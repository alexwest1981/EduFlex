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
        // --- GRUNDINSTÄLLNINGAR (Behåll dessa) ---
        createIfMissing("site_name", "EduFlex", "Systemets visningsnamn i menyn.");
        createIfMissing("system_version", "2.0.0", "Systemets nuvarande version.");
        createIfMissing("registration_open", "true", "Tillåter nya användare att registrera sig.");

        // --- TA BORT MODULERNA HÄRIFRÅN ---
        // Vi tar bort chat_enabled, gamification_enabled etc. härifrån
        // eftersom de nu ligger i ModuleService istället.
    }

    private void createIfMissing(String key, String defaultValue, String desc) {
        if (repository.findBySettingKey(key).isEmpty()) {
            repository.save(new SystemSetting(key, defaultValue, desc));
        }
    }

    public List<SystemSetting> getAllSettings() {
        return repository.findAll();
    }

    public SystemSetting updateSetting(String key, String value) {
        SystemSetting setting = repository.findBySettingKey(key)
                .orElse(new SystemSetting(key, value, "Dynamisk inställning"));

        setting.setSettingValue(value);
        return repository.save(setting);
    }
}