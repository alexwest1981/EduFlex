package com.eduflex.backend.service;

import com.eduflex.backend.model.User;
import com.eduflex.backend.model.WellbeingSupportMessage;
import com.eduflex.backend.model.WellbeingSupportRequest;
import com.eduflex.backend.repository.WellbeingSupportMessageRepository;
import com.eduflex.backend.repository.WellbeingSupportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
public class WellbeingSupportService {

    private final WellbeingSupportRepository repository;
    private final WellbeingSupportMessageRepository messageRepository;

    public WellbeingSupportService(WellbeingSupportRepository repository,
            WellbeingSupportMessageRepository messageRepository) {
        this.repository = repository;
        this.messageRepository = messageRepository;
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

        validateAccess(request, currentUser);
        return request;
    }

    @Transactional
    public WellbeingSupportMessage addMessage(Long requestId, String content, User sender) {
        WellbeingSupportRequest request = repository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        validateAccess(request, sender);

        WellbeingSupportMessage message = new WellbeingSupportMessage(request, sender, content);

        // Auto-assign staff and update status if Health Team replies
        boolean isHealthTeam = sender.getRole().getName().endsWith("HALSOTEAM")
                || sender.getRole().getName().equals("ADMIN");

        if (isHealthTeam) {
            if (request.getAssignedStaff() == null) {
                request.setAssignedStaff(sender);
            }
            if (request.getStatus() == WellbeingSupportRequest.RequestStatus.PENDING) {
                request.setStatus(WellbeingSupportRequest.RequestStatus.ACTIVE);
            }
            repository.save(request);
        }

        return messageRepository.save(message);
    }

    public List<WellbeingSupportMessage> getMessages(Long requestId, User currentUser) {
        WellbeingSupportRequest request = repository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        validateAccess(request, currentUser);
        return messageRepository.findByRequestIdOrderByCreatedAtAsc(requestId);
    }

    private void validateAccess(WellbeingSupportRequest request, User user) {
        boolean isOwner = request.getStudent().getId().equals(user.getId());
        boolean isHealthTeam = user.getRole().getName().endsWith("HALSOTEAM")
                || user.getRole().getName().equals("ADMIN");

        if (!isOwner && !isHealthTeam) {
            throw new RuntimeException("Unauthorized access to confidential support request");
        }
    }
}
