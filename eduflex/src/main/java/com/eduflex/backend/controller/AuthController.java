package com.eduflex.backend.controller;

import com.eduflex.backend.dto.JwtResponse;
import com.eduflex.backend.dto.LoginRequest;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.security.JwtUtils;
import com.eduflex.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder; // VIKTIG IMPORT
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final UserService userService;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder; // Vi behöver denna för att spara säkra lösenord

    // Uppdaterad konstruktor med PasswordEncoder
    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          UserService userService,
                          JwtUtils jwtUtils,
                          PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.userService = userService;
        this.jwtUtils = jwtUtils;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
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
                user.getEarnedBadges()
        ));
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

        userRepository.save(user);

        return ResponseEntity.ok("Användare registrerad!");
    }
}