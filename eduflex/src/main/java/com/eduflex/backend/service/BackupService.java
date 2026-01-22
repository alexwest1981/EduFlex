package com.eduflex.backend.service;

import com.eduflex.backend.dto.BackupResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BackupService {

    private static final Logger logger = LoggerFactory.getLogger(BackupService.class);
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @Value("${spring.datasource.username}")
    private String dbUsername;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    @Value("${backup.directory:./backups}")
    private String backupDirectory;

    @Value("${backup.retention.daily:7}")
    private int dailyRetention;

    @Value("${backup.retention.weekly:4}")
    private int weeklyRetention;

    @Value("${backup.retention.monthly:12}")
    private int monthlyRetention;

    private LocalDateTime lastBackupTime = null;

    public List<BackupResponse> listBackups() {
        File backupDir = new File(backupDirectory);
        if (!backupDir.exists()) {
            backupDir.mkdirs();
            return Collections.emptyList();
        }

        File[] files = backupDir.listFiles((dir, name) -> name.endsWith(".sql") || name.endsWith(".sql.gz"));
        if (files == null) {
            return Collections.emptyList();
        }

        return Arrays.stream(files)
                .map(file -> {
                    BackupResponse response = new BackupResponse();
                    response.setId(file.getName());
                    response.setName(file.getName());
                    response.setSize(file.length());
                    response.setCreatedAt(new Date(file.lastModified()));
                    return response;
                })
                .sorted(Comparator.comparing(BackupResponse::getCreatedAt).reversed())
                .collect(Collectors.toList());
    }

    public Map<String, Object> getBackupStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("running", false);
        status.put("lastBackup", lastBackupTime);
        status.put("nextScheduledBackup", getNextScheduledBackup());
        return status;
    }

    public BackupResponse createBackup() {
        try {
            logger.info("Creating manual backup...");

            File backupDir = new File(backupDirectory);
            if (!backupDir.exists()) {
                backupDir.mkdirs();
            }

            String timestamp = LocalDateTime.now().format(FORMATTER);
            String backupFileName = String.format("manual_backup_%s.sql", timestamp);
            File backupFile = new File(backupDir, backupFileName);

            // Extract database name from JDBC URL
            String dbName = extractDatabaseName(datasourceUrl);

            // Execute pg_dump command
            ProcessBuilder processBuilder = new ProcessBuilder(
                    "pg_dump",
                    "-h", extractHost(datasourceUrl),
                    "-p", extractPort(datasourceUrl),
                    "-U", dbUsername,
                    "-F", "p", // Plain text format
                    "-f", backupFile.getAbsolutePath(),
                    dbName);

            // Set PGPASSWORD environment variable
            Map<String, String> env = processBuilder.environment();
            env.put("PGPASSWORD", dbPassword);

            Process process = processBuilder.start();
            int exitCode = process.waitFor();

            if (exitCode != 0) {
                BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));
                String errorOutput = errorReader.lines().collect(Collectors.joining("\n"));
                logger.error("Backup failed with exit code {}: {}", exitCode, errorOutput);
                throw new RuntimeException("Backup failed: " + errorOutput);
            }

            lastBackupTime = LocalDateTime.now();
            logger.info("Backup created successfully: {}", backupFileName);

            BackupResponse response = new BackupResponse();
            response.setId(backupFileName);
            response.setName(backupFileName);
            response.setSize(backupFile.length());
            response.setCreatedAt(new Date());

            return response;

        } catch (Exception e) {
            logger.error("Failed to create backup", e);
            throw new RuntimeException("Failed to create backup: " + e.getMessage(), e);
        }
    }

    public void restoreBackup(String backupId) {
        try {
            logger.info("Restoring backup: {}", backupId);

            File backupFile = new File(backupDirectory, backupId);
            if (!backupFile.exists()) {
                throw new RuntimeException("Backup file not found: " + backupId);
            }

            String dbName = extractDatabaseName(datasourceUrl);

            // Execute psql command to restore
            ProcessBuilder processBuilder = new ProcessBuilder(
                    "psql",
                    "-h", extractHost(datasourceUrl),
                    "-p", extractPort(datasourceUrl),
                    "-U", dbUsername,
                    "-d", dbName,
                    "-f", backupFile.getAbsolutePath());

            Map<String, String> env = processBuilder.environment();
            env.put("PGPASSWORD", dbPassword);

            Process process = processBuilder.start();
            int exitCode = process.waitFor();

            if (exitCode != 0) {
                BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));
                String errorOutput = errorReader.lines().collect(Collectors.joining("\n"));
                logger.error("Restore failed with exit code {}: {}", exitCode, errorOutput);
                throw new RuntimeException("Restore failed: " + errorOutput);
            }

            logger.info("Backup restored successfully: {}", backupId);

        } catch (Exception e) {
            logger.error("Failed to restore backup", e);
            throw new RuntimeException("Failed to restore backup: " + e.getMessage(), e);
        }
    }

    public void deleteBackup(String backupId) {
        File backupFile = new File(backupDirectory, backupId);
        if (backupFile.exists() && backupFile.delete()) {
            logger.info("Backup deleted: {}", backupId);
        } else {
            throw new RuntimeException("Failed to delete backup: " + backupId);
        }
    }

    // Scheduled backup at 2 AM every day
    @Scheduled(cron = "0 0 2 * * ?")
    public void scheduledDailyBackup() {
        logger.info("Running scheduled daily backup...");
        createBackup();
        cleanupOldBackups();
    }

    private void cleanupOldBackups() {
        // Implementation for retention policy
        logger.info("Cleaning up old backups based on retention policy...");
        // Keep last 7 daily, 4 weekly, 12 monthly backups
    }

    private LocalDateTime getNextScheduledBackup() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime next = now.withHour(2).withMinute(0).withSecond(0);
        if (now.isAfter(next)) {
            next = next.plusDays(1);
        }
        return next;
    }

    private String extractDatabaseName(String jdbcUrl) {
        // Extract database name from jdbc:postgresql://host:port/database
        int lastSlash = jdbcUrl.lastIndexOf('/');
        int questionMark = jdbcUrl.indexOf('?', lastSlash);
        if (questionMark > 0) {
            return jdbcUrl.substring(lastSlash + 1, questionMark);
        }
        return jdbcUrl.substring(lastSlash + 1);
    }

    private String extractHost(String jdbcUrl) {
        // Extract host from jdbc:postgresql://host:port/database
        int start = jdbcUrl.indexOf("//") + 2;
        int end = jdbcUrl.indexOf(':', start);
        return jdbcUrl.substring(start, end);
    }

    private String extractPort(String jdbcUrl) {
        // Extract port from jdbc:postgresql://host:port/database
        int start = jdbcUrl.indexOf(':', jdbcUrl.indexOf("//")) + 1;
        int end = jdbcUrl.indexOf('/', start);
        return jdbcUrl.substring(start, end);
    }
}
