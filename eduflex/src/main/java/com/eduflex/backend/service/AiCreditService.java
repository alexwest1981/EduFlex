package com.eduflex.backend.service;

import com.eduflex.backend.model.AiCreditBalance;
import com.eduflex.backend.model.AiCreditTransaction;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.AiCreditBalanceRepository;
import com.eduflex.backend.repository.AiCreditTransactionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
public class AiCreditService {

    private final AiCreditBalanceRepository balanceRepository;
    private final AiCreditTransactionRepository transactionRepository;
    private final com.eduflex.backend.service.LicenseService licenseService;

    public AiCreditService(AiCreditBalanceRepository balanceRepository,
            AiCreditTransactionRepository transactionRepository,
            com.eduflex.backend.service.LicenseService licenseService) {
        this.balanceRepository = balanceRepository;
        this.transactionRepository = transactionRepository;
        this.licenseService = licenseService;
    }

    private static final int PRO_INITIAL_CREDITS = 1000;

    @Transactional
    public void awardCredits(User user, int amount, String description) {
        if (amount <= 0)
            return;

        AiCreditBalance balance = getOrCreateBalance(user);

        balance.setBalance(balance.getBalance() + amount);
        balanceRepository.save(balance);

        AiCreditTransaction transaction = AiCreditTransaction.builder()
                .user(user)
                .amount(amount)
                .transactionType("EARN")
                .description(description)
                .build();
        transactionRepository.save(transaction);

        log.info("Awarded {} AI credits to user {}: {}", amount, user.getUsername(), description);
    }

    @Transactional
    public boolean spendCredits(User user, int amount, String description) {
        if (amount <= 0)
            return true;

        // ENTERPRISE tier has unlimited AI credits - no need to check or deduct
        com.eduflex.backend.model.LicenseType tier = licenseService.getTier();
        if (tier == com.eduflex.backend.model.LicenseType.ENTERPRISE) {
            log.debug("User {} on ENTERPRISE tier: skipping credit deduction for {}", user.getUsername(), description);
            return true;
        }

        AiCreditBalance balance = getOrCreateBalance(user);

        if (balance.getBalance() < amount) {
            log.warn("User {} tried to spend {} credits but only has {}", user.getUsername(), amount,
                    balance.getBalance());
            return false;
        }

        balance.setBalance(balance.getBalance() - amount);
        balanceRepository.save(balance);

        AiCreditTransaction transaction = AiCreditTransaction.builder()
                .user(user)
                .amount(-amount)
                .transactionType("SPEND")
                .description(description)
                .build();
        transactionRepository.save(transaction);

        log.info("User {} spent {} AI credits: {}", user.getUsername(), amount, description);
        return true;
    }

    /**
     * Validates if a user is allowed to access AI features based on their license
     * tier.
     * Throws ResponseStatusException(FORBIDDEN) if access is denied.
     */
    public void validateAiAccess(User user) {
        com.eduflex.backend.model.LicenseType tier = licenseService.getTier();

        if (tier == com.eduflex.backend.model.LicenseType.BASIC) {
            log.warn("User {} in BASIC tier attempted to access AI services", user.getUsername());
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN,
                    "Ditt medlemskap (BASIC) inkluderar inte AI-tjänster. Uppgradera till PRO för att få tillgång!");
        }

        // PRO must have at least some credits if we ever want to hard-block at 0 here,
        // but spendCredits handles the actual exhaustion check.
        // This method is primarily for early blocking of BASIC users.
    }

    @Transactional
    public int getBalance(User user) {
        return getOrCreateBalance(user).getBalance();
    }

    private AiCreditBalance getOrCreateBalance(User user) {
        return balanceRepository.findByUser(user).orElseGet(() -> {
            int initialBalance = 0;
            com.eduflex.backend.model.LicenseType tier = licenseService.getTier();

            if (tier == com.eduflex.backend.model.LicenseType.PRO) {
                initialBalance = PRO_INITIAL_CREDITS;
                log.info("Initializing PRO tier user {} with {} credits", user.getUsername(), initialBalance);
            }

            AiCreditBalance newBalance = AiCreditBalance.builder()
                    .user(user)
                    .balance(initialBalance)
                    .build();

            AiCreditBalance saved = balanceRepository.save(newBalance);

            if (initialBalance > 0) {
                AiCreditTransaction transaction = AiCreditTransaction.builder()
                        .user(user)
                        .amount(initialBalance)
                        .transactionType("INITIAL_PRO_PROVISION")
                        .description("Initial credit provisioning for PRO tier license")
                        .build();
                transactionRepository.save(transaction);
            }

            return saved;
        });
    }
}
