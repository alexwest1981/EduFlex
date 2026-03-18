package com.eduflex.backend.repository;

import com.eduflex.backend.model.LiaPlacement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LiaPlacementRepository extends JpaRepository<LiaPlacement, Long> {

    List<LiaPlacement> findByCourseId(Long courseId);

    List<LiaPlacement> findByStudentId(Long studentId);

    List<LiaPlacement> findByCourseIdAndStudentId(Long courseId, Long studentId);

    // Queries for MYH Compliance Tracking
    @Query("SELECT l FROM LiaPlacement l WHERE l.agreementSigned = false AND l.status != 'CANCELLED'")
    List<LiaPlacement> findPlacementsMissingAgreement();

    @Query("SELECT l FROM LiaPlacement l WHERE l.midtermEvaluationDone = false AND l.status = 'ONGOING'")
    List<LiaPlacement> findOngoingPlacementsMissingMidtermEvaluation();

    @Query("SELECT l FROM LiaPlacement l WHERE l.finalEvaluationDone = false AND l.status = 'COMPLETED'")
    List<LiaPlacement> findCompletedPlacementsMissingFinalEvaluation();
}
