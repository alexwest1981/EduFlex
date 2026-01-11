package com.eduflex.backend.service;

import com.eduflex.backend.model.Invoice;
import com.eduflex.backend.model.Payment;
import com.eduflex.backend.model.SubscriptionPlan;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.InvoiceRepository;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.service.PromoCodeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.Optional;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final UserRepository userRepository;

    public InvoiceService(InvoiceRepository invoiceRepository, UserRepository userRepository) {
        this.invoiceRepository = invoiceRepository;
        this.userRepository = userRepository;
    }

    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    public Optional<Invoice> getInvoiceById(Long id) {
        return invoiceRepository.findById(id);
    }

    public Optional<Invoice> getInvoiceByNumber(String invoiceNumber) {
        return invoiceRepository.findByInvoiceNumber(invoiceNumber);
    }

    public List<Invoice> getInvoicesByUser(Long userId) {
        return userRepository.findById(userId)
                .map(invoiceRepository::findByUserOrderByIssueDateDesc)
                .orElse(List.of());
    }

    public List<Invoice> getOverdueInvoices() {
        return invoiceRepository.findByStatusAndDueDateBefore(
                Invoice.InvoiceStatus.PENDING, LocalDate.now());
    }

    @Transactional
    public Invoice createInvoice(Invoice invoice) {
        if (invoice.getInvoiceNumber() == null || invoice.getInvoiceNumber().isEmpty()) {
            invoice.setInvoiceNumber(generateInvoiceNumber());
        }
        return invoiceRepository.save(invoice);
    }

    @Transactional
    public Invoice updateInvoice(Long id, Invoice updatedInvoice) {
        return invoiceRepository.findById(id).map(invoice -> {
            invoice.setAmount(updatedInvoice.getAmount());
            invoice.setCurrency(updatedInvoice.getCurrency());
            invoice.setStatus(updatedInvoice.getStatus());
            invoice.setDueDate(updatedInvoice.getDueDate());
            invoice.setDescription(updatedInvoice.getDescription());
            invoice.setNotes(updatedInvoice.getNotes());

            if (updatedInvoice.getStatus() == Invoice.InvoiceStatus.PAID && invoice.getPaidDate() == null) {
                invoice.setPaidDate(LocalDate.now());
            }

            return invoiceRepository.save(invoice);
        }).orElseThrow(() -> new RuntimeException("Invoice not found with id: " + id));
    }

    @Transactional
    public Invoice markAsPaid(Long id, Payment payment) {
        return invoiceRepository.findById(id).map(invoice -> {
            invoice.setStatus(Invoice.InvoiceStatus.PAID);
            invoice.setPaidDate(LocalDate.now());
            invoice.setPayment(payment);
            return invoiceRepository.save(invoice);
        }).orElseThrow(() -> new RuntimeException("Invoice not found with id: " + id));
    }

    @Transactional
    public void deleteInvoice(Long id) {
        invoiceRepository.deleteById(id);
    }

    // Auto-generate invoice for subscription renewal
    @Transactional
    public Invoice generateSubscriptionInvoice(User user, SubscriptionPlan plan, String promoCode) {
        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setUser(user);
        invoice.setSubscriptionPlan(plan);
        invoice.setCurrency(plan.getCurrency());

        BigDecimal originalAmount = plan.getPrice();
        BigDecimal discountAmount = BigDecimal.ZERO;

        // Apply promo code if provided
        if (promoCode != null && !promoCode.isEmpty()) {
            PromoCodeService promoCodeService = getPromoCodeService();
            if (promoCodeService != null) {
                discountAmount = promoCodeService.calculateDiscount(promoCode, originalAmount);
                if (discountAmount.compareTo(BigDecimal.ZERO) > 0) {
                    promoCodeService.recordUsage(promoCode);
                    invoice.setPromoCode(promoCode);
                }
            }
        }

        invoice.setDiscountAmount(discountAmount);
        invoice.setAmount(originalAmount.subtract(discountAmount));

        LocalDate issueDate = LocalDate.now();
        LocalDate dueDate = issueDate.plusDays(14); // Default 14 days payment term

        // Check for active trial
        if (user.getTrialEndsAt() != null && user.getTrialEndsAt().isAfter(java.time.LocalDateTime.now())) {
            // If trial is active, set the issue date and due date to after the trial
            // ... (keep existing trial logic)
            issueDate = user.getTrialEndsAt().toLocalDate();
            dueDate = issueDate.plusDays(14);
        }

        invoice.setIssueDate(issueDate);
        invoice.setDueDate(dueDate);

        invoice.setDescription(String.format("Subscription: %s (%s)",
                plan.getDisplayName(), plan.getBillingInterval()));
        invoice.setStatus(Invoice.InvoiceStatus.PENDING);
        invoice.setAutoGenerated(true);

        return invoiceRepository.save(invoice);
    }

    // Helper to avoid circular dependency injection (or use setter injection/lazy)
    private PromoCodeService getPromoCodeService() {
        try {
            return org.springframework.web.context.ContextLoader.getCurrentWebApplicationContext()
                    .getBean(PromoCodeService.class);
        } catch (Exception e) {
            return null;
        }
    }

    // Generate unique invoice number
    private String generateInvoiceNumber() {
        int year = Year.now().getValue();
        long count = invoiceRepository.count();
        return String.format("INV-%d-%05d", year, count + 1);
    }

    // Overloaded method for existing calls without promo code
    @Transactional
    public Invoice generateSubscriptionInvoice(User user, SubscriptionPlan plan) {
        return generateSubscriptionInvoice(user, plan, null);
    }

    // PDF Generation stub - to be implemented with iText or similar
    @Transactional
    public String generateInvoicePDF(Long invoiceId) {
        return invoiceRepository.findById(invoiceId).map(invoice -> {
            // TODO: Implement actual PDF generation with iText or Apache PDFBox
            // For now, return a placeholder URL
            String pdfUrl = String.format("/invoices/pdf/%s.pdf", invoice.getInvoiceNumber());
            invoice.setPdfUrl(pdfUrl);
            invoiceRepository.save(invoice);
            return pdfUrl;
        }).orElseThrow(() -> new RuntimeException("Invoice not found with id: " + invoiceId));
    }

    // Send payment reminder (stub for email integration)
    @Transactional
    public void sendPaymentReminder(Long invoiceId) {
        invoiceRepository.findById(invoiceId).ifPresent(invoice -> {
            // TODO: Integrate with email service
            System.out.println("Sending payment reminder for invoice: " + invoice.getInvoiceNumber());
            invoice.setStatus(Invoice.InvoiceStatus.SENT);
            invoiceRepository.save(invoice);
        });
    }
}
