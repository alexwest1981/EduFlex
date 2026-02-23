package com.eduflex.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * En dummy-leverantör för SMS som bara loggar utskicket.
 * Används när ingen skarp leverantör är konfigurerad.
 */
@Component
public class DummySmsProvider implements SmsProvider {
    private static final Logger logger = LoggerFactory.getLogger(DummySmsProvider.class);

    @Override
    public boolean sendSms(String phoneNumber, String message) {
        logger.info("[SMS DUMMY] Sending SMS to {}: {}", phoneNumber, message);
        return true;
    }

    @Override
    public String getProviderName() {
        return "dummy";
    }
}
