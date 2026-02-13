package com.eduflex.backend.repository;

import com.eduflex.backend.model.WellbeingSupportMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WellbeingSupportMessageRepository extends JpaRepository<WellbeingSupportMessage, Long> {
    List<WellbeingSupportMessage> findByRequestIdOrderByCreatedAtAsc(Long requestId);
}
