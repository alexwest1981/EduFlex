package com.eduflex.backend.controller;

import com.eduflex.backend.dto.StudentActivityLogDTO;
import com.eduflex.backend.model.StudentActivityLog;
import com.eduflex.backend.service.StudentActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/activity")
public class StudentActivityController {

    private final StudentActivityService activityService;

    public StudentActivityController(StudentActivityService activityService) {
        this.activityService = activityService;
    }

    @PostMapping("/log")
    public ResponseEntity<?> logActivity(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.valueOf(payload.get("userId").toString());
            Long courseId = Long.valueOf(payload.get("courseId").toString());
            String typeStr = payload.get("type").toString();
            String details = payload.getOrDefault("details", "").toString();
            Long materialId = payload.containsKey("materialId") ? Long.valueOf(payload.get("materialId").toString())
                    : null;

            activityService.logActivity(userId, courseId, materialId, StudentActivityLog.ActivityType.valueOf(typeStr),
                    details);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error logging activity: " + e.getMessage());
        }
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<StudentActivityLogDTO>> getCourseLogs(@PathVariable Long courseId) {
        return ResponseEntity.ok(activityService.getCourseLogs(courseId));
    }

    @GetMapping("/course/{courseId}/student/{userId}")
    public ResponseEntity<List<StudentActivityLogDTO>> getStudentLogs(@PathVariable Long courseId,
            @PathVariable Long userId) {
        return ResponseEntity.ok(activityService.getStudentLogs(courseId, userId));
    }
}
