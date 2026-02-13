package com.eduflex.backend.controller.quality;

import com.eduflex.backend.model.quality.QualityGoal;
import com.eduflex.backend.service.quality.QualityWorkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quality")
@RequiredArgsConstructor
public class QualityWorkController {

    private final QualityWorkService qualityWorkService;

    @GetMapping("/goals")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'PRINCIPAL', 'ROLE_PRINCIPAL')")
    public ResponseEntity<List<QualityGoal>> getGoals() {
        return ResponseEntity.ok(qualityWorkService.getAllActiveGoals());
    }

    @PostMapping("/goals")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<QualityGoal> createGoal(@RequestBody QualityGoal goal) {
        return ResponseEntity.ok(qualityWorkService.createGoal(goal));
    }

    @PostMapping("/goals/{id}/calculate")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'PRINCIPAL', 'ROLE_PRINCIPAL')")
    public ResponseEntity<Void> triggerCalculation(@PathVariable Long id) {
        qualityWorkService.calculateIndicators(id);
        return ResponseEntity.ok().build();
    }
}
