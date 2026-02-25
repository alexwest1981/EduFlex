package com.eduflex.backend.controller;

import com.eduflex.backend.model.IndividualStudyPlan;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.service.IspService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

/**
 * REST API för Individuell Studieplan (ISP).
 * Bas-URL: /api/isp
 */
@RestController
@RequestMapping("/api/isp")
@RequiredArgsConstructor
@Slf4j
public class IspController {

    private final IspService ispService;
    private final UserRepository userRepository;

    /**
     * GET /api/isp
     * Admin/Rektor: alla planer. SYV: sina planer.
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','REKTOR','ROLE_REKTOR','SYV','ROLE_SYV','TEACHER','ROLE_TEACHER')")
    public ResponseEntity<List<IndividualStudyPlan>> getPlans() {
        User me = getCurrentUser();
        String role = me.getRole() != null ? me.getRole().getName() : "";

        if (role.contains("ADMIN") || role.contains("REKTOR")) {
            return ResponseEntity.ok(ispService.getAllPlans());
        }
        // SYV och Teacher ser bara sina egna planer
        return ResponseEntity.ok(ispService.getPlansForCounselor(me.getId()));
    }

    /**
     * GET /api/isp/my
     * Student: ser sin senaste aktiva plan.
     */
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<IndividualStudyPlan> getMyPlan() {
        User me = getCurrentUser();
        IndividualStudyPlan plan = ispService.getActivePlanForStudent(me.getId());
        if (plan == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(plan);
    }

    /**
     * GET /api/isp/stats
     * Admin/Rektor: compliance-statistik (antal ISP per status).
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','REKTOR','ROLE_REKTOR')")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(ispService.getStats());
    }

    /**
     * GET /api/isp/{id}
     * Hämtar en specifik plan. Behörighetskontroll sker i service-lagret.
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<IndividualStudyPlan> getPlan(@PathVariable Long id) {
        return ResponseEntity.ok(ispService.getPlanById(id, getCurrentUser()));
    }

    /**
     * GET /api/isp/student/{studentId}/history
     * Alla versioner av en students plan (historik).
     */
    @GetMapping("/student/{studentId}/history")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','REKTOR','ROLE_REKTOR','SYV','ROLE_SYV')")
    public ResponseEntity<List<IndividualStudyPlan>> getStudentHistory(@PathVariable Long studentId) {
        return ResponseEntity.ok(ispService.getStudentHistory(studentId));
    }

    /**
     * POST /api/isp
     * SYV/Admin skapar en ny ISP (sparas som DRAFT).
     */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','SYV','ROLE_SYV')")
    public ResponseEntity<IndividualStudyPlan> createPlan(@RequestBody IspService.IspCreateRequest req) {
        IndividualStudyPlan created = ispService.createPlan(req, getCurrentUser());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PUT /api/isp/{id}
     * SYV/Admin uppdaterar en plan i status DRAFT eller REVISED.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','SYV','ROLE_SYV')")
    public ResponseEntity<IndividualStudyPlan> updatePlan(
            @PathVariable Long id,
            @RequestBody IspService.IspUpdateRequest req) {
        return ResponseEntity.ok(ispService.updatePlan(id, req, getCurrentUser()));
    }

    /**
     * POST /api/isp/{id}/activate
     * SYV/Admin aktiverar planen: DRAFT/REVISED → ACTIVE.
     */
    @PostMapping("/{id}/activate")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','SYV','ROLE_SYV')")
    public ResponseEntity<IndividualStudyPlan> activatePlan(@PathVariable Long id) {
        return ResponseEntity.ok(ispService.activatePlan(id, getCurrentUser()));
    }

    /**
     * POST /api/isp/{id}/acknowledge
     * Student kvitterar/bekräftar sin aktiva plan.
     */
    @PostMapping("/{id}/acknowledge")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<IndividualStudyPlan> acknowledgePlan(@PathVariable Long id) {
        return ResponseEntity.ok(ispService.studentAcknowledge(id, getCurrentUser()));
    }

    /**
     * POST /api/isp/{id}/revise
     * SYV/Admin öppnar en revision: ACTIVE → REVISED, version ökar.
     */
    @PostMapping("/{id}/revise")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','SYV','ROLE_SYV')")
    public ResponseEntity<IndividualStudyPlan> revisePlan(@PathVariable Long id) {
        return ResponseEntity.ok(ispService.revisePlan(id, getCurrentUser()));
    }

    /**
     * POST /api/isp/{id}/complete
     * SYV/Admin avslutar planen: ACTIVE → COMPLETED.
     */
    @PostMapping("/{id}/complete")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','SYV','ROLE_SYV')")
    public ResponseEntity<IndividualStudyPlan> completePlan(@PathVariable Long id) {
        return ResponseEntity.ok(ispService.completePlan(id, getCurrentUser()));
    }

    /**
     * DELETE /api/isp/{id}
     * Bara Admin kan ta bort en ISP (t.ex. felinmatad).
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN')")
    public ResponseEntity<Void> deletePlan(@PathVariable Long id) {
        ispService.getPlanById(id, getCurrentUser()); // Verifierar att den finns
        // Lazy delete — arkivera istället för att radera
        ispService.getAllPlans(); // Trigger eager load check
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED,
                "Radering av ISP är inte tillåten enligt GDPR-arkiveringskrav. Använd complete/archive.");
    }

    // -----------------------------------------------------------------------

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Användare hittades inte"));
    }
}
