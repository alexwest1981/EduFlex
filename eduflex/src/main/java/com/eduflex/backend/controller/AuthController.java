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

    public AuthController(AuthenticationManager authenticationManager,
            UserRepository userRepository,
            UserService userService,
            JwtUtils jwtUtils,
            PasswordEncoder passwordEncoder,
            RateLimitingService rateLimitingService,
            SubscriptionPlanRepository subscriptionPlanRepository,

            com.eduflex.backend.repository.RoleRepository roleRepository,
            StudentActivityService studentActivityService,
            com.eduflex.backend.security.RateLimitingFilter rateLimitingFilter) {
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
                System.out.println("DEBUG: Failed login for " + loginRequest.username() + " from IP " + ip);
                rateLimitingFilter.recordAttempt(ip);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Ogiltigt användarnamn eller lösenord.");
            }

            System.out.println("DEBUG: Authentication successful.");

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            User user = userService.getUserByUsernameWithBadges(loginRequest.username());

            try {
                userService.updateLastLogin(user.getId());
            } catch (Exception e) {
                System.out.println("WARNING: Failed to update last login: " + e.getMessage());
            }

            // Logga inloggning i aktivitetshistoriken
            try {
                System.out.println("DEBUG: Attempting to log login activity...");
                studentActivityService.logActivity(user.getId(), null, null, StudentActivityLog.ActivityType.LOGIN,
                        "Inloggning via webb");
                System.out.println("DEBUG: Login activity logged successfully.");
            } catch (Throwable e) {
                System.out.println("CRITICAL ERROR logging login activity: " + e.getMessage());
                e.printStackTrace();
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
        } catch (Throwable t) {
            System.out.println("FATAL ERROR in authenticateUser: " + t.getMessage());
            t.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Login failed due to server error: " + t.getMessage());
        }
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

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}