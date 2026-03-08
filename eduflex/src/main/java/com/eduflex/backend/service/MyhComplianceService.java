package com.eduflex.backend.service;

import com.eduflex.backend.model.LiaPlacement;
import com.eduflex.backend.repository.LiaPlacementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MyhComplianceService {

    private final LiaPlacementRepository liaPlacementRepository;

    /**
     * Checks all LIA placements and generates a list of compliance warnings.
     * These warnings are intended for the LIA Admin Matrix Frontend.
     * Warning criteria:
     * - PLANNED placement starting within 14 days, but no agreement signed.
     * - ONGOING placement past its midpoint, but no midterm evaluation done.
     * - COMPLETED placement within 30 days, but no final evaluation done.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getComplianceWarnings() {
        log.info("Generating MYH Compliance warnings for LIA placements...");
        List<LiaPlacement> allActive = liaPlacementRepository.findAll();
        List<Map<String, Object>> warnings = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (LiaPlacement placement : allActive) {
            boolean hasWarning = false;
            String reason = "";

            if (placement.getStatus() == LiaPlacement.LiaStatus.PLANNED) {
                if (!placement.isAgreementSigned() && placement.getStartDate() != null) {
                    long daysToStart = ChronoUnit.DAYS.between(today, placement.getStartDate());
                    if (daysToStart <= 14) {
                        hasWarning = true;
                        reason = "Missed Agreement: Starts in " + daysToStart + " days and no LIA Agreement signed.";
                    }
                }
            } else if (placement.getStatus() == LiaPlacement.LiaStatus.ONGOING) {
                if (!placement.isMidtermEvaluationDone() && placement.getStartDate() != null
                        && placement.getEndDate() != null) {
                    LocalDate midPoint = placement.getStartDate().plusDays(
                            ChronoUnit.DAYS.between(placement.getStartDate(), placement.getEndDate()) / 2);
                    if (today.isAfter(midPoint) || today.isEqual(midPoint)) {
                        hasWarning = true;
                        reason = "Missing Midterm Eval: Placement has passed halfway mark.";
                    }
                }
            } else if (placement.getStatus() == LiaPlacement.LiaStatus.COMPLETED) {
                if (!placement.isFinalEvaluationDone() && placement.getEndDate() != null) {
                    long daysSinceEnd = ChronoUnit.DAYS.between(placement.getEndDate(), today);
                    if (daysSinceEnd <= 30) {
                        hasWarning = true;
                        reason = "Missing Final Eval: Placement ended " + daysSinceEnd + " days ago.";
                    }
                }
            }

            if (hasWarning) {
                Map<String, Object> w = new HashMap<>();
                w.put("placementId", placement.getId());
                w.put("studentId", placement.getStudent().getId());
                w.put("studentName", placement.getStudent().getFullName());
                w.put("courseName", placement.getCourse().getName());
                w.put("companyName", placement.getCompanyName());
                w.put("reason", reason);
                w.put("status", placement.getStatus().name());
                warnings.add(w);
            }
        }

        return warnings;
    }
}
