package com.eduflex.backend.controller;

import com.eduflex.backend.dto.JwtResponse;
import com.eduflex.backend.dto.LoginRequest;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.security.JwtUtils;
import com.eduflex.backend.service.UserService;
import com.eduflex.backend.service.StudentActivityService;
import com.eduflex.backend.model.StudentActivityLog;
import com.eduflex.backend.repository.SubscriptionPlanRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.eduflex.backend.service.RateLimitingService;
import io.github.bucket4j.Bucket;
import org.springframework.http.HttpStatus;
import jakarta.servlet.http.HttpServletRequest;
import com.eduflex.backend.security.MfaService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user authentication and registration")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final UserService userService;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder; // Vi behöver denna för att spara säkra lösenord
    private final RateLimitingService rateLimitingService;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final com.eduflex.backend.repository.RoleRepository roleRepository;
    private final StudentActivityService studentActivityService;
    private final com.eduflex.backend.security.RateLimitingFilter rateLimitingFilter;
    private final MfaService mfaService;

    public AuthController(AuthenticationManager authenticationManager,
            UserRepository userRepository,
            UserService userService,
            JwtUtils jwtUtils,
            PasswordEncoder passwordEncoder,
            RateLimitingService rateLimitingService,
            SubscriptionPlanRepository subscriptionPlanRepository,

            com.eduflex.backend.repository.RoleRepository roleRepository,
            StudentActivityService studentActivityService,
            com.eduflex.backend.security.RateLimitingFilter rateLimitingFilter,
            MfaService mfaService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.userService = userService;
        this.jwtUtils = jwtUtils;
        this.passwordEncoder = passwordEncoder;
        this.rateLimitingService = rateLimitingService;
        this.subscriptionPlanRepository = subscriptionPlanRepository;
        this.roleRepository = roleRepository;
        this.studentActivityService = studentActivityService;
        this.rateLimitingFilter = rateLimitingFilter;
        this.mfaService = mfaService;
    }

    @Operation(summary = "Authenticate user", description = "Authenticates a user and returns a JWT token.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully authenticated"),
            @ApiResponse(responseCode = "429", description = "Too many login attempts"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest,
            HttpServletRequest request) {
        try {
            System.out.println("DEBUG: Entering authenticateUser for " + loginRequest.username());

            // --- RATE LIMITING ---
            Bucket bucket = rateLimitingService.resolveBucket(request.getRemoteAddr());
            if (!bucket.tryConsume(1)) {
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                        .body("För många inloggningsförsök. Försök igen om en minut.");
            }
            // ---------------------

            System.out.println("DEBUG: Rate limit check passed.");

            Authentication authentication;
            try {
                authentication = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(loginRequest.username(), loginRequest.password()));
            } catch (org.springframework.security.authentication.BadCredentialsException bce) {
                String ip = getClientIp(request);
                System.out.println("DEBUG: Failed login for " + loginRequest.username() + " from IP " + ip
                        + " | cause: "
                        + (bce.getCause() != null
                                ? bce.getCause().getClass().getSimpleName() + ": " + bce.getCause().getMessage()
                                : bce.getMessage()));
                rateLimitingFilter.recordAttempt(ip);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Ogiltigt användarnamn eller lösenord.");
            } catch (org.springframework.security.authentication.DisabledException de) {
                System.out.println("DEBUG: Account DISABLED for " + loginRequest.username());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Kontot är inaktiverat.");
            } catch (org.springframework.security.core.AuthenticationException ae) {
                System.out.println("DEBUG: Auth exception for " + loginRequest.username() + ": "
                        + ae.getClass().getSimpleName() + " - " + ae.getMessage());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Inloggning misslyckades.");
            }

            System.out.println("DEBUG: Authentication successful.");

            User user = userService.getUserByUsernameWithBadges(loginRequest.username());

            // --- MFA CHECK ---
            if (user.isMfaEnabled()) {
                // Return 200 with metadata indicating MFA is required
                return ResponseEntity.ok(new MfaChallengeResponse(user.getUsername()));
            }
            // -----------------

            System.out.println("DEBUG: Authentication successful.");
            return completeLogin(authentication, user);
        } catch (Throwable t) {
            System.out.println("FATAL ERROR in authenticateUser: " + t.getMessage());
            t.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Login failed due to server error: " + t.getMessage());
        }
    }

    @PostMapping("/verify-mfa")
    public ResponseEntity<?> verifyMfa(@RequestBody MfaVerifyRequest request) {
        User user = userService.getUserByUsername(request.username());
        if (!user.isMfaEnabled()) {
            return ResponseEntity.badRequest().body("MFA är inte aktiverat för denna användare.");
        }

        if (mfaService.verifyCode(user.getMfaSecret(), Integer.parseInt(request.code()))) {
            // Success! Generate token
            Authentication authentication = new UsernamePasswordAuthenticationToken(user.getUsername(), null,
                    java.util.Collections
                            .singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                    user.getRole().getName())));
            return completeLogin(authentication, user);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Ogiltig MFA-kod.");
        }
    }

    private ResponseEntity<?> completeLogin(Authentication authentication, User user) {
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        try {
            userService.updateLastLogin(user.getId());
        } catch (Exception e) {
            System.out.println("WARNING: Failed to update last login: " + e.getMessage());
        }

        // Logga inloggning i aktivitetshistoriken
        try {
            studentActivityService.logActivity(user.getId(), null, null, StudentActivityLog.ActivityType.LOGIN,
                    "Inloggning via webb");
        } catch (Throwable e) {
            System.out.println("CRITICAL ERROR logging login activity: " + e.getMessage());
        }

        return ResponseEntity.ok(new JwtResponse(
                jwt,
                user.getId(),
                user.getUsername(),
                user.getFirstName(),
                user.getLastName(),
                user.getFullName(),
                user.getRole().getName(),
                user.getProfilePictureUrl(),
                user.getPoints(),
                user.getLevel(),
                user.getEarnedBadges()));
    }

    // Helper records for MFA
    public record MfaChallengeResponse(String username, boolean mfaRequired) {
        public MfaChallengeResponse(String username) {
            this(username, true);
        }
    }

    public record MfaVerifyRequest(String username, String code) {
    }

    // --- HÄR ÄR DEN NYA METODEN SOM SAKNADES ---
    @Operation(summary = "Register user", description = "Registers a new user with the system.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User registered successfully"),
            @ApiResponse(responseCode = "400", description = "Username or email already exists")
    })
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User signUpRequest) {
        if (userRepository.findByUsername(signUpRequest.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Fel: Användarnamnet används redan!");
        }

        if (userRepository.findByEmail(signUpRequest.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Fel: E-postadressen används redan!");
        }

        // Skapa ny användare
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setFirstName(signUpRequest.getFirstName());
        user.setLastName(signUpRequest.getLastName());

        // Hämta roll från DB
        String roleName = signUpRequest.getRole() != null ? signUpRequest.getRole().getName() : "STUDENT";
        com.eduflex.backend.model.Role role = roleRepository.findByName(roleName)
                .orElse(null);

        if (role == null) {
            // Fallback: Try with ROLE_ prefix if missing
            role = roleRepository.findByName("ROLE_" + roleName)
                    .orElseThrow(() -> new RuntimeException("Error: Role '" + roleName + "' is not found."));
        }
        user.setRole(role);

        // VIKTIGT: Kryptera lösenordet innan vi sparar
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));

        // Assign default subscription plan if one exists
        subscriptionPlanRepository.findByIsDefaultTrue().ifPresent(user::setSubscriptionPlan);

        userRepository.save(user);

        return ResponseEntity.ok("Användare registrerad!");
    }

    @PostMapping("/verify-password")
    public ResponseEntity<?> verifyPassword(@RequestBody PasswordVerifyRequest request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Ej inloggad.");
        }

        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Användare hittades inte"));

        if (passwordEncoder.matches(request.password(), user.getPassword())) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Fel lösenord.");
        }
    }

    public record PasswordVerifyRequest(String password) {
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}