package com.eduflex.backend.controller.quality;

import com.eduflex.backend.model.quality.QualityGoal;
import com.eduflex.backend.model.quality.QualityIndicator;
import com.eduflex.backend.service.quality.QualityWorkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ska")
@RequiredArgsConstructor
public class SKAController {

    private final QualityWorkService qualityWorkService;

    @GetMapping("/goals")
    @PreAuthorize("hasAnyRole('PRINCIPAL', 'ADMIN')")
    public ResponseEntity<List<QualityGoal>> getActiveGoals() {
        return ResponseEntity.ok(qualityWorkService.getAllActiveGoals());
    }

    @PostMapping("/goals")
    @PreAuthorize("hasAnyRole('PRINCIPAL', 'ADMIN')")
    public ResponseEntity<QualityGoal> createGoal(@RequestBody QualityGoal goal) {
        return ResponseEntity.ok(qualityWorkService.createGoal(goal));
    }

    @PutMapping("/goals/{id}")
    @PreAuthorize("hasAnyRole('PRINCIPAL', 'ADMIN')")
    public ResponseEntity<QualityGoal> updateGoal(@PathVariable Long id, @RequestBody QualityGoal goal) {
        return ResponseEntity.ok(qualityWorkService.updateGoal(id, goal));
    }

    @DeleteMapping("/goals/{id}")
    @PreAuthorize("hasAnyRole('PRINCIPAL', 'ADMIN')")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        qualityWorkService.deleteGoal(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/indicators")
    @PreAuthorize("hasAnyRole('PRINCIPAL', 'ADMIN')")
    public ResponseEntity<QualityIndicator> addIndicator(@RequestBody QualityIndicator indicator) {
        return ResponseEntity.ok(qualityWorkService.addIndicator(indicator));
    }

    @PutMapping("/indicators/{id}/value")
    @PreAuthorize("hasAnyRole('PRINCIPAL', 'ADMIN')")
    public ResponseEntity<QualityIndicator> updateIndicatorValue(@PathVariable Long id, @RequestParam Double value) {
        return ResponseEntity.ok(qualityWorkService.updateManualIndicator(id, value));
    }

    @PostMapping("/year-cycle/generate")
    @PreAuthorize("hasAnyRole('PRINCIPAL', 'ADMIN')")
    public ResponseEntity<Void> generateDefaultYearCycle() {
        qualityWorkService.generateDefaultYearCycle();
        return ResponseEntity.ok().build();
    }
}
