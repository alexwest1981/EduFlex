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

        List<BackupResponse> allBackups = new ArrayList<>();
        String[] categories = { "manual", "daily", "weekly", "monthly", "last" };

        for (String cat : categories) {
            File catDir = new File(backupDir, cat);
            if (catDir.exists() && catDir.isDirectory()) {
                File[] files = catDir.listFiles(
                        (dir, name) -> name.endsWith(".sql") || name.endsWith(".sql.gz") || name.endsWith(".sql.bz2"));
                if (files != null) {
                    for (File file : files) {
                        BackupResponse response = new BackupResponse();
                        // ID is the relative path from backupDirectory
                        response.setId(cat + "/" + file.getName());
                        response.setName(file.getName());
                        response.setSize(file.length());
                        response.setCreatedAt(new Date(file.lastModified()));
                        response.setType(cat);
                        allBackups.add(response);
                    }
                }
            }
        }

        // Also check root for legacy backups
        File[] rootFiles = backupDir.listFiles((dir, name) -> name.endsWith(".sql") || name.endsWith(".sql.gz"));
        if (rootFiles != null) {
            for (File file : rootFiles) {
                BackupResponse response = new BackupResponse();
                response.setId(file.getName());
                response.setName(file.getName());
                response.setSize(file.length());
                response.setCreatedAt(new Date(file.lastModified()));
                response.setType("other");
                allBackups.add(response);
            }
        }

        return allBackups.stream()
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

            File manualDir = new File(backupDirectory, "manual");
            if (!manualDir.exists()) {
                manualDir.mkdirs();
            }

            String timestamp = LocalDateTime.now().format(FORMATTER);
            String backupFileName = String.format("manual_backup_%s.sql", timestamp);
            File backupFile = new File(manualDir, backupFileName);

            String dbName = extractDatabaseName(datasourceUrl);

            try {
                // Strategy 1: Native pg_dump
                executePgDump(backupFile, dbName);
            } catch (Exception e) {
                logger.warn("Native backup failed (maybe pg_dump is missing?), trying Docker fallback: {}",
                        e.getMessage());
                // Strategy 2: Docker fallback (assuming db container is 'eduflex-db')
                executeDockerPgDump(backupFile, dbName);
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

    private void executePgDump(File backupFile, String dbName) throws Exception {
        ProcessBuilder pb = new ProcessBuilder(
                "pg_dump",
                "-h", extractHost(datasourceUrl),
                "-p", extractPort(datasourceUrl),
                "-U", dbUsername,
                "-F", "p",
                "-f", backupFile.getAbsolutePath(),
                dbName);

        pb.environment().put("PGPASSWORD", dbPassword);
        Process process = pb.start();
        int exitCode = process.waitFor();

        if (exitCode != 0) {
            BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));
            String errorOutput = errorReader.lines().collect(Collectors.joining("\n"));
            throw new RuntimeException("pg_dump failed (code " + exitCode + "): " + errorOutput);
        }
    }

    private void executeDockerPgDump(File backupFile, String dbName) throws Exception {
        // Output redirection in ProcessBuilder is standard since Java 7
        ProcessBuilder pb = new ProcessBuilder(
                "docker", "exec",
                "-e", "PGPASSWORD=" + dbPassword,
                "eduflex-db",
                "pg_dump",
                "-U", dbUsername,
                "-F", "p",
                dbName);

        // We pipe the output directly to the file to avoid memory issues and handle
        // binary/large data correctly
        pb.redirectOutput(backupFile);

        Process process = pb.start();
        int exitCode = process.waitFor();

        if (exitCode != 0) {
            BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));
            String errorOutput = errorReader.lines().collect(Collectors.joining("\n"));
            throw new RuntimeException("Docker backup failed (code " + exitCode + "): " + errorOutput);
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

            try {
                executePsqlRestore(backupFile, dbName);
            } catch (Exception e) {
                logger.warn("Native restore failed, trying Docker fallback: {}", e.getMessage());
                executeDockerPsqlRestore(backupFile, dbName);
            }

            logger.info("Backup restored successfully: {}", backupId);

        } catch (Exception e) {
            logger.error("Failed to restore backup", e);
            throw new RuntimeException("Failed to restore backup: " + e.getMessage(), e);
        }
    }

    private void executePsqlRestore(File backupFile, String dbName) throws Exception {
        ProcessBuilder pb = new ProcessBuilder(
                "psql",
                "-h", extractHost(datasourceUrl),
                "-p", extractPort(datasourceUrl),
                "-U", dbUsername,
                "-d", dbName,
                "-f", backupFile.getAbsolutePath());

        pb.environment().put("PGPASSWORD", dbPassword);
        Process process = pb.start();
        int exitCode = process.waitFor();

        if (exitCode != 0) {
            BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));
            String errorOutput = errorReader.lines().collect(Collectors.joining("\n"));
            throw new RuntimeException("psql restore failed (code " + exitCode + "): " + errorOutput);
        }
    }

    private void executeDockerPsqlRestore(File backupFile, String dbName) throws Exception {
        // For restore, we need to feed the file content into stdin
        ProcessBuilder pb = new ProcessBuilder(
                "docker", "exec", "-i",
                "-e", "PGPASSWORD=" + dbPassword,
                "eduflex-db",
                "psql",
                "-U", dbUsername,
                "-d", dbName);

        pb.redirectInput(backupFile);
        Process process = pb.start();
        int exitCode = process.waitFor();

        if (exitCode != 0) {
            BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));
            String errorOutput = errorReader.lines().collect(Collectors.joining("\n"));
            throw new RuntimeException("Docker restore failed (code " + exitCode + "): " + errorOutput);
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

    public File getBackupFile(String backupId) {
        File file = new File(backupDirectory, backupId);
        if (!file.exists()) {
            throw new RuntimeException("Backup file not found: " + backupId);
        }
        return file;
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
