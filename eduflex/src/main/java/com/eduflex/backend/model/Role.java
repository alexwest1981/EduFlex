package com.eduflex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;
import java.io.Serializable;

@Entity
@Table(name = "roles")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Role implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name; // e.g. "ROLE_ADMIN", "ROLE_MENTOR"

    private String description; // e.g. "School Principal"

    @Column(name = "default_dashboard")
    private String defaultDashboard; // ADMIN, TEACHER, STUDENT, PRINCIPAL, MENTOR

    @Column(name = "is_super_admin", columnDefinition = "boolean default false")
    private boolean isSuperAdmin = false;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "role_permissions", joinColumns = @JoinColumn(name = "role_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "permission")
    private Set<Permission> permissions = new HashSet<>();

    public Role() {
    }

    // Compatibility constructor
    public Role(String name, String description, boolean isSuperAdmin) {
        this.name = name;
        this.description = description;
        this.isSuperAdmin = isSuperAdmin;
    }

    public Role(String name, String description, String defaultDashboard, boolean isSuperAdmin) {
        this.name = name;
        this.description = description;
        this.defaultDashboard = defaultDashboard;
        this.isSuperAdmin = isSuperAdmin;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getDefaultDashboard() {
        return defaultDashboard;
    }

    public void setDefaultDashboard(String defaultDashboard) {
        this.defaultDashboard = defaultDashboard;
    }

    public boolean isSuperAdmin() {
        return isSuperAdmin;
    }

    public void setSuperAdmin(boolean superAdmin) {
        isSuperAdmin = superAdmin;
    }

    public Set<Permission> getPermissions() {
        return permissions;
    }

    public void setPermissions(Set<Permission> permissions) {
        this.permissions = permissions;
    }
}
