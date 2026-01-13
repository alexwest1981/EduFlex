package com.eduflex.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class LogTailerService {

    private static final Logger logger = LoggerFactory.getLogger(LogTailerService.class);

    private final SimpMessagingTemplate messagingTemplate;

    @Value("${logging.file.name:/app/logs/server.log}")
    private String logFilePath;

    private final AtomicLong lastFilePointer = new AtomicLong(0);

    public LogTailerService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Polls the log file for new content every 500ms.
     * This is a simple implementation of "tail -f".
     */
    @Scheduled(fixedDelay = 500)
    public void tailLogFile() {
        try {
            Path path = Paths.get(logFilePath);
            File file = path.toFile();

            if (!file.exists() || !file.canRead()) {
                return;
            }

            long fileLength = file.length();

            // If file is smaller than last pointer, it was likely rotated/truncated. Reset
            // pointer.
            if (fileLength < lastFilePointer.get()) {
                lastFilePointer.set(0);
            }

            // Only read if there is new data
            if (fileLength > lastFilePointer.get()) {
                try (RandomAccessFile raf = new RandomAccessFile(file, "r")) {
                    raf.seek(lastFilePointer.get());
                    String line;
                    while ((line = raf.readLine()) != null) {
                        // Send line to WebSocket topic
                        messagingTemplate.convertAndSend("/topic/logs", line);
                    }
                    lastFilePointer.set(raf.getFilePointer());
                }
            }

        } catch (IOException e) {
            logger.error("Error tailing log file", e);
        }
    }
}
