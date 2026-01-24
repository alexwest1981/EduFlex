package com.eduflex.backend.service;

import com.eduflex.backend.model.SystemSetting;
import com.eduflex.backend.repository.SystemSettingRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
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
        createIfMissing("onlyoffice_url", "http://localhost:8080", "URL till ONLYOFFICE Document Server.");
        createIfMissing("onlyoffice_enabled", "true", "Aktivera eller inaktivera ONLYOFFICE-integrationen globalt.");

        // --- TA BORT MODULERNA HÄRIFRÅN ---
        // Vi tar bort chat_enabled, gamification_enabled etc. härifrån
        // eftersom de nu ligger i ModuleService istället.
    }

    private void createIfMissing(String key, String defaultValue, String desc) {
        if (repository.findBySettingKey(key).isEmpty()) {
            repository.save(new SystemSetting(key, defaultValue, desc));
        }
    }

    @Cacheable(value = "systemSettings")
    public List<SystemSetting> getAllSettings() {
        return repository.findAll();
    }

    @CacheEvict(value = "systemSettings", allEntries = true)
    public SystemSetting updateSetting(String key, String value) {
        SystemSetting setting = repository.findBySettingKey(key)
                .orElse(new SystemSetting(key, value, "Dynamisk inställning"));

        setting.setSettingValue(value);
        return repository.save(setting);
    }
}