package com.eduflex.backend.repository;

import com.eduflex.backend.model.AiCreditTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AiCreditTransactionRepository extends JpaRepository<AiCreditTransaction, Long> {
    Page<AiCreditTransaction> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
