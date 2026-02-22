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
            String adminPassword, String adminFirstName, String adminLastName, String stripeCustomerId,
            String stripeSubscriptionId) {
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

        // 0. Sanitize Inputs
        if (name != null)
            name = name.trim();
        if (domain != null)
            domain = domain.trim();
        if (dbSchema != null)
            dbSchema = dbSchema.trim();

        if (dbSchema == null || dbSchema.isEmpty()) {
            throw new IllegalArgumentException("Database schema cannot be empty");
        }

        // 1. Create Tenant Entity
        Tenant tenant = new Tenant();
        tenant.setId(organizationKey);
        tenant.setName(name);
        tenant.setDomain(domain);
        tenant.setDbSchema(dbSchema);
        tenant.setStripeCustomerId(stripeCustomerId);
        tenant.setStripeSubscriptionId(stripeSubscriptionId);
        tenant.setActive(true);

        tenant = tenantRepository.save(tenant);
        logger.info("Saved Tenant entity: {}, Schema: '{}', StripeCustomer: {}", tenant.getId(), dbSchema,
                stripeCustomerId);

        // 2. Create Schema
        initTenantSchema(dbSchema, name);
        createInitialAdminUser(dbSchema, adminEmail, adminPassword, adminFirstName, adminLastName);

        return tenant;
    }

    @Transactional
    public void deactivateTenantByStripeCustomer(String stripeCustomerId) {
        tenantRepository.findByStripeCustomerId(stripeCustomerId).ifPresent(tenant -> {
            logger.warn("Deactivating tenant: {} due to subscription cancellation.", tenant.getId());
            tenant.setActive(false);
            tenantRepository.save(tenant);
        });
    }

    // --- Helper methods for frontend compatibility ---

    public java.util.List<Tenant> getAllTenants() {
        return tenantRepository.findAll();
    }

    public Tenant getTenant(String id) {
        return tenantRepository.findById(id).orElseThrow(() -> new RuntimeException("Tenant not found: " + id));
    }

    public void deleteTenant(String id) {
        tenantRepository.deleteById(id);
    }

    @Transactional
    public void initSchema(String id) {
        Tenant tenant = tenantRepository.findById(id).orElseThrow();
        initTenantSchema(tenant.getDbSchema(), tenant.getName());
    }

    // "Raw" create matching the simple UI
    public Tenant createTenantRaw(String name, String tenantId, String schema) {
        // Default admin credentials for quick create
        String defaultAdmin = "admin@" + tenantId + ".local";
        return createTenant(name, tenantId, schema, tenantId, defaultAdmin, "admin", "Admin", "User", null, null);
    }

    // Make this public so we can call it from initSchema
    public void initTenantSchema(String schema, String tenantName) {
        logger.info("Initializing schema: {} for tenant: {}", schema, tenantName);
        try (java.sql.Connection connection = dataSource.getConnection();
                java.sql.Statement statement = connection.createStatement()) {

            // 1. Create Schema (Skip for 'public' as it always exists)
            if (!"public".equalsIgnoreCase(schema)) {
                statement.execute("CREATE SCHEMA IF NOT EXISTS \"" + schema + "\"");
                logger.info("Schema {} created (or already exists).", schema);
            } else {
                logger.info("Skipping CREATE SCHEMA for 'public' schema.");
            }

            // 2. Run Flyway Migration
            Flyway flyway = Flyway.configure()
                    .dataSource(dataSource)
                    .schemas(schema)
                    .locations("classpath:db/migration")
                    .baselineOnMigrate(true)
                    .outOfOrder(true)
                    .validateOnMigrate(false)
                    .load();

            flyway.repair();
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

            // 4. Assign ALL permissions to the ADMIN role
            StringBuilder insertPermsSql = new StringBuilder(
                    "INSERT INTO \"" + schema + "\".role_permissions (role_id, permission) VALUES ");
            com.eduflex.backend.model.Permission[] allPerms = com.eduflex.backend.model.Permission.values();

            for (int i = 0; i < allPerms.length; i++) {
                insertPermsSql.append("(").append(roleId).append(", '").append(allPerms[i].name()).append("')");
                if (i < allPerms.length - 1) {
                    insertPermsSql.append(", ");
                }
            }
            insertPermsSql.append(" ON CONFLICT DO NOTHING");

            try (java.sql.Statement stmt = connection.createStatement()) {
                stmt.execute(insertPermsSql.toString());
                logger.info("Assigned all permissions to ADMIN role for schema: {}", schema);
            }

            // 5. Populate System Modules
            logger.info("Populating default system modules for schema: {}", schema);
            String insertModulesSql = "INSERT INTO \"" + schema
                    + "\".system_modules (module_key, name, description, is_active, requires_license) VALUES " +
                    "('DARK_MODE', 'Dark Mode Core', 'Globalt mörkt tema för hela plattformen.', true, false), " +
                    "('SUBMISSIONS', 'Inlämningar', 'Hantera inlämningsuppgifter och bedömning.', true, false), " +
                    "('CHAT', 'EduChat Pro', 'Realtidskommunikation via WebSockets.', true, true), " +
                    "('FORUM', 'Forum (Community)', 'Gemensam diskussionsforum med trådar och inlägg.', true, true), " +
                    "('QUIZ_BASIC', 'QuizRunner Basic', 'Skapa och genomför egna quiz (Manuellt).', true, false), " +
                    "('QUIZ_PRO', 'QuizRunner Pro', 'Avancerad quizhantering med frågebank och AI-generering.', true, true), "
                    +
                    "('GAMIFICATION', 'Gamification Engine', 'Belöningssystem: Badges, Achievements, Leaderboards.', true, true), "
                    +
                    "('ANALYTICS', 'Analytics Dashboard', 'Systemanalys & datavisualisering.', true, true), " +
                    "('ENTERPRISE_WHITELABEL', 'Enterprise Whitelabel', 'Fullt anpassningsbar branding: logotyp, färgtema, favicon och mer. Endast för ENTERPRISE-licens.', true, true), "
                    +
                    "('SCORM', 'SCORM / xAPI Integration', 'Importera och kör interaktiva kurspaket (SCORM 1.2).', true, true), "
                    +
                    "('REVENUE', 'Revenue Management', 'Prenumerationer, betalningar och fakturering.', false, true) " +
                    "ON CONFLICT (module_key) DO NOTHING";

            try (java.sql.Statement stmt = connection.createStatement()) {
                stmt.execute(insertModulesSql);
                logger.info("Default system modules populated for schema: {}", schema);
            }

        } catch (Exception e) {
            logger.error("Error creating admin user: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create admin user", e);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void ensureDemoTenantExists() {
        String demoKey = "demo";
        String demoDomain = "demo.eduflexlms.se";
        String demoSchema = "tenant_demo";

        if (!tenantRepository.existsById(demoKey)) {
            logger.info("🚀 Provisioning demo tenant: {}", demoKey);
            createTenant(
                    "EduFlex Demo-Skola",
                    demoDomain,
                    demoSchema,
                    demoKey,
                    "admin@demo.eduflexlms.se",
                    "admin",
                    "Demo",
                    "Admin",
                    null,
                    null);
        }
    }
}
