package com.eduflex.backend.controller;

import com.eduflex.backend.model.Invoice;
import com.eduflex.backend.service.InvoiceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final com.eduflex.backend.repository.SubscriptionPlanRepository planRepository;
    private final com.eduflex.backend.repository.UserRepository userRepository;

    public InvoiceController(InvoiceService invoiceService,
            com.eduflex.backend.repository.SubscriptionPlanRepository planRepository,
            com.eduflex.backend.repository.UserRepository userRepository) {
        this.invoiceService = invoiceService;
        this.planRepository = planRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Invoice>> getAllInvoices() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @invoiceSecurity.isOwner(#id, authentication)")
    public ResponseEntity<Invoice> getInvoiceById(@PathVariable Long id) {
        return invoiceService.getInvoiceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or authentication.principal.id == #userId")
    public ResponseEntity<List<Invoice>> getUserInvoices(@PathVariable Long userId) {
        return ResponseEntity.ok(invoiceService.getInvoicesByUser(userId));
    }

    @GetMapping("/overdue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Invoice>> getOverdueInvoices() {
        return ResponseEntity.ok(invoiceService.getOverdueInvoices());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Invoice> createInvoice(@RequestBody Invoice invoice) {
        Invoice created = invoiceService.createInvoice(invoice);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Invoice> updateInvoice(@PathVariable Long id, @RequestBody Invoice invoice) {
        try {
            Invoice updated = invoiceService.updateInvoice(id, invoice);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/generate-pdf")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> generatePDF(@PathVariable Long id) {
        try {
            String pdfUrl = invoiceService.generateInvoicePDF(id);
            return ResponseEntity.ok(pdfUrl);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/subscription")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Invoice> createSubscriptionInvoice(@RequestBody java.util.Map<String, Object> payload) {
        Long planId = ((Number) payload.get("planId")).longValue();
        String promoCode = (String) payload.get("promoCode");

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        String username = auth.getName();

        return userRepository.findByUsername(username).map(user -> {
            return planRepository.findById(planId).map(plan -> {
                Invoice invoice = invoiceService.generateSubscriptionInvoice(user, plan, promoCode);
                return ResponseEntity.ok(invoice);
            }).orElse(ResponseEntity.notFound().build());
        }).orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    @PostMapping("/{id}/send-reminder")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> sendPaymentReminder(@PathVariable Long id) {
        invoiceService.sendPaymentReminder(id);
        return ResponseEntity.ok().build();
    }
}
