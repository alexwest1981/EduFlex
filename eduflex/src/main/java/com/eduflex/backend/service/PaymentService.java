package com.eduflex.backend.service;

import com.eduflex.backend.model.Payment;
import com.eduflex.backend.model.SubscriptionPlan;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.PaymentRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final StripeService stripeService;
    private final com.eduflex.backend.repository.InvoiceRepository invoiceRepository;

    public PaymentService(PaymentRepository paymentRepository, UserRepository userRepository,
            StripeService stripeService, com.eduflex.backend.repository.InvoiceRepository invoiceRepository) {
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.stripeService = stripeService;
        this.invoiceRepository = invoiceRepository;
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Optional<Payment> getPaymentById(Long id) {
        return paymentRepository.findById(id);
    }

    public List<Payment> getPaymentsByUser(Long userId) {
        return userRepository.findById(userId)
                .map(paymentRepository::findByUserOrderByCreatedAtDesc)
                .orElse(List.of());
    }

    public Optional<Payment> getPaymentByTransactionId(String transactionId) {
        return paymentRepository.findByTransactionId(transactionId);
    }

    public List<Payment> getPaymentsByStatus(Payment.PaymentStatus status) {
        return paymentRepository.findByStatus(status);
    }

    public List<Payment> getPaymentsByDateRange(LocalDateTime start, LocalDateTime end) {
        return paymentRepository.findByCreatedAtBetween(start, end);
    }

    @Transactional
    public Payment createPayment(Payment payment) {
        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment updatePaymentStatus(Long id, Payment.PaymentStatus status) {
        return paymentRepository.findById(id).map(payment -> {
            payment.setStatus(status);
            if (status == Payment.PaymentStatus.COMPLETED) {
                payment.setPaymentDate(LocalDateTime.now());
            }
            return paymentRepository.save(payment);
        }).orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
    }

    @Transactional
    public Payment refundPayment(Long id) {
        return paymentRepository.findById(id).map(payment -> {
            if (payment.getStatus() != Payment.PaymentStatus.COMPLETED) {
                throw new IllegalStateException("Cannot refund a payment that is not COMPLETED");
            }

            // Call Stripe Service (Stub)
            // In real world, we would use payment.getTransactionId()
            stripeService.createRefund(payment.getTransactionId(), payment.getAmount().longValue());

            payment.setStatus(Payment.PaymentStatus.REFUNDED);
            Payment savedPayment = paymentRepository.save(payment);

            // Update associated invoice if it exists
            List<com.eduflex.backend.model.Invoice> invoices = invoiceRepository
                    .findByStatus(com.eduflex.backend.model.Invoice.InvoiceStatus.PAID);
            for (com.eduflex.backend.model.Invoice invoice : invoices) {
                if (invoice.getPayment() != null && invoice.getPayment().getId().equals(id)) {
                    invoice.setStatus(com.eduflex.backend.model.Invoice.InvoiceStatus.REFUNDED);
                    invoiceRepository.save(invoice);
                }
            }

            return savedPayment;
        }).orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
    }

    @Transactional
    public Payment processStripeWebhook(String transactionId, String eventType, Map<String, Object> data) {
        // Placeholder for Stripe webhook processing
        // This will be implemented when Stripe is integrated
        return getPaymentByTransactionId(transactionId)
                .map(payment -> {
                    switch (eventType) {
                        case "payment_intent.succeeded":
                            payment.setStatus(Payment.PaymentStatus.COMPLETED);
                            payment.setPaymentDate(LocalDateTime.now());
                            break;
                        case "payment_intent.payment_failed":
                            payment.setStatus(Payment.PaymentStatus.FAILED);
                            break;
                        default:
                            payment.setStatus(Payment.PaymentStatus.PROCESSING);
                    }
                    return paymentRepository.save(payment);
                }).orElse(null);
    }

    // Revenue Analytics Methods
    public Map<String, Object> getRevenueStats() {
        Map<String, Object> stats = new HashMap<>();

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime monthStart = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime yearStart = now.withDayOfYear(1).withHour(0).withMinute(0).withSecond(0);

        // MRR - Monthly Recurring Revenue
        List<Payment> thisMonthPayments = paymentRepository.findByStatusAndCreatedAtBetween(
                Payment.PaymentStatus.COMPLETED, monthStart, now);
        BigDecimal mrr = thisMonthPayments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // ARR - Annual Recurring Revenue
        List<Payment> thisYearPayments = paymentRepository.findByStatusAndCreatedAtBetween(
                Payment.PaymentStatus.COMPLETED, yearStart, now);
        BigDecimal arr = thisYearPayments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Payment success rate
        List<Payment> allPayments = paymentRepository.findByCreatedAtBetween(monthStart, now);
        long totalPayments = allPayments.size();
        long successfulPayments = allPayments.stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.COMPLETED)
                .count();
        double successRate = totalPayments > 0 ? (double) successfulPayments / totalPayments * 100 : 0;

        stats.put("mrr", mrr);
        stats.put("arr", arr);
        stats.put("totalPaymentsThisMonth", totalPayments);
        stats.put("successfulPaymentsThisMonth", successfulPayments);
        stats.put("paymentSuccessRate", successRate);
        stats.put("averagePaymentAmount",
                totalPayments > 0 ? mrr.divide(BigDecimal.valueOf(totalPayments), 2, BigDecimal.ROUND_HALF_UP)
                        : BigDecimal.ZERO);

        return stats;
    }
}
