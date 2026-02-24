package com.eduflex.backend.controller;

import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.security.MfaService;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/mfa")
public class MfaController {

    private final MfaService mfaService;
    private final UserRepository userRepository;

    public MfaController(MfaService mfaService, UserRepository userRepository) {
        this.mfaService = mfaService;
        this.userRepository = userRepository;
    }

    @PostMapping("/setup")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> setupMfa(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Användare hittades inte"));

        GoogleAuthenticatorKey key = mfaService.generateSecret();
        String qrCodeUrl = mfaService.getQrCodeUrl(user.getEmail(), key);

        return ResponseEntity.ok(new MfaSetupResponse(key.getKey(), qrCodeUrl));
    }

    @PostMapping("/enable")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> enableMfa(@RequestBody MfaEnableRequest request, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Användare hittades inte"));

        if (mfaService.verifyCode(request.secret(), Integer.parseInt(request.code()))) {
            user.setMfaSecret(request.secret());
            user.setMfaEnabled(true);
            userRepository.save(user);
            return ResponseEntity.ok("MFA har aktiverats framgångsrikt!");
        } else {
            return ResponseEntity.status(401).body("Ogiltig kod. Kontrollera din app.");
        }
    }

    public record MfaSetupResponse(String secret, String qrCodeUrl) {
    }

    public record MfaEnableRequest(String secret, String code) {
    }
}
