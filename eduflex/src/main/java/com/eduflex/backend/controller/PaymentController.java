package com.eduflex.backend.controller;

import com.eduflex.backend.service.StripeService;
import com.eduflex.backend.service.TenantService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@Tag(name = "Payment Management", description = "Endpoints for Stripe integration")
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    private final StripeService stripeService;
    private final TenantService tenantService;

    @Value("${stripe.webhook.secret:}")
    private String endpointSecret;

    @Autowired
    public PaymentController(StripeService stripeService, TenantService tenantService) {
        this.stripeService = stripeService;
        this.tenantService = tenantService;
    }

    @PostMapping("/checkout")
    @Operation(summary = "Create Checkout Session", description = "Initiates a Stripe Checkout session for a subscription.")
    public ResponseEntity<?> createCheckoutSession(@RequestBody Map<String, String> request) {
        try {
            String priceId = request.get("priceId");
            String email = request.get("email");
            String tenantName = request.get("tenantName");
            String desiredDomain = request.get("desiredDomain");
            String adminName = request.get("adminName"); // e.g., "Anna Andersson"

            if (priceId == null || email == null || tenantName == null || desiredDomain == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields"));
            }

            String checkoutUrl = stripeService.createCheckoutSession(priceId, email, tenantName, desiredDomain,
                    adminName);
            return ResponseEntity.ok(Map.of("url", checkoutUrl));
        } catch (Exception e) {
            logger.error("Error creating checkout session", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/webhook")
    @Operation(summary = "Stripe Webhook", description = "Receives events from Stripe to trigger provisioning.")
    public ResponseEntity<String> handleStripeWebhook(@RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        if (endpointSecret == null) {
            logger.error("Stripe Webhook Secret is not configured.");
            return ResponseEntity.status(500).build();
        }

        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
        } catch (SignatureVerificationException e) {
            logger.warn("Invalid Signature: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid Signature");
        } catch (Exception e) {
            logger.error("Webhook processing error", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Webhook Error");
        }

        // Handle the event
        if ("checkout.session.completed".equals(event.getType())) {
            try {
                // Safe extraction of Session object using Stripe SDK deserialize helper
                // Note: we trust deserializer for Session type when event type matches
                Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);

                if (session != null && session.getMetadata() != null) {
                    Map<String, String> metadata = session.getMetadata();
                    String tenantName = metadata.get("tenant_name");
                    String adminEmail = metadata.get("admin_email");
                    String desiredDomain = metadata.get("desired_domain");
                    String adminFirstName = "Admin";
                    String adminLastName = "User";

                    if (metadata.containsKey("admin_name")) {
                        String[] names = metadata.get("admin_name").split(" ", 2);
                        adminFirstName = names[0];
                        if (names.length > 1)
                            adminLastName = names[1];
                    }

                    String type = metadata.get("type");
                    if ("NEW_TENANT_SUBSCRIPTION".equals(type) && tenantName != null && desiredDomain != null) {
                        logger.info("Provisioning new tenant: {} ({}) for {}", tenantName, desiredDomain, adminEmail);

                        // Generate a safe organization key/schema
                        String orgKey = desiredDomain.toLowerCase().replaceAll("[^a-z0-9]", "");
                        String dbSchema = "tenant_" + orgKey;

                        try {
                            String stripeCustomerId = session.getCustomer();
                            String stripeSubscriptionId = session.getSubscription();

                            tenantService.createTenant(
                                    tenantName,
                                    desiredDomain + ".eduflex.se",
                                    dbSchema,
                                    orgKey,
                                    adminEmail,
                                    "temporal123", // Temporary password
                                    adminFirstName,
                                    adminLastName,
                                    stripeCustomerId,
                                    stripeSubscriptionId,
                                    com.eduflex.backend.model.LicenseType.BASIC,
                                    null);
                            logger.info("Successfully provisioned tenant: {} with Stripe IDs", orgKey);
                        } catch (Exception e) {
                            logger.error("Failed to provision tenant automatically: {}", e.getMessage());
                        }
                    }
                }
            } catch (Exception e) {
                logger.error("Error processing checkout completion event", e);
            }
        } else if ("customer.subscription.deleted".equals(event.getType())) {
            try {
                com.stripe.model.Subscription subscription = (com.stripe.model.Subscription) event
                        .getDataObjectDeserializer().getObject().orElse(null);
                if (subscription != null) {
                    String customerId = subscription.getCustomer();
                    logger.warn("Subscription deleted for Stripe Customer: {}. Deactivating tenant...", customerId);
                    tenantService.deactivateTenantByStripeCustomer(customerId);
                }
            } catch (Exception e) {
                logger.error("Error processing subscription deletion", e);
            }
        } else if ("invoice.payment_failed".equals(event.getType())) {
            logger.warn("Payment failed for an invoice. The admin should be notified to update their payment methods.");
        }

        return ResponseEntity.ok("Received");
    }
}
