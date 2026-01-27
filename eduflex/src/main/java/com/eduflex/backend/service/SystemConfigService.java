package com.eduflex.backend.service;

import com.eduflex.backend.model.SystemConfig;
import com.eduflex.backend.repository.SystemConfigRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Service for managing system configuration values.
 * Checks database first, then falls back to environment variables.
 */
@Service
public class SystemConfigService {

    public static final String GEMINI_API_KEY = "GEMINI_API_KEY";

    private final SystemConfigRepository configRepository;

    @Value("${gemini.api.key:}")
    private String envGeminiApiKey;

    public SystemConfigService(SystemConfigRepository configRepository) {
        this.configRepository = configRepository;
    }

    /**
     * Gets a configuration value. Checks database first, then environment.
     */
    public String getValue(String key) {
        Optional<SystemConfig> dbConfig = configRepository.findByConfigKey(key);
        if (dbConfig.isPresent() && dbConfig.get().getConfigValue() != null
            && !dbConfig.get().getConfigValue().isBlank()) {
            return dbConfig.get().getConfigValue();
        }

        // Fall back to environment variable
        return switch (key) {
            case GEMINI_API_KEY -> envGeminiApiKey;
            default -> null;
        };
    }

    /**
     * Gets the Gemini API key (database or env).
     */
    public String getGeminiApiKey() {
        return getValue(GEMINI_API_KEY);
    }

    /**
     * Sets a configuration value in the database.
     */
    public void setValue(String key, String value, String description, boolean sensitive, String updatedBy) {
        SystemConfig config = configRepository.findByConfigKey(key)
                .orElse(new SystemConfig(key, value, description, sensitive));

        config.setConfigValue(value);
        config.setUpdatedBy(updatedBy);
        configRepository.save(config);
    }

    /**
     * Checks if a configuration key has a value set.
     */
    public boolean hasValue(String key) {
        String value = getValue(key);
        return value != null && !value.isBlank();
    }

    /**
     * Gets masked value for sensitive configs (shows only last 4 chars).
     */
    public String getMaskedValue(String key) {
        String value = getValue(key);
        if (value == null || value.length() < 8) {
            return value != null && !value.isBlank() ? "****" : null;
        }
        return "****" + value.substring(value.length() - 4);
    }

    /**
     * Checks if the value is stored in database (vs env).
     */
    public boolean isStoredInDatabase(String key) {
        Optional<SystemConfig> dbConfig = configRepository.findByConfigKey(key);
        return dbConfig.isPresent() && dbConfig.get().getConfigValue() != null
               && !dbConfig.get().getConfigValue().isBlank();
    }
}
