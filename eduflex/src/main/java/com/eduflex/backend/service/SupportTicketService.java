package com.eduflex.backend.service;

import com.eduflex.backend.model.SupportTicket;
import com.eduflex.backend.model.TicketSeverity;
import com.eduflex.backend.model.TicketStatus;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.SupportTicketRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SupportTicketService {

    @Autowired
    private SupportTicketRepository supportTicketRepository;

    @Autowired
    private UserRepository userRepository;

    public SupportTicket createTicket(SupportTicket ticket) {
        // Automatically denormalize user name if not provided
        if (ticket.getUserName() == null && ticket.getUserId() != null) {
            userRepository.findById(ticket.getUserId()).ifPresent(user -> {
                ticket.setUserName(user.getFirstName() + " " + user.getLastName());
            });
        }
        return supportTicketRepository.save(ticket);
    }

    public List<SupportTicket> getAllTickets() {
        return supportTicketRepository.findAll();
    }

    public List<SupportTicket> getTicketsByUser(Long userId) {
        return supportTicketRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<SupportTicket> getTicketsByStatus(TicketStatus status) {
        return supportTicketRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    public SupportTicket updateTicketStatus(Long ticketId, TicketStatus status) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticket.setStatus(status);
        if (status == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
        }
        return supportTicketRepository.save(ticket);
    }

    public SupportTicket respondToTicket(Long ticketId, String response, TicketSeverity severity) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticket.setAdminResponse(response);
        if (severity != null) {
            ticket.setSeverity(severity);
        }
        return supportTicketRepository.save(ticket);
    }
}
