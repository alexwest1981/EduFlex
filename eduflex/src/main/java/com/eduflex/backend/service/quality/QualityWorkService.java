package com.eduflex.backend.service.quality;

import com.eduflex.backend.model.quality.QualityGoal;
import com.eduflex.backend.model.quality.QualityIndicator;
import com.eduflex.backend.repository.AttendanceRepository;
import com.eduflex.backend.repository.CourseResultRepository;
import com.eduflex.backend.repository.IncidentReportRepository;
import com.eduflex.backend.repository.quality.QualityGoalRepository;
import com.eduflex.backend.repository.quality.QualityIndicatorRepository;
import com.eduflex.backend.repository.quality.QualityCheckpointRepository;
import com.eduflex.backend.model.quality.QualityCheckpoint;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class QualityWorkService {

    private final QualityGoalRepository goalRepository;
    private final QualityIndicatorRepository indicatorRepository;
    private final AttendanceRepository attendanceRepository;
    private final CourseResultRepository courseResultRepository;
    private final IncidentReportRepository incidentReportRepository;
    private final QualityCheckpointRepository checkpointRepository;

    public List<QualityGoal> getAllActiveGoals() {
        return goalRepository.findByStatus("ACTIVE");
    }

    @Transactional
    public void calculateIndicators(Long goalId) {
        List<QualityIndicator> indicators = indicatorRepository.findByGoalId(goalId);
        for (QualityIndicator indicator : indicators) {
            updateIndicatorValue(indicator);
        }
    }

    private void updateIndicatorValue(QualityIndicator indicator) {
        try {
            switch (indicator.getIndicatorType()) {
                case "ATTENDANCE":
                    indicator.setCurrentValue(calculateAverageAttendance());
                    break;
                case "GRADES":
                    indicator.setCurrentValue(calculatePassingRate());
                    break;
                case "INCIDENTS":
                    indicator.setCurrentValue((double) incidentReportRepository.count());
                    break;
                default:
                    // Manual or other types left as is
                    return;
            }
            indicatorRepository.save(indicator);
        } catch (Exception e) {
            log.error("Failed to update indicator {}: {}", indicator.getName(), e.getMessage());
        }
    }

    private Double calculateAverageAttendance() {
        // Simplified: Count present vs total
        long total = attendanceRepository.count();
        if (total == 0)
            return 0.0;
        long present = attendanceRepository.findAll().stream()
                .filter(a -> a.isPresent())
                .count();
        return (double) present / total * 100.0;
    }

    private Double calculatePassingRate() {
        long total = courseResultRepository.count();
        if (total == 0)
            return 0.0;
        // Assuming Grade 'F' is failing. This is a simplification.
        long passing = courseResultRepository.findAll().stream()
                .filter(r -> r.getGrade() != null && !r.getGrade().equals("F") && !r.getGrade().equals("-"))
                .count();
        return (double) passing / total * 100.0;
    }

    @Transactional
    public QualityGoal createGoal(QualityGoal goal) {
        return goalRepository.save(goal);
    }

    @Transactional
    public QualityGoal updateGoal(Long id, QualityGoal updatedGoal) {
        QualityGoal goal = goalRepository.findById(id).orElseThrow(() -> new RuntimeException("Goal not found"));
        goal.setTitle(updatedGoal.getTitle());
        goal.setDescription(updatedGoal.getDescription());
        goal.setTargetDate(updatedGoal.getTargetDate());
        goal.setStatus(updatedGoal.getStatus());
        return goalRepository.save(goal);
    }

    @Transactional
    public void deleteGoal(Long id) {
        goalRepository.deleteById(id);
    }

    @Transactional
    public QualityIndicator addIndicator(QualityIndicator indicator) {
        return indicatorRepository.save(indicator);
    }

    @Transactional
    public QualityIndicator updateManualIndicator(Long id, Double value) {
        QualityIndicator indicator = indicatorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Indicator not found"));
        indicator.setCurrentValue(value);
        if (indicator.getTargetValue() != null && value >= indicator.getTargetValue()) {
            indicator.setIsCompleted(true);
        }
        return indicatorRepository.save(indicator);
    }

    @Transactional
    public void generateDefaultYearCycle() {
        if (checkpointRepository.count() > 0)
            return;

        int year = LocalDate.now().getYear();

        checkpointRepository.save(QualityCheckpoint.builder()
                .title("Nulägesanalys & Resultatuppföljning")
                .description("Analys av föregående termins betyg, nationella prov och trygghetsenkäter.")
                .scheduledDate(LocalDate.of(year, 8, 15))
                .build());

        checkpointRepository.save(QualityCheckpoint.builder()
                .title("Målformulering")
                .description("Formulering av prioriterade mål för läsåret baserat på analysen.")
                .scheduledDate(LocalDate.of(year, 9, 15))
                .build());

        checkpointRepository.save(QualityCheckpoint.builder()
                .title("Halvårsavstämning")
                .description("Uppföljning av indikatorer och delmål.")
                .scheduledDate(LocalDate.of(year + 1, 1, 20))
                .build());

        checkpointRepository.save(QualityCheckpoint.builder()
                .title("Kvalitetsrapport")
                .description("Sammanställning av årets arbete och resultat.")
                .scheduledDate(LocalDate.of(year + 1, 6, 15))
                .build());
    }
}
