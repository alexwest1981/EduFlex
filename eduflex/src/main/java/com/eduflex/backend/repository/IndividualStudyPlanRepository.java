package com.eduflex.backend.repository;

import com.eduflex.backend.model.IndividualStudyPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface IndividualStudyPlanRepository extends JpaRepository<IndividualStudyPlan, Long> {

    /** Alla planer skapade av en specifik SYV, nyast först. */
    List<IndividualStudyPlan> findByCounselorIdOrderByUpdatedAtDesc(Long counselorId);

    /** Alla versioner av en students plan, senast skapad överst. */
    List<IndividualStudyPlan> findByStudentIdOrderByVersionDesc(Long studentId);

    /** Alla planer, nyast uppdaterad överst (för Admin/Rektor). */
    List<IndividualStudyPlan> findAllByOrderByUpdatedAtDesc();

    /** Senaste aktiva plan för en student. */
    Optional<IndividualStudyPlan> findFirstByStudentIdAndStatusOrderByVersionDesc(
            Long studentId, IndividualStudyPlan.Status status);

    /** Compliance-statistik: antal ISP per status. */
    @Query("SELECT i.status, COUNT(i) FROM IndividualStudyPlan i GROUP BY i.status")
    List<Object[]> countByStatus();

    /** Kontrollera om en student redan har en aktiv eller utkast-plan. */
    boolean existsByStudentIdAndStatusIn(Long studentId, List<IndividualStudyPlan.Status> statuses);
}
