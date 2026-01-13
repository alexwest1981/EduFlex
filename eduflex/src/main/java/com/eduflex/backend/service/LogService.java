package com.eduflex.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class LogService {

    // Default to /app/logs if not specified, but we set logging.file.name in
    // properties
    @Value("${logging.file.name:/app/logs/server.log}")
    private String logFilePath;

    public List<String> getAvailableLogFiles() {
        try {
            Path logDir = Paths.get(logFilePath).getParent();
            if (logDir == null || !Files.exists(logDir)) {
                return Collections.emptyList();
            }

            try (Stream<Path> stream = Files.list(logDir)) {
                return stream
                        .filter(file -> !Files.isDirectory(file))
                        .map(Path::getFileName)
                        .map(Path::toString)
                        .collect(Collectors.toList());
            }
        } catch (IOException e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    public List<String> getLogContent(String filename, int lines) throws IOException {
        Path logDir = Paths.get(logFilePath).getParent();
        if (logDir == null)
            return Collections.emptyList();

        Path file = logDir.resolve(filename);

        // Security check: prevent directory traversal
        if (!file.normalize().startsWith(logDir.normalize())) {
            throw new SecurityException("Access denied");
        }

        if (!Files.exists(file)) {
            throw new IOException("File not found: " + filename);
        }

        // Read all lines and take the last N lines (tail)
        // Note: For very large files, this is inefficient. Using RandomAccessFile would
        // be better.
        // But for typical rotating logs < 10MB, this is acceptable for a simple
        // dashboard.
        List<String> allLines = Files.readAllLines(file);
        int start = Math.max(0, allLines.size() - lines);
        return allLines.subList(start, allLines.size());
    }
}
