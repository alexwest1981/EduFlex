package com.eduflex.backend.controller;

import com.eduflex.backend.model.*;
import com.eduflex.backend.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final CourseRepository courseRepository;
    private final CalendarEventRepository eventRepository;
    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    public AttendanceController(CourseRepository c, CalendarEventRepository e, AttendanceRepository a,
            UserRepository u) {
        this.courseRepository = c;
        this.eventRepository = e;
        this.attendanceRepository = a;
        this.userRepository = u;
    }

    // 1. Lärare: Skapa ett nytt event (Lektion/Föreläsning)
    @PostMapping("/course/{courseId}/event")
    public ResponseEntity<CalendarEvent> createEvent(@PathVariable Long courseId, @RequestBody CalendarEvent event) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        event.setCourse(course);
        return ResponseEntity.ok(eventRepository.save(event));
    }

    // 2. Student: Hämta events och se min status
    @GetMapping("/course/{courseId}/student/{studentId}")
    public ResponseEntity<List<Map<String, Object>>> getStudentAttendance(@PathVariable Long courseId,
            @PathVariable Long studentId) {
        List<CalendarEvent> events = eventRepository.findByCourseIdOrderByStartTimeAsc(courseId);

        List<Map<String, Object>> response = events.stream().map(event -> {
            Attendance att = attendanceRepository.findByEventIdAndStudentId(event.getId(), studentId);
            return Map.of(
                    "event", event,
                    "isPresent", att != null && att.isPresent(),
                    "hasRecord", att != null, // Om läraren registrerat något överhuvudtaget
                    "note", att != null && att.getNote() != null ? att.getNote() : "");
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // 2.5 Hämta närvaro för ett event (ALLA studenter)
    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<Attendance>> getEventAttendance(@PathVariable Long eventId) {
        return ResponseEntity.ok(attendanceRepository.findByEventId(eventId));
    }

    // 3. Lärare: Registrera närvaro för en student på ett event
    @PostMapping("/event/{eventId}/mark")
    public ResponseEntity<Void> markAttendance(@PathVariable Long eventId, @RequestBody Map<String, Object> payload) {
        Long studentId = Long.valueOf(payload.get("studentId").toString());
        boolean present = (boolean) payload.get("present");
        String note = (String) payload.get("note");

        CalendarEvent event = eventRepository.findById(eventId).orElseThrow();
        User student = userRepository.findById(studentId).orElseThrow();

        Attendance attendance = attendanceRepository.findByEventIdAndStudentId(eventId, studentId);
        if (attendance == null) {
            attendance = new Attendance();
            attendance.setEvent(event);
            attendance.setStudent(student);
        }
        attendance.setPresent(present);
        if (note != null)
            attendance.setNote(note);

        attendanceRepository.save(attendance);
        return ResponseEntity.ok().build();
    }
}