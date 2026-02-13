package com.eduflex.backend.service;

import com.eduflex.backend.model.User;
import com.eduflex.backend.model.WellbeingSupportRequest;
import com.eduflex.backend.repository.WellbeingSupportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
public class WellbeingSupportService {

    private final WellbeingSupportRepository repository;

    public WellbeingSupportService(WellbeingSupportRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public WellbeingSupportRequest createRequest(User student, WellbeingSupportRequest request) {
        request.setStudent(student);
        request.setStatus(WellbeingSupportRequest.RequestStatus.PENDING);
        return repository.save(request);
    }

    public List<WellbeingSupportRequest> getMyRequests(Long studentId) {
        return repository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public List<WellbeingSupportRequest> getInboxRequests() {
        return repository.findByStatusInOrderByCreatedAtDesc(
                Arrays.asList(WellbeingSupportRequest.RequestStatus.PENDING,
                        WellbeingSupportRequest.RequestStatus.ACTIVE));
    }

    @Transactional
    public WellbeingSupportRequest updateStatus(Long requestId, WellbeingSupportRequest.RequestStatus status,
            User staff) {
        WellbeingSupportRequest request = repository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        request.setStatus(status);
        if (request.getAssignedStaff() == null) {
            request.setAssignedStaff(staff);
        }
        return repository.save(request);
    }

    public WellbeingSupportRequest getRequest(Long id, User currentUser) {
        WellbeingSupportRequest request = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // Isolation check: Only student or Health Team
        boolean isOwner = request.getStudent().getId().equals(currentUser.getId());
        boolean isHealthTeam = currentUser.getRole().getName().endsWith("HALSOTEAM")
                || currentUser.getRole().getName().equals("ADMIN");

        if (!isOwner && !isHealthTeam) {
            throw new RuntimeException("Unauthorized access to confidential support request");
        }

        return request;
    }
}
