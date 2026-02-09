package com.eduflex.backend.service;

import com.eduflex.backend.model.IncidentReport;
import com.eduflex.backend.model.StaffObservation;
import com.eduflex.backend.repository.IncidentReportRepository;
import com.eduflex.backend.repository.StaffObservationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class QualityAndSafetyService {

    private final IncidentReportRepository incidentReportRepository;
    private final StaffObservationRepository staffObservationRepository;

    public QualityAndSafetyService(IncidentReportRepository incidentReportRepository,
                                   StaffObservationRepository staffObservationRepository) {
        this.incidentReportRepository = incidentReportRepository;
        this.staffObservationRepository = staffObservationRepository;
    }

    // --- Incidents ---
    public IncidentReport reportIncident(IncidentReport report) {
        return incidentReportRepository.save(report);
    }

    public List<IncidentReport> getAllIncidents() {
        return incidentReportRepository.findAll();
    }

    public List<IncidentReport> getIncidentsByStudent(Long studentId) {
        return incidentReportRepository.findByInvolvedStudentId(studentId);
    }

    public IncidentReport updateIncidentStatus(Long id, IncidentReport.Status status, String notes, String actions) {
        IncidentReport report = incidentReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found"));
        report.setStatus(status);
        if (notes != null) report.setInvestigationNotes(notes);
        if (actions != null) report.setActionsTaken(actions);
        return incidentReportRepository.save(report);
    }

    // --- Observations ---
    public StaffObservation recordObservation(StaffObservation observation) {
        return staffObservationRepository.save(observation);
    }

    public List<StaffObservation> getObservationsForTeacher(Long teacherId) {
        return staffObservationRepository.findByObservedTeacherId(teacherId);
    }

    public List<StaffObservation> getObservationsByObserver(Long observerId) {
        return staffObservationRepository.findByObserverId(observerId);
    }
}
