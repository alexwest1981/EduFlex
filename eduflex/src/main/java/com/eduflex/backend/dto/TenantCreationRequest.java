package com.eduflex.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TenantCreationRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Domain is required")
    private String domain;

    @NotBlank(message = "Database Schema is required")
    private String dbSchema;

    @NotBlank(message = "Organization Key is required")
    private String organizationKey;

    // Frontend compatibility aliases
    private String tenantId;
    private String schema;

    // Security
    private String registrationKey;

    public String getTenantId() {
        return tenantId != null ? tenantId : organizationKey;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
        this.organizationKey = tenantId; // Sync
    }

    public String getSchema() {
        return schema != null ? schema : dbSchema;
    }

    public void setSchema(String schema) {
        this.schema = schema;
        this.dbSchema = schema; // Sync
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public String getDbSchema() {
        return dbSchema;
    }

    public void setDbSchema(String dbSchema) {
        this.dbSchema = dbSchema;
    }

    public String getOrganizationKey() {
        return organizationKey;
    }

    public void setOrganizationKey(String organizationKey) {
        this.organizationKey = organizationKey;
    }

    private String adminEmail;
    private String adminPassword;
    private String adminFirstName;
    private String adminLastName;

    public String getAdminEmail() {
        return adminEmail;
    }

    public void setAdminEmail(String adminEmail) {
        this.adminEmail = adminEmail;
    }

    public String getAdminPassword() {
        return adminPassword;
    }

    public void setAdminPassword(String adminPassword) {
        this.adminPassword = adminPassword;
    }

    public String getAdminFirstName() {
        return adminFirstName;
    }

    public void setAdminFirstName(String adminFirstName) {
        this.adminFirstName = adminFirstName;
    }

    public String getAdminLastName() {
        return adminLastName;
    }

    public void setAdminLastName(String adminLastName) {
        this.adminLastName = adminLastName;
    }

    public String getRegistrationKey() {
        return registrationKey;
    }

    public void setRegistrationKey(String registrationKey) {
        this.registrationKey = registrationKey;
    }
}
