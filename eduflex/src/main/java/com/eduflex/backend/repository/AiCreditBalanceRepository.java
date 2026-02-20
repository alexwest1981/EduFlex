package com.eduflex.backend.repository;

import com.eduflex.backend.model.AiCreditBalance;
import com.eduflex.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AiCreditBalanceRepository extends JpaRepository<AiCreditBalance, Long> {
    Optional<AiCreditBalance> findByUser(User user);

    Optional<AiCreditBalance> findByUserId(Long userId);
}
