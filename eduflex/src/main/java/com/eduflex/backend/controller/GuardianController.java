package com.eduflex.backend.controller;

import com.eduflex.backend.model.User;
import com.eduflex.backend.service.GuardianDashboardService;
import com.eduflex.backend.service.UserService;
import com.eduflex.backend.service.SickLeaveService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/guardian")
@PreAuthorize("hasRole('GUARDIAN')")
public class GuardianController {

    private final GuardianDashboardService guardianDashboardService;
    private final UserService userService;
    private final SickLeaveService sickLeaveService;
    private final com.eduflex.backend.service.ai.GeminiService geminiService;

    public GuardianController(GuardianDashboardService guardianDashboardService,
            UserService userService,
            SickLeaveService sickLeaveService,
            com.eduflex.backend.service.ai.GeminiService geminiService) {
        this.guardianDashboardService = guardianDashboardService;
        this.userService = userService;
        this.sickLeaveService = sickLeaveService;
        this.geminiService = geminiService;
    }

    @GetMapping("/children")
    public ResponseEntity<List<User>> getChildren(Authentication authentication) {
        User guardian = userService.getUserByUsername(authentication.getName());
        return ResponseEntity.ok(guardianDashboardService.getChildren(guardian));
    }

    @GetMapping("/dashboard/{studentId}")
    public ResponseEntity<Map<String, Object>> getChildDashboard(@PathVariable Long studentId,
            Authentication authentication) {
        User guardian = userService.getUserByUsername(authentication.getName());
        List<User> children = guardianDashboardService.getChildren(guardian);

        // Security check: Ensure this student is linked to the guardian
        boolean isLinked = children.stream().anyMatch(c -> c.getId().equals(studentId));
        if (!isLinked) {
            return ResponseEntity.status(403).build();
        }

        User child = userService.getUserById(studentId);
        return ResponseEntity.ok(guardianDashboardService.getChildDashboardMetrics(child));
    }

    @GetMapping("/summary/{studentId}")
    public ResponseEntity<Map<String, String>> getAiSummary(@PathVariable Long studentId,
            Authentication authentication) {
        User guardian = userService.getUserByUsername(authentication.getName());
        List<User> children = guardianDashboardService.getChildren(guardian);

        // Security check
        boolean isLinked = children.stream().anyMatch(c -> c.getId().equals(studentId));
        if (!isLinked) {
            return ResponseEntity.status(403).build();
        }

        User child = userService.getUserById(studentId);
        Map<String, Object> metrics = guardianDashboardService.getChildDashboardMetrics(child);

        if (!geminiService.isAvailable()) {
            String fallback = String.format(
                    "Status för %s: Allt ser bra ut inför dagens %s lektioner. Kom ihåg att det finns %s kommande uppgifter att kika på tillsammans.",
                    child.getFirstName(),
                    metrics.getOrDefault("todayScheduleCount", 0),
                    metrics.getOrDefault("upcomingAssignmentsCount", 0));
            return ResponseEntity.ok(Map.of("summary", fallback));
        }

        String prompt = String.format(
                "Du är en hjälpsam AI-rådgivare på skolan EduFlex. Du pratar med en vårdnadshavare om deras barn %s.\n\n"
                        +
                        "Här är barnets aktuella status:\n" +
                        "- Närvaro idag: %s%%\n" +
                        "- Kommande uppgifter: %s\n" +
                        "- Antal lektioner idag: %s\n\n" +
                        "Skriv en mycket kort, positiv och informativ sammanfattning (max 3-4 meningar) till vårdnadshavaren om hur det går och vad som händer idag.",
                child.getFirstName(),
                metrics.getOrDefault("attendancePercentage", "0"),
                metrics.getOrDefault("upcomingAssignmentsCount", "0"),
                metrics.getOrDefault("todayScheduleCount", "0"));

        String summary = geminiService.generateResponse(prompt);

        return ResponseEntity.ok(Map.of("summary", summary));
    }

    @PostMapping("/absence")
    public ResponseEntity<?> reportAbsence(@RequestBody Map<String, Object> request, Authentication authentication) {
        Long studentId = Long.valueOf(request.get("studentId").toString());
        LocalDate startDate = LocalDate.parse(request.get("startDate").toString());
        LocalDate endDate = request.get("endDate") != null ? LocalDate.parse(request.get("endDate").toString()) : null;
        String reason = request.getOrDefault("reason", "Anmäld av vårdnadshavare").toString();

        User guardian = userService.getUserByUsername(authentication.getName());
        List<User> children = guardianDashboardService.getChildren(guardian);

        // Security check
        boolean isLinked = children.stream().anyMatch(c -> c.getId().equals(studentId));
        if (!isLinked) {
            return ResponseEntity.status(403).body("Du har inte behörighet att anmäla frånvaro för denna elev.");
        }

        sickLeaveService.reportSickLeave(studentId, startDate, endDate, reason, guardian.getId());
        return ResponseEntity.ok().build();
    }
}
