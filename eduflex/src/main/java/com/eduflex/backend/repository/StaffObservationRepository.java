package com.eduflex.backend.repository;

import com.eduflex.backend.model.StaffObservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StaffObservationRepository extends JpaRepository<StaffObservation, Long> {
    List<StaffObservation> findByObservedTeacherId(Long teacherId);
    List<StaffObservation> findByObserverId(Long observerId);
}
