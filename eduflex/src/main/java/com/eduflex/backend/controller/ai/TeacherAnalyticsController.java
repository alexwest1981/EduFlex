package com.eduflex.backend.controller.ai;

import com.eduflex.backend.service.ai.TeacherAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/teacher/mission-control")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
public class TeacherAnalyticsController {

    private final TeacherAnalyticsService teacherAnalyticsService;

    @GetMapping("/course/{courseId}")
    public ResponseEntity<TeacherAnalyticsService.CourseAnalytics> getCourseAnalytics(@PathVariable Long courseId) {
        TeacherAnalyticsService.CourseAnalytics analytics = teacherAnalyticsService.getCourseAnalytics(courseId);
        // We generate the insight on demand to save tokens if the teacher doesn't check
        // it,
        // or we can bundle it. Let's bundle it for simplicity in the first version.
        analytics.setAiInsight(teacherAnalyticsService.generateAiInsight(courseId, analytics));
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/course/{courseId}/insight")
    public ResponseEntity<String> getAiInsight(@PathVariable Long courseId) {
        TeacherAnalyticsService.CourseAnalytics analytics = teacherAnalyticsService.getCourseAnalytics(courseId);
        return ResponseEntity.ok(teacherAnalyticsService.generateAiInsight(courseId, analytics));
    }

    @PostMapping("/course/{courseId}/lesson-plan")
    public ResponseEntity<String> generateLessonPlan(@PathVariable Long courseId) {
        TeacherAnalyticsService.CourseAnalytics analytics = teacherAnalyticsService.getCourseAnalytics(courseId);
        return ResponseEntity.ok(teacherAnalyticsService.generateLessonPlan(courseId, analytics));
    }

    @PostMapping("/course/{courseId}/lesson-plan/save-calendar")
    public ResponseEntity<Map<String, Object>> saveLessonPlanToCalendar(
            @PathVariable Long courseId,
            @RequestBody SaveLessonRequest request,
            org.springframework.security.core.Authentication auth) {

        try {
            teacherAnalyticsService.saveLessonPlanToCalendar(courseId, request.getTitle(), request.getDescription(),
                    request.getStartTime(), request.getEndTime(), auth.getName());
            return ResponseEntity.ok(Map.of("message", "Lektion sparad i kalendern"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    public static class SaveLessonRequest {
        private String title;
        private String description;
        private java.time.LocalDateTime startTime;
        private java.time.LocalDateTime endTime;

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public java.time.LocalDateTime getStartTime() {
            return startTime;
        }

        public void setStartTime(java.time.LocalDateTime startTime) {
            this.startTime = startTime;
        }

        public java.time.LocalDateTime getEndTime() {
            return endTime;
        }

        public void setEndTime(java.time.LocalDateTime endTime) {
            this.endTime = endTime;
        }
    }
}
