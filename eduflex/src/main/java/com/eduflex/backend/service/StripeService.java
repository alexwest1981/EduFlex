package com.eduflex.backend.service;

import com.eduflex.backend.model.PaymentSettings;
import com.eduflex.backend.repository.PaymentSettingsRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class StripeService {

        private final PaymentSettingsRepository paymentSettingsRepository;

        public StripeService(PaymentSettingsRepository paymentSettingsRepository) {
                this.paymentSettingsRepository = paymentSettingsRepository;
        }

        private static final Logger logger = LoggerFactory.getLogger(StripeService.class);

        @Value("${eduflex.domain.url:http://localhost:5173}")
        private String defaultDomainUrl;

        /**
         * Gets the active domain URL from DB or fallback to env.
         */
        private String getDomainUrl() {
                return paymentSettingsRepository.findByIsActiveTrue()
                                .map(PaymentSettings::getDomainUrl)
                                .filter(url -> url != null && !url.isBlank())
                                .orElse(defaultDomainUrl);
        }

        /**
         * Ensures Stripe is configured with the correct API key.
         */
        private void ensureConfigured() {
                paymentSettingsRepository.findByIsActiveTrue()
                                .filter(s -> "STRIPE".equals(s.getProvider()))
                                .ifPresent(s -> {
                                        if (s.getApiKey() != null && !s.getApiKey().isBlank()) {
                                                com.stripe.Stripe.apiKey = s.getApiKey();
                                        }
                                });
        }

        public String createCheckoutSession(String priceId, String email, String tenantName, String desiredDomain,
                        String adminName) throws StripeException {
                ensureConfigured();
                String activeDomainUrl = getDomainUrl();

                // Metadata to pass through to the webhook for provisioning
                Map<String, String> metadata = new HashMap<>();
                metadata.put("tenant_name", tenantName);
                metadata.put("desired_domain", desiredDomain);
                metadata.put("type", "NEW_TENANT_SUBSCRIPTION");
                metadata.put("admin_email", email);
                metadata.put("admin_name", adminName);

                SessionCreateParams params = SessionCreateParams.builder()
                                .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                                .setSuccessUrl(activeDomainUrl + "/onboarding/success?session_id={CHECKOUT_SESSION_ID}")
                                .setCancelUrl(activeDomainUrl + "/onboarding/cancel")
                                .setCustomerEmail(email)
                                .addLineItem(
                                                SessionCreateParams.LineItem.builder()
                                                                .setQuantity(1L)
                                                                .setPrice(priceId)
                                                                .build())
                                .putAllMetadata(metadata)
                                .setSubscriptionData(
                                                SessionCreateParams.SubscriptionData.builder()
                                                                .putAllMetadata(metadata)
                                                                .build())
                                .build();

                Session session = Session.create(params);
                logger.info("Created Stripe Checkout Session: {}", session.getId());
                return session.getUrl();
        }

        public void createRefund(String transactionId, long amount) {
                ensureConfigured();
                logger.info("Issuing refund for transaction: {} of amount: {}", transactionId, amount);
                try {
                        com.stripe.param.RefundCreateParams params = com.stripe.param.RefundCreateParams.builder()
                                        .setPaymentIntent(transactionId)
                                        .setAmount(amount)
                                        .build();
                        com.stripe.model.Refund refund = com.stripe.model.Refund.create(params);
                        logger.info("Refund created: {}", refund.getId());
                } catch (StripeException e) {
                        logger.error("Stripe Refund failed", e);
                        throw new RuntimeException("Refund failed: " + e.getMessage());
                }
        }

        public String createCustomerPortalSession(String customerId) throws StripeException {
                ensureConfigured();
                com.stripe.param.billingportal.SessionCreateParams params = com.stripe.param.billingportal.SessionCreateParams
                                .builder()
                                .setCustomer(customerId)
                                .setReturnUrl(getDomainUrl() + "/admin/billing")
                                .build();

                com.stripe.model.billingportal.Session session = com.stripe.model.billingportal.Session.create(params);
                return session.getUrl();
        }

        public Session createCourseCheckoutSession(java.util.List<com.eduflex.backend.model.Course> courses,
                        com.eduflex.backend.model.User user, Long orderId, String successUrl, String cancelUrl)
                        throws StripeException {
                ensureConfigured();

                java.util.List<SessionCreateParams.LineItem> lineItems = new java.util.ArrayList<>();
                for (com.eduflex.backend.model.Course course : courses) {
                        long unitAmount = (long) (course.getPrice() != null ? course.getPrice() * 100 : 0);
                        lineItems.add(
                                        SessionCreateParams.LineItem.builder()
                                                        .setQuantity(1L)
                                                        .setPriceData(
                                                                        SessionCreateParams.LineItem.PriceData.builder()
                                                                                        .setCurrency("sek")
                                                                                        .setUnitAmount(unitAmount)
                                                                                        .setProductData(
                                                                                                        SessionCreateParams.LineItem.PriceData.ProductData
                                                                                                                        .builder()
                                                                                                                        .setName(course.getName())
                                                                                                                        .build())
                                                                                        .build())
                                                        .build());
                }

                Map<String, String> metadata = new HashMap<>();
                metadata.put("type", "COURSE_PURCHASE");
                metadata.put("order_id", String.valueOf(orderId));
                metadata.put("user_id", String.valueOf(user.getId()));

                SessionCreateParams params = SessionCreateParams.builder()
                                .setMode(SessionCreateParams.Mode.PAYMENT)
                                .setSuccessUrl(successUrl)
                                .setCancelUrl(cancelUrl)
                                .setCustomerEmail(user.getEmail())
                                .addAllLineItem(lineItems)
                                .putAllMetadata(metadata)
                                .build();

                Session session = Session.create(params);
                logger.info("Created Stripe Course Checkout Session: {}", session.getId());
                return session;
        }
}
