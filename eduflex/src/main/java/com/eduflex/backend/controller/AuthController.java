package com.eduflex.backend.controller;

import com.eduflex.backend.dto.JwtResponse;
import com.eduflex.backend.dto.LoginRequest;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.security.JwtUtils;
import com.eduflex.backend.service.UserService;
import com.eduflex.backend.repository.SubscriptionPlanRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder; // VIKTIG IMPORT
import org.springframework.web.bind.annotation.*;
import com.eduflex.backend.service.RateLimitingService;
import io.github.bucket4j.Bucket;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final UserService userService;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder; // Vi behöver denna för att spara säkra lösenord
    private final RateLimitingService rateLimitingService;
    private final SubscriptionPlanRepository subscriptionPlanRepository;

    public AuthController(AuthenticationManager authenticationManager,
            UserRepository userRepository,
            UserService userService,
            JwtUtils jwtUtils,
            PasswordEncoder passwordEncoder,
            RateLimitingService rateLimitingService,
            SubscriptionPlanRepository subscriptionPlanRepository) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.userService = userService;
        this.jwtUtils = jwtUtils;
        this.passwordEncoder = passwordEncoder;
        this.rateLimitingService = rateLimitingService;
        this.subscriptionPlanRepository = subscriptionPlanRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest,
            jakarta.servlet.http.HttpServletRequest request) {
        // --- RATE LIMITING ---
        Bucket bucket = rateLimitingService.resolveBucket(request.getRemoteAddr());
        if (!bucket.tryConsume(1)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("För många inloggningsförsök. Försök igen om en minut.");
        }
        // ---------------------

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.username(), loginRequest.password()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        User user = userRepository.findByUsername(loginRequest.username())
                .orElseThrow(() -> new UsernameNotFoundException("Användare hittades inte"));

        userService.updateLastLogin(user.getId());

        return ResponseEntity.ok(new JwtResponse(
                jwt,
                user.getId(),
                user.getUsername(),
                user.getFirstName(),
                user.getLastName(),
                user.getFullName(),
                user.getRole().name(),
                user.getProfilePictureUrl(),
                user.getPoints(),
                user.getLevel(),
                user.getEarnedBadges()));
    }

    // --- HÄR ÄR DEN NYA METODEN SOM SAKNADES ---
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
        user.setRole(signUpRequest.getRole()); // Frontend skickar rollen (t.ex. STUDENT)

        // VIKTIGT: Kryptera lösenordet innan vi sparar
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));

        // Assign default subscription plan if one exists
        subscriptionPlanRepository.findByIsDefaultTrue().ifPresent(user::setSubscriptionPlan);

        userRepository.save(user);

        return ResponseEntity.ok("Användare registrerad!");
    }
}