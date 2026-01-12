package com.eduflex.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class RoleRequest {
    private String name;
    private String description;
    private List<String> permissions;

    @JsonProperty("isSuperAdmin")
    private boolean isSuperAdmin;

    public RoleRequest() {
    }

    public RoleRequest(String name, String description, List<String> permissions) {
        this.name = name;
        this.description = description;
        this.permissions = permissions;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getPermissions() {
        return permissions;
    }

    public void setPermissions(List<String> permissions) {
        this.permissions = permissions;
    }

    public boolean isSuperAdmin() {
        return isSuperAdmin;
    }

    public void setSuperAdmin(boolean superAdmin) {
        isSuperAdmin = superAdmin;
    }
}
