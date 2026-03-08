package com.eduflex.backend.controller;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.LiaPlacement;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.LiaPlacementRepository;
import com.eduflex.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/lia/placements")
@RequiredArgsConstructor
@Slf4j
public class LiaPlacementController {

    private final LiaPlacementRepository liaPlacementRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL')")
    public ResponseEntity<List<LiaPlacement>> getAllPlacements() {
        log.info("Fetching all LIA placements");
        return ResponseEntity.ok(liaPlacementRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL')")
    public ResponseEntity<LiaPlacement> createPlacement(@RequestBody LiaPlacementRequest request) {
        log.info("Creating new LIA placement for student: {}", request.studentId());

        User student = userRepository.findById(request.studentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Course course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        LiaPlacement placement = new LiaPlacement();
        placement.setStudent(student);
        placement.setCourse(course);
        updatePlacementFields(placement, request);

        return ResponseEntity.ok(liaPlacementRepository.save(placement));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL')")
    public ResponseEntity<LiaPlacement> updatePlacement(@PathVariable Long id,
            @RequestBody LiaPlacementRequest request) {
        log.info("Updating LIA placement: {}", id);
        LiaPlacement placement = liaPlacementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("LIA placement not found"));

        updatePlacementFields(placement, request);
        return ResponseEntity.ok(liaPlacementRepository.save(placement));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL')")
    public ResponseEntity<Void> deletePlacement(@PathVariable Long id) {
        log.info("Deleting LIA placement: {}", id);
        liaPlacementRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    private void updatePlacementFields(LiaPlacement placement, LiaPlacementRequest request) {
        placement.setCompanyName(request.companyName());
        placement.setCompanyOrgNumber(request.companyOrgNumber());
        placement.setSupervisorName(request.supervisorName());
        placement.setSupervisorEmail(request.supervisorEmail());
        placement.setSupervisorPhone(request.supervisorPhone());
        placement.setStartDate(request.startDate());
        placement.setEndDate(request.endDate());
        placement.setAgreementSigned(request.agreementSigned());
        placement.setMidtermEvaluationDone(request.midtermEvaluationDone());
        placement.setFinalEvaluationDone(request.finalEvaluationDone());
        if (request.status() != null) {
            placement.setStatus(LiaPlacement.LiaStatus.valueOf(request.status()));
        }
    }

    public record LiaPlacementRequest(
            Long studentId,
            Long courseId,
            String companyName,
            String companyOrgNumber,
            String supervisorName,
            String supervisorEmail,
            String supervisorPhone,
            java.time.LocalDate startDate,
            java.time.LocalDate endDate,
            boolean agreementSigned,
            boolean midtermEvaluationDone,
            boolean finalEvaluationDone,
            String status) {
    }
}
