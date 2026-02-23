package com.eduflex.backend.service;

public interface SmsProvider {
    boolean sendSms(String phoneNumber, String message);

    String getProviderName();
}
