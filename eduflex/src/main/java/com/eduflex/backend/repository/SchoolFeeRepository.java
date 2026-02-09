package com.eduflex.backend.repository;

import com.eduflex.backend.model.SchoolFee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SchoolFeeRepository extends JpaRepository<SchoolFee, Long> {
    long countByIsPaid(boolean isPaid);
}
