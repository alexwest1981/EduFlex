package com.eduflex.backend.controller;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.CourseOrder;
import com.eduflex.backend.model.PaymentSettings;
import com.eduflex.backend.model.PromoCode;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.CourseOrderRepository;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.PaymentSettingsRepository;
import com.eduflex.backend.repository.PromoCodeRepository;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.service.StripeService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/checkout")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@Tag(name = "Checkout Management", description = "Endpoints for course e-commerce")
public class CheckoutController {

    private static final Logger logger = LoggerFactory.getLogger(CheckoutController.class);

    private final StripeService stripeService;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final CourseOrderRepository courseOrderRepository;
    private final PaymentSettingsRepository paymentSettingsRepository;
    private final PromoCodeRepository promoCodeRepository;

    public CheckoutController(StripeService stripeService, CourseRepository courseRepository,
            UserRepository userRepository, CourseOrderRepository courseOrderRepository,
            PaymentSettingsRepository paymentSettingsRepository, PromoCodeRepository promoCodeRepository) {
        this.stripeService = stripeService;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.courseOrderRepository = courseOrderRepository;
        this.paymentSettingsRepository = paymentSettingsRepository;
        this.promoCodeRepository = promoCodeRepository;
    }

    @PostMapping("/courses")
    @Operation(summary = "Create Checkout Session", description = "Initiates a Stripe Checkout session for course purchases.")
    @Transactional
    public ResponseEntity<?> createCheckoutSession(@RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            User user = userRepository.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Long> courseIds = (List<Long>) request.get("courseIds");
            String promoCodeStr = (String) request.get("promoCode");
            String successUrl = (String) request.get("successUrl");
            String cancelUrl = (String) request.get("cancelUrl");

            if (courseIds == null || courseIds.isEmpty() || successUrl == null || cancelUrl == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields"));
            }

            List<Course> coursesToBuy = new ArrayList<>();
            BigDecimal totalAmount = BigDecimal.ZERO;

            for (Long courseId : courseIds) {
                Course course = courseRepository.findById(courseId).orElse(null);
                if (course != null && course.isOpen()) {
                    coursesToBuy.add(course);
                    if (course.getPrice() != null) {
                        totalAmount = totalAmount.add(BigDecimal.valueOf(course.getPrice()));
                    }
                }
            }

            if (coursesToBuy.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No valid courses found to purchase"));
            }

            // Handle Promo Code
            PromoCode promoCode = null;
            if (promoCodeStr != null && !promoCodeStr.isBlank()) {
                Optional<PromoCode> optPromo = promoCodeRepository.findByCode(promoCodeStr);
                if (optPromo.isPresent() && optPromo.get().isValid()) {
                    promoCode = optPromo.get();
                    if (promoCode.getDiscountType() == PromoCode.DiscountType.PERCENTAGE) {
                        BigDecimal multiplier = BigDecimal.ONE
                                .subtract(promoCode.getDiscountValue().divide(BigDecimal.valueOf(100)));
                        totalAmount = totalAmount.multiply(multiplier);
                    } else if (promoCode.getDiscountType() == PromoCode.DiscountType.FIXED_AMOUNT) {
                        totalAmount = totalAmount.subtract(promoCode.getDiscountValue());
                        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) {
                            totalAmount = BigDecimal.ZERO;
                        }
                    }
                } else {
                    return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired promo code"));
                }
            }

            // Create initial pending order
            CourseOrder order = new CourseOrder();
            order.setCustomer(user);
            order.getCourses().addAll(coursesToBuy);
            order.setTotalAmount(totalAmount);
            order.setStatus(CourseOrder.OrderStatus.PENDING);
            order.setPromoCode(promoCode);
            order = courseOrderRepository.save(order);

            // Create Stripe Session
            Session session = stripeService.createCourseCheckoutSession(coursesToBuy, user, order.getId(), successUrl,
                    cancelUrl);

            // Update order with session ID
            order.setStripeSessionId(session.getId());
            courseOrderRepository.save(order);

            // Increment Promo Code usage
            if (promoCode != null) {
                promoCode.setCurrentUses(promoCode.getCurrentUses() + 1);
                promoCodeRepository.save(promoCode);
            }

            return ResponseEntity.ok(Map.of("url", session.getUrl(), "sessionId", session.getId()));
        } catch (Exception e) {
            logger.error("Error creating course checkout session", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/webhook")
    @Operation(summary = "Stripe Webhook for Courses", description = "Receives checkout completions for course purchases.")
    @Transactional
    public ResponseEntity<String> handleStripeWebhook(@RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        // Fetch Tenant's webhook secret
        String endpointSecret = paymentSettingsRepository.findByIsActiveTrue()
                .filter(s -> "STRIPE".equals(s.getProvider()))
                .map(PaymentSettings::getWebhookSecret)
                .orElse(null);

        if (endpointSecret == null || endpointSecret.isBlank()) {
            logger.error("Stripe Webhook Secret is not configured for tenant.");
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

        if ("checkout.session.completed".equals(event.getType())) {
            try {
                Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);

                if (session != null && session.getMetadata() != null) {
                    Map<String, String> metadata = session.getMetadata();
                    String type = metadata.get("type");

                    if ("COURSE_PURCHASE".equals(type)) {
                        String orderIdStr = metadata.get("order_id");
                        String userIdStr = metadata.get("user_id");

                        if (orderIdStr != null && userIdStr != null) {
                            Long orderId = Long.parseLong(orderIdStr);
                            Long userId = Long.parseLong(userIdStr);

                            CourseOrder order = courseOrderRepository.findById(orderId).orElse(null);
                            User user = userRepository.findById(userId).orElse(null);

                            if (order != null && user != null) {
                                order.setStatus(CourseOrder.OrderStatus.COMPLETED);
                                order.setStripePaymentIntentId(session.getPaymentIntent());
                                courseOrderRepository.save(order);

                                // Add user to courses
                                for (Course course : order.getCourses()) {
                                    course.getStudents().add(user);
                                    courseRepository.save(course);
                                }
                                logger.info("Successfully provisioned courses for order ID: {}", orderId);
                            }
                        }
                    }
                }
            } catch (Exception e) {
                logger.error("Error processing checkout completion event", e);
            }
        }

        return ResponseEntity.ok("Received");
    }

    @GetMapping("/orders")
    @Operation(summary = "Get all orders", description = "For admin to view all course sales.")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getAllOrders(Authentication authentication) {
        if (authentication == null)
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        User user = userRepository.findByUsername(authentication.getName()).orElse(null);
        if (user == null
                || (!user.getRole().getName().contains("ADMIN") && !user.getRole().getName().contains("REKTOR"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        return ResponseEntity.ok(courseOrderRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/orders/me")
    @Operation(summary = "Get my orders", description = "For users to view their past orders.")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getMyOrders(Authentication authentication) {
        if (authentication == null)
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        User user = userRepository.findByUsername(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        return ResponseEntity.ok(courseOrderRepository.findByCustomer_IdOrderByCreatedAtDesc(user.getId()));
    }
}
