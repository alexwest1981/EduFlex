package com.eduflex.backend.repository;

import com.eduflex.backend.model.WellbeingSupportRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WellbeingSupportRepository extends JpaRepository<WellbeingSupportRequest, Long> {
    List<WellbeingSupportRequest> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<WellbeingSupportRequest> findByStatusInOrderByCreatedAtDesc(
            List<WellbeingSupportRequest.RequestStatus> statuses);
}
