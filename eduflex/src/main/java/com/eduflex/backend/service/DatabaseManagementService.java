package com.eduflex.backend.service;

import com.eduflex.backend.dto.DatabaseConnectionResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DatabaseManagementService {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseManagementService.class);

    @Value("${spring.datasource.url}")
    private String primaryDatasourceUrl;

    @Value("${backup.database.url:}")
    private String backupDatasourceUrl;

    @Value("${backup.database.enabled:false}")
    private boolean backupDatabaseEnabled;

    private String activeConnectionId = "primary";

    public Map<String, Object> getConnections() {
        List<DatabaseConnectionResponse> connections = new ArrayList<>();

        // Primary database
        DatabaseConnectionResponse primary = new DatabaseConnectionResponse();
        primary.setId("primary");
        primary.setName("Primary Database");
        primary.setHost(extractHost(primaryDatasourceUrl));
        primary.setPort(Integer.parseInt(extractPort(primaryDatasourceUrl)));
        primary.setDatabase(extractDatabaseName(primaryDatasourceUrl));
        primary.setActive("primary".equals(activeConnectionId));
        connections.add(primary);

        // Backup database (if configured)
        if (backupDatabaseEnabled && backupDatasourceUrl != null && !backupDatasourceUrl.isEmpty()) {
            DatabaseConnectionResponse backup = new DatabaseConnectionResponse();
            backup.setId("backup");
            backup.setName("Backup Database");
            backup.setHost(extractHost(backupDatasourceUrl));
            backup.setPort(Integer.parseInt(extractPort(backupDatasourceUrl)));
            backup.setDatabase(extractDatabaseName(backupDatasourceUrl));
            backup.setActive("backup".equals(activeConnectionId));
            connections.add(backup);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("connections", connections);
        result.put("active", activeConnectionId);

        return result;
    }

    public void switchDatabase(String connectionId, String adminPassword) {
        logger.warn("Database switching requested to: {}", connectionId);
        logger.warn("Admin password verification would happen here in production");
        logger.warn("NOTE: Actual database switching requires application restart with updated configuration");
        logger.warn("This is a placeholder implementation. In production, this would:");
        logger.warn("1. Verify admin password");
        logger.warn("2. Update application.properties or environment variables");
        logger.warn("3. Trigger a graceful application restart");
        logger.warn("4. Verify new database connection before completing switch");

        // In a real implementation, you would:
        // 1. Verify the admin password
        // 2. Update the datasource configuration
        // 3. Restart the application or reload the datasource
        // 4. Verify the connection

        activeConnectionId = connectionId;

        throw new UnsupportedOperationException(
                "Database switching requires manual configuration update and application restart. " +
                        "Please update spring.datasource.url in application.properties and restart the service.");
    }

    public void addDatabase(com.eduflex.backend.dto.AddDatabaseRequest request) {
        logger.info("Adding new database connection: {}", request.getName());
        logger.warn("Admin password verification would happen here in production");
        logger.warn("NOTE: This is a placeholder implementation");
        logger.warn("In production, this would:");
        logger.warn("1. Verify admin password");
        logger.warn("2. Store encrypted database credentials");
        logger.warn("3. Test the connection");
        logger.warn("4. Save to configuration");

        // In a real implementation, you would:
        // 1. Verify the admin password
        // 2. Encrypt and store the database credentials
        // 3. Test the connection before saving
        // 4. Save to a configuration store (database or file)

        throw new UnsupportedOperationException(
                "Adding database connections requires configuration management implementation. " +
                        "Please manually add database configuration to application.properties.");
    }

    private String extractDatabaseName(String jdbcUrl) {
        int lastSlash = jdbcUrl.lastIndexOf('/');
        int questionMark = jdbcUrl.indexOf('?', lastSlash);
        if (questionMark > 0) {
            return jdbcUrl.substring(lastSlash + 1, questionMark);
        }
        return jdbcUrl.substring(lastSlash + 1);
    }

    private String extractHost(String jdbcUrl) {
        int start = jdbcUrl.indexOf("//") + 2;
        int end = jdbcUrl.indexOf(':', start);
        return jdbcUrl.substring(start, end);
    }

    private String extractPort(String jdbcUrl) {
        int start = jdbcUrl.indexOf(':', jdbcUrl.indexOf("//")) + 1;
        int end = jdbcUrl.indexOf('/', start);
        return jdbcUrl.substring(start, end);
    }
}
