package com.eduflex.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "system_modules")
public class SystemModule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String moduleKey; // T.ex. "CHAT", "GAMIFICATION"

    private String name;
    private String description;
    private String version;

    @Column(columnDefinition = "boolean default false")
    private boolean isActive;

    @Column(columnDefinition = "boolean default false")
    private boolean requiresLicense;

    public SystemModule() {}

    public SystemModule(String moduleKey, String name, String description, String version, boolean isActive, boolean requiresLicense) {
        this.moduleKey = moduleKey;
        this.name = name;
        this.description = description;
        this.version = version;
        this.isActive = isActive;
        this.requiresLicense = requiresLicense;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public String getModuleKey() { return moduleKey; }
    public void setModuleKey(String moduleKey) { this.moduleKey = moduleKey; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    public boolean isRequiresLicense() { return requiresLicense; }
    public void setRequiresLicense(boolean requiresLicense) { this.requiresLicense = requiresLicense; }
}