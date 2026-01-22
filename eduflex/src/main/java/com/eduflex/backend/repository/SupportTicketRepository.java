package com.eduflex.backend.repository;

import com.eduflex.backend.model.SupportTicket;
import com.eduflex.backend.model.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    List<SupportTicket> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<SupportTicket> findByStatusOrderByCreatedAtDesc(TicketStatus status);
}
