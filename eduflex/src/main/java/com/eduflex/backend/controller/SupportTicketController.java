package com.eduflex.backend.controller;

import com.eduflex.backend.model.SupportTicket;
import com.eduflex.backend.model.TicketSeverity;
import com.eduflex.backend.model.TicketStatus;
import com.eduflex.backend.service.SupportTicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/support/tickets")
public class SupportTicketController {

    @Autowired
    private SupportTicketService supportTicketService;

    @PostMapping
    public ResponseEntity<SupportTicket> createTicket(@RequestBody SupportTicket ticket) {
        return ResponseEntity.ok(supportTicketService.createTicket(ticket));
    }

    @GetMapping("/my")
    public ResponseEntity<List<SupportTicket>> getMyTickets(@RequestParam Long userId) {
        return ResponseEntity.ok(supportTicketService.getTicketsByUser(userId));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SupportTicket>> getAllTickets() {
        return ResponseEntity.ok(supportTicketService.getAllTickets());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SupportTicket> updateStatus(
            @PathVariable Long id,
            @RequestParam TicketStatus status) {
        return ResponseEntity.ok(supportTicketService.updateTicketStatus(id, status));
    }

    @PostMapping("/{id}/respond")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SupportTicket> respond(
            @PathVariable Long id,
            @RequestParam String response,
            @RequestParam(required = false) TicketSeverity severity) {
        return ResponseEntity.ok(supportTicketService.respondToTicket(id, response, severity));
    }
}
