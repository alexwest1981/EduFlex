package com.eduflex.backend.repository;

import com.eduflex.backend.model.XApiStatement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface XApiStatementRepository extends JpaRepository<XApiStatement, Long> {
}
