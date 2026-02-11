package com.eduflex.backend.service;

import com.eduflex.backend.model.SickLeaveReport;
import com.eduflex.backend.model.SickLeaveReport.Status;
import com.eduflex.backend.model.User;
import com.eduflex.backend.model.User.StaffStatus;
import com.eduflex.backend.repository.SickLeaveReportRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class SickLeaveService {

    @Autowired
    private SickLeaveReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessageService messageService;

    @Transactional
    public SickLeaveReport reportSickLeave(Long userId, LocalDate startDate, LocalDate endDate,
            String reason, Long reportedById) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        SickLeaveReport report = new SickLeaveReport();
        report.setUser(user);
        report.setStartDate(startDate);
        report.setEndDate(endDate);
        report.setReason(reason);
        report.setStatus(Status.ACTIVE);

        if (reportedById != null) {
            User reportedBy = userRepository.findById(reportedById).orElse(null);
            report.setReportedBy(reportedBy);
        }

        SickLeaveReport saved = reportRepository.save(report);

        // Update staffStatus for non-students
        String roleName = user.getRole() != null ? user.getRole().getName() : "";
        if (!roleName.equals("ROLE_STUDENT")) {
            user.setStaffStatus(StaffStatus.SICK);
            userRepository.save(user);
        }

        // Notify mentor if student has one
        if (roleName.equals("ROLE_STUDENT")) {
            notifyMentor(user, startDate, endDate);
        }

        return saved;
    }

    @Transactional
    public SickLeaveReport cancelSickLeave(Long reportId, Long userId) {
        SickLeaveReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found: " + reportId));

        if (!report.getUser().getId().equals(userId)) {
            throw new IllegalStateException("You can only cancel your own sick leave");
        }

        report.setStatus(Status.CANCELLED);
        SickLeaveReport saved = reportRepository.save(report);

        // Restore staffStatus for non-students
        User user = report.getUser();
        String roleName = user.getRole() != null ? user.getRole().getName() : "";
        if (!roleName.equals("ROLE_STUDENT")) {
            user.setStaffStatus(StaffStatus.ACTIVE);
            userRepository.save(user);
        }

        return saved;
    }

    public SickLeaveReport getActiveSickLeave(Long userId) {
        List<SickLeaveReport> active = reportRepository
                .findByUserIdAndStatusOrderByStartDateDesc(userId, Status.ACTIVE);
        return active.isEmpty() ? null : active.get(0);
    }

    public List<SickLeaveReport> getMySickLeaveHistory(Long userId) {
        return reportRepository.findByUserIdOrderByReportedAtDesc(userId);
    }

    public List<SickLeaveReport> getTodaySickLeaves() {
        return reportRepository.findActiveTodayReports(LocalDate.now());
    }

    private void notifyMentor(User student, LocalDate startDate, LocalDate endDate) {
        try {
            if (student.getClassGroup() != null && student.getClassGroup().getMentor() != null) {
                User mentor = student.getClassGroup().getMentor();
                String subject = "Sjukanmälan: " + student.getFullName();
                DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                String dateRange = startDate.format(fmt)
                        + (endDate != null ? " — " + endDate.format(fmt) : " (tills vidare)");
                String content = "<p><b>" + student.getFullName() + "</b> har sjukanmält sig.</p>"
                        + "<p>Period: " + dateRange + "</p>";

                messageService.sendMessage(null, mentor.getId(), subject, content, null);
            }
        } catch (Exception e) {
            // Don't fail the sick leave report if notification fails
        }
    }
}
