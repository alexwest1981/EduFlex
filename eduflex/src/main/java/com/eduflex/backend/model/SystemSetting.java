package com.eduflex.backend.model;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "system_settings")
public class SystemSetting implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String settingKey; // T.ex. "chat_enabled"

    private String settingValue; // "true" eller "false"
    private String description; // "Aktivera chatt-modulen"

    public SystemSetting() {
    }

    public SystemSetting(String key, String value, String description) {
        this.settingKey = key;
        this.settingValue = value;
        this.description = description;
    }

    // Getters & Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSettingKey() {
        return settingKey;
    }

    public void setSettingKey(String settingKey) {
        this.settingKey = settingKey;
    }

    public String getSettingValue() {
        return settingValue;
    }

    public void setSettingValue(String settingValue) {
        this.settingValue = settingValue;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}