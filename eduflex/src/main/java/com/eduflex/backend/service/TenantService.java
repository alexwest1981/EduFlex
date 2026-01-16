package com.eduflex.backend.service;

import com.eduflex.backend.model.Tenant;
import com.eduflex.backend.repository.TenantRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import javax.sql.DataSource;
import org.flywaydb.core.Flyway;

@Service
public class TenantService {

    private static final Logger logger = LoggerFactory.getLogger(TenantService.class);

    private final TenantRepository tenantRepository;
    private final DataSource dataSource;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public TenantService(TenantRepository tenantRepository, DataSource dataSource, PasswordEncoder passwordEncoder) {
        this.tenantRepository = tenantRepository;
        this.dataSource = dataSource;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(rollbackFor = Exception.class)
    public Tenant createTenant(String name, String domain, String dbSchema, String organizationKey, String adminEmail,
            String adminPassword, String adminFirstName, String adminLastName) {
        if (tenantRepository.existsById(organizationKey)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "Tenant with key " + organizationKey + " already exists.");
        }
        if (tenantRepository.findByDomain(domain).isPresent()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "Tenant with domain " + domain + " already exists.");
        }
        if (tenantRepository.findByDbSchema(dbSchema).isPresent()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "Tenant with schema " + dbSchema + " already exists.");
        }

        // 1. Create Tenant Entity
        Tenant tenant = new Tenant();
        tenant.setId(organizationKey);
        tenant.setName(name);
        tenant.setDomain(domain);
        tenant.setDbSchema(dbSchema);
        tenant.setActive(true);

        tenant = tenantRepository.save(tenant);
        logger.info("Saved Tenant entity: {}", tenant.getId());

        // 2. Create Schema
        initTenantSchema(dbSchema, name);
        createInitialAdminUser(dbSchema, adminEmail, adminPassword, adminFirstName, adminLastName);

        return tenant;
    }

    // --- Helper methods for frontend compatibility ---

    public java.util.List<Tenant> getAllTenants() {
        return tenantRepository.findAll();
    }

    public void deleteTenant(Long id) {
        // Warning: This does not drop the schema!
        tenantRepository.deleteById(String.valueOf(id)); // ID is String in DB? Wait, tenantRepository.existsById says
                                                         // String
    }

    // Override med Long för att matcha controllern om ID är long
    public void deleteTenant(String id) {
        tenantRepository.deleteById(id);
    }

    @Transactional
    public void initSchema(Long id) {
        Tenant tenant = tenantRepository.findById(String.valueOf(id)).orElseThrow();
        initTenantSchema(tenant.getDbSchema(), tenant.getName());
    }

    // "Raw" create matching the simple UI
    public Tenant createTenantRaw(String name, String tenantId, String schema) {
        // Default admin credentials for quick create
        String defaultAdmin = "admin@" + tenantId + ".local";
        return createTenant(name, tenantId, schema, tenantId, defaultAdmin, "admin", "Admin", "User");
    }

    // Make this public so we can call it from initSchema
    public void initTenantSchema(String schema, String tenantName) {
        logger.info("Initializing schema: {} for tenant: {}", schema, tenantName);
        try (java.sql.Connection connection = dataSource.getConnection();
                java.sql.Statement statement = connection.createStatement()) {

            // 1. Create Schema
            statement.execute("CREATE SCHEMA IF NOT EXISTS \"" + schema + "\"");
            logger.info("Schema {} created (or already exists).", schema);

            // 2. Run Flyway Migration
            Flyway flyway = Flyway.configure()
                    .dataSource(dataSource)
                    .schemas(schema)
                    .locations("classpath:db/migration")
                    .baselineOnMigrate(true)
                    .load();

            flyway.migrate();
            logger.info("Flyway migration completed for schema: {}", schema);

        } catch (Exception e) {
            logger.error("Error creating schema {}: {}", schema, e.getMessage(), e);
            throw new RuntimeException("Failed to create schema: " + schema, e);
        }
    }

    private void createInitialAdminUser(String schema, String email, String password, String firstName,
            String lastName) {
        logger.info("Creating initial admin user for schema: {}", schema);

        try (java.sql.Connection connection = dataSource.getConnection()) {
            // 1. First, create the ADMIN role if it doesn't exist
            String insertRoleSql = "INSERT INTO \"" + schema
                    + "\".roles (name, description, is_super_admin, default_dashboard) "
                    + "VALUES ('ADMIN', 'Administrator', true, 'ADMIN') "
                    + "ON CONFLICT (name) DO NOTHING";

            try (java.sql.Statement stmt = connection.createStatement()) {
                stmt.execute(insertRoleSql);
                logger.info("ADMIN role ensured for schema: {}", schema);
            }

            // 2. Get the ADMIN role ID
            String getRoleIdSql = "SELECT id FROM \"" + schema + "\".roles WHERE name = 'ADMIN'";
            Long roleId = null;
            try (java.sql.Statement stmt = connection.createStatement();
                    java.sql.ResultSet rs = stmt.executeQuery(getRoleIdSql)) {
                if (rs.next()) {
                    roleId = rs.getLong("id");
                }
            }

            if (roleId == null) {
                throw new RuntimeException("Failed to get ADMIN role ID");
            }

            // 3. Create the admin user with the role_id
            String insertUserSql = "INSERT INTO \"" + schema
                    + "\".app_users (email, username, password, first_name, last_name, role_id, is_active, created_at) "
                    + "VALUES (?, ?, ?, ?, ?, ?, true, NOW())";

            try (java.sql.PreparedStatement ps = connection.prepareStatement(insertUserSql)) {
                ps.setString(1, email);
                ps.setString(2, email); // Use email as username
                ps.setString(3, passwordEncoder.encode(password));
                ps.setString(4, firstName);
                ps.setString(5, lastName);
                ps.setLong(6, roleId);

                ps.executeUpdate();
                logger.info("Admin user created successfully for schema: {}", schema);
            }

        } catch (Exception e) {
            logger.error("Error creating admin user: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create admin user", e);
        }
    }
}
