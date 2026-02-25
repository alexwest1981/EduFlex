package com.eduflex.backend.service;

import com.eduflex.backend.model.IndividualStudyPlan;
import com.eduflex.backend.model.IspPlannedCourse;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.IndividualStudyPlanRepository;
import com.eduflex.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Affärslogik för Individuell Studieplan (ISP).
 * Hanterar statusflödet DRAFT → ACTIVE → (REVISED → ACTIVE) → COMPLETED.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class IspService {

    private final IndividualStudyPlanRepository ispRepository;
    private final UserRepository userRepository;
    private final GdprAuditService gdprAuditService;

    // -----------------------------------------------------------------------
    // Läsoperationer
    // -----------------------------------------------------------------------

    /** SYV: alla planer skapade av denna SYV. */
    public List<IndividualStudyPlan> getPlansForCounselor(Long counselorId) {
        return ispRepository.findByCounselorIdOrderByUpdatedAtDesc(counselorId);
    }

    /** Admin/Rektor: alla planer i systemet. */
    public List<IndividualStudyPlan> getAllPlans() {
        return ispRepository.findAllByOrderByUpdatedAtDesc();
    }

    /** Hämtar senaste aktiva plan för en student. */
    public IndividualStudyPlan getActivePlanForStudent(Long studentId) {
        return ispRepository
                .findFirstByStudentIdAndStatusOrderByVersionDesc(studentId, IndividualStudyPlan.Status.ACTIVE)
                .orElse(null);
    }

    /**
     * Hämtar en specifik ISP med behörighetskontroll.
     * Admin/Rektor/SYV ser alla; Teacher/Student ser bara egna.
     */
    public IndividualStudyPlan getPlanById(Long id, User requestingUser) {
        IndividualStudyPlan plan = ispRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ISP hittades inte"));

        String role = requestingUser.getRole() != null ? requestingUser.getRole().getName() : "";

        boolean isAdminOrRektor = role.contains("ADMIN") || role.contains("REKTOR");
        boolean isSyv = role.contains("SYV");
        boolean isOwner = plan.getStudent().getId().equals(requestingUser.getId());
        boolean isCounselor = plan.getCounselor().getId().equals(requestingUser.getId());

        if (!isAdminOrRektor && !isSyv && !isOwner && !isCounselor) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Åtkomst nekad");
        }

        // GDPR-logg vid åtkomst av specifik plan
        gdprAuditService.logPiiAccess("IndividualStudyPlan", String.valueOf(id),
                "READ", "ISP läst av " + requestingUser.getUsername());

        return plan;
    }

    /** Hämtar alla versioner av en students plan (historik). */
    public List<IndividualStudyPlan> getStudentHistory(Long studentId) {
        return ispRepository.findByStudentIdOrderByVersionDesc(studentId);
    }

    /** Compliance-statistik: antal ISP per status (för Rektor/Admin). */
    public Map<String, Long> getStats() {
        List<Object[]> raw = ispRepository.countByStatus();
        Map<String, Long> stats = new LinkedHashMap<>();
        // Initialisera alla statusar med 0
        for (IndividualStudyPlan.Status s : IndividualStudyPlan.Status.values()) {
            stats.put(s.name(), 0L);
        }
        for (Object[] row : raw) {
            stats.put(row[0].toString(), (Long) row[1]);
        }
        return stats;
    }

    // -----------------------------------------------------------------------
    // Skrivoperationer
    // -----------------------------------------------------------------------

    /** SYV skapar en ny ISP för en student (sparas som DRAFT). */
    @Transactional
    public IndividualStudyPlan createPlan(IspCreateRequest req, User counselor) {
        User student = userRepository.findById(req.getStudentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Student hittades inte: " + req.getStudentId()));

        IndividualStudyPlan plan = IndividualStudyPlan.builder()
                .student(student)
                .counselor(counselor)
                .status(IndividualStudyPlan.Status.DRAFT)
                .version(1)
                .syfte(req.getSyfte())
                .bakgrund(req.getBakgrund())
                .mal(req.getMal())
                .stodbehoV(req.getStodbehoV())
                .counselorNotes(req.getCounselorNotes())
                .studieform(parseStudieform(req.getStudieform()))
                .studyPacePct(req.getStudyPacePct() != null ? req.getStudyPacePct() : 100)
                .plannedStart(req.getPlannedStart())
                .plannedEnd(req.getPlannedEnd())
                .examensmal(req.getExamensmal())
                .kravPoang(req.getKravPoang())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        if (req.getCourses() != null) {
            for (IspCourseDto c : req.getCourses()) {
                IspPlannedCourse pc = buildPlannedCourse(c, plan);
                plan.getPlannedCourses().add(pc);
            }
        }

        IndividualStudyPlan saved = ispRepository.save(plan);
        log.info("ISP DRAFT skapad: id={}, student={}, counselor={}", saved.getId(),
                student.getUsername(), counselor.getUsername());
        return saved;
    }

    /** SYV uppdaterar en befintlig ISP (bara DRAFT eller REVISED). */
    @Transactional
    public IndividualStudyPlan updatePlan(Long id, IspUpdateRequest req, User counselor) {
        IndividualStudyPlan plan = getPlanForEdit(id, counselor);

        plan.setSyfte(req.getSyfte());
        plan.setBakgrund(req.getBakgrund());
        plan.setMal(req.getMal());
        plan.setStodbehoV(req.getStodbehoV());
        plan.setCounselorNotes(req.getCounselorNotes());
        plan.setStudieform(parseStudieform(req.getStudieform()));
        plan.setStudyPacePct(req.getStudyPacePct() != null ? req.getStudyPacePct() : plan.getStudyPacePct());
        plan.setPlannedStart(req.getPlannedStart());
        plan.setPlannedEnd(req.getPlannedEnd());
        plan.setExamensmal(req.getExamensmal());
        plan.setKravPoang(req.getKravPoang());
        plan.setUpdatedAt(LocalDateTime.now());

        // Ersätt kurserna
        plan.getPlannedCourses().clear();
        if (req.getCourses() != null) {
            for (IspCourseDto c : req.getCourses()) {
                plan.getPlannedCourses().add(buildPlannedCourse(c, plan));
            }
        }

        return ispRepository.save(plan);
    }

    /** SYV aktiverar en plan: DRAFT → ACTIVE. */
    @Transactional
    public IndividualStudyPlan activatePlan(Long id, User counselor) {
        IndividualStudyPlan plan = requireCounselorOrAdmin(id, counselor);
        if (plan.getStatus() != IndividualStudyPlan.Status.DRAFT &&
                plan.getStatus() != IndividualStudyPlan.Status.REVISED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Kan bara aktivera en plan i status DRAFT eller REVISED");
        }
        plan.setStatus(IndividualStudyPlan.Status.ACTIVE);
        plan.setUpdatedAt(LocalDateTime.now());
        log.info("ISP aktiverad: id={}", id);
        return ispRepository.save(plan);
    }

    /** Student kvitterar/bekräftar sin plan. */
    @Transactional
    public IndividualStudyPlan studentAcknowledge(Long id, User student) {
        IndividualStudyPlan plan = ispRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ISP hittades inte"));

        if (!plan.getStudent().getId().equals(student.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Åtkomst nekad");
        }
        if (plan.getStatus() != IndividualStudyPlan.Status.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Kan bara kvittera en aktiv plan");
        }
        plan.setStudentAcknowledgedAt(LocalDateTime.now());
        plan.setUpdatedAt(LocalDateTime.now());
        log.info("ISP kvitterad av student {}: plan id={}", student.getUsername(), id);
        return ispRepository.save(plan);
    }

    /** SYV öppnar en revision: ACTIVE → REVISED, version ökar. */
    @Transactional
    public IndividualStudyPlan revisePlan(Long id, User counselor) {
        IndividualStudyPlan plan = requireCounselorOrAdmin(id, counselor);
        if (plan.getStatus() != IndividualStudyPlan.Status.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Kan bara revidera en aktiv plan");
        }
        plan.setStatus(IndividualStudyPlan.Status.REVISED);
        plan.setVersion(plan.getVersion() + 1);
        plan.setStudentAcknowledgedAt(null); // Ny kvittering krävs efter revision
        plan.setUpdatedAt(LocalDateTime.now());
        log.info("ISP revision öppnad: id={}, ny version={}", id, plan.getVersion());
        return ispRepository.save(plan);
    }

    /** SYV avslutar en plan: ACTIVE → COMPLETED. */
    @Transactional
    public IndividualStudyPlan completePlan(Long id, User counselor) {
        IndividualStudyPlan plan = requireCounselorOrAdmin(id, counselor);
        if (plan.getStatus() != IndividualStudyPlan.Status.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Kan bara avsluta en aktiv plan");
        }
        plan.setStatus(IndividualStudyPlan.Status.COMPLETED);
        plan.setUpdatedAt(LocalDateTime.now());
        log.info("ISP avslutad: id={}", id);
        return ispRepository.save(plan);
    }

    // -----------------------------------------------------------------------
    // Interna hjälpmetoder
    // -----------------------------------------------------------------------

    private IndividualStudyPlan getPlanForEdit(Long id, User counselor) {
        IndividualStudyPlan plan = requireCounselorOrAdmin(id, counselor);
        if (plan.getStatus() != IndividualStudyPlan.Status.DRAFT &&
                plan.getStatus() != IndividualStudyPlan.Status.REVISED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Kan bara redigera en plan i status DRAFT eller REVISED");
        }
        return plan;
    }

    private IndividualStudyPlan requireCounselorOrAdmin(Long id, User user) {
        IndividualStudyPlan plan = ispRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ISP hittades inte"));
        String role = user.getRole() != null ? user.getRole().getName() : "";
        boolean isAdmin = role.contains("ADMIN");
        boolean isCounselor = plan.getCounselor().getId().equals(user.getId());
        if (!isAdmin && !isCounselor) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Bara ansvarig SYV eller admin kan utföra denna åtgärd");
        }
        return plan;
    }

    private IspPlannedCourse buildPlannedCourse(IspCourseDto dto, IndividualStudyPlan plan) {
        return IspPlannedCourse.builder()
                .isp(plan)
                .courseName(dto.getCourseName())
                .courseCode(dto.getCourseCode())
                .studyPacePct(dto.getStudyPacePct() != null ? dto.getStudyPacePct() : 100)
                .plannedStart(dto.getPlannedStart())
                .plannedEnd(dto.getPlannedEnd())
                .points(dto.getPoints())
                .level(dto.getLevel())
                .status(IspPlannedCourse.CourseStatus.PLANNED)
                .build();
    }

    private IndividualStudyPlan.Studieform parseStudieform(String value) {
        if (value == null)
            return IndividualStudyPlan.Studieform.PLATS;
        try {
            return IndividualStudyPlan.Studieform.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return IndividualStudyPlan.Studieform.PLATS;
        }
    }

    // -----------------------------------------------------------------------
    // Inner DTOs
    // -----------------------------------------------------------------------

    @lombok.Data
    public static class IspCreateRequest {
        private Long studentId;
        private String syfte;
        private String bakgrund;
        private String mal;
        private String stodbehoV;
        private String counselorNotes;
        private String studieform;
        private Integer studyPacePct;
        private LocalDate plannedStart;
        private LocalDate plannedEnd;
        private String examensmal;
        private Integer kravPoang;
        private List<IspCourseDto> courses;
    }

    @lombok.Data
    public static class IspUpdateRequest {
        private String syfte;
        private String bakgrund;
        private String mal;
        private String stodbehoV;
        private String counselorNotes;
        private String studieform;
        private Integer studyPacePct;
        private LocalDate plannedStart;
        private LocalDate plannedEnd;
        private String examensmal;
        private Integer kravPoang;
        private List<IspCourseDto> courses;
    }

    @lombok.Data
    public static class IspCourseDto {
        private String courseName;
        private String courseCode;
        private Integer studyPacePct;
        private LocalDate plannedStart;
        private LocalDate plannedEnd;
        private Integer points;
        private String level;
    }
}
