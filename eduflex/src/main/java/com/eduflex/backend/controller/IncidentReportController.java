package com.eduflex.backend.controller;

import com.eduflex.backend.model.IncidentReport;
import com.eduflex.backend.repository.IncidentReportRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/principal/incidents")
@PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'PRINCIPAL', 'ROLE_PRINCIPAL')")
public class IncidentReportController {

    private final IncidentReportRepository incidentReportRepository;
    private final UserRepository userRepository;

    public IncidentReportController(IncidentReportRepository incidentReportRepository, UserRepository userRepository) {
        this.incidentReportRepository = incidentReportRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<IncidentReport> getAllIncidents() {
        return incidentReportRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<IncidentReport> createIncident(@RequestBody IncidentReport incident) {
        // Logic to set reporter from context could go here
        return ResponseEntity.ok(incidentReportRepository.save(incident));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncidentReport> updateIncident(@PathVariable Long id, @RequestBody IncidentReport incidentDetails) {
        IncidentReport incident = incidentReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found"));
        
        incident.setStatus(incidentDetails.getStatus());
        if (incidentDetails.getInvestigationNotes() != null) incident.setInvestigationNotes(incidentDetails.getInvestigationNotes());
        if (incidentDetails.getActionsTaken() != null) incident.setActionsTaken(incidentDetails.getActionsTaken());
        
        return ResponseEntity.ok(incidentReportRepository.save(incident));
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentReport> getIncident(@PathVariable Long id) {
        return incidentReportRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
