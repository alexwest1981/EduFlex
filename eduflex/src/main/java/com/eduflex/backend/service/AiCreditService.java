package com.eduflex.backend.service;

import com.eduflex.backend.model.AiCreditBalance;
import com.eduflex.backend.model.AiCreditTransaction;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.AiCreditBalanceRepository;
import com.eduflex.backend.repository.AiCreditTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiCreditService {

    private final AiCreditBalanceRepository balanceRepository;
    private final AiCreditTransactionRepository transactionRepository;

    @Transactional
    public void awardCredits(User user, int amount, String description) {
        if (amount <= 0)
            return;

        AiCreditBalance balance = balanceRepository.findByUser(user)
                .orElse(AiCreditBalance.builder().user(user).balance(0).build());

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

        AiCreditBalance balance = balanceRepository.findByUser(user)
                .orElse(AiCreditBalance.builder().user(user).balance(0).build());

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

    public int getBalance(User user) {
        return balanceRepository.findByUser(user)
                .map(AiCreditBalance::getBalance)
                .orElse(0);
    }
}
