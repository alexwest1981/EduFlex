package com.eduflex.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SmsService {
    private static final Logger logger = LoggerFactory.getLogger(SmsService.class);

    private final List<SmsProvider> providers;

    @Value("${eduflex.sms.provider:dummy}")
    private String activeProviderName;

    public SmsService(List<SmsProvider> providers) {
        this.providers = providers;
    }

    /**
     * Skickar ett SMS asynkront via den konfigurerade leverantören.
     */
    @Async
    public void sendSms(String phoneNumber, String message) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            logger.warn("Attempted to send SMS to empty phone number");
            return;
        }

        SmsProvider provider = providers.stream()
                .filter(p -> p.getProviderName().equalsIgnoreCase(activeProviderName))
                .findFirst()
                .orElseGet(() -> {
                    logger.warn("SMS Provider '{}' not found, falling back to dummy", activeProviderName);
                    return providers.stream()
                            .filter(p -> p instanceof DummySmsProvider)
                            .findFirst()
                            .orElse(null);
                });

        if (provider != null) {
            boolean success = provider.sendSms(phoneNumber, message);
            if (success) {
                logger.info("SMS sent successfully to {} via {}", phoneNumber, provider.getProviderName());
            } else {
                logger.error("Failed to send SMS to {} via {}", phoneNumber, provider.getProviderName());
            }
        } else {
            logger.error("No SMS provider available to send message to {}", phoneNumber);
        }
    }
}
