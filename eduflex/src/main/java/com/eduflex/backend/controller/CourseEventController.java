package com.eduflex.backend.controller;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.CourseEvent;
import com.eduflex.backend.repository.CourseEventRepository;
import com.eduflex.backend.repository.CourseRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class CourseEventController {

    private final CourseEventRepository eventRepository;
    private final CourseRepository courseRepository;

    public CourseEventController(CourseEventRepository eventRepository, CourseRepository courseRepository) {
        this.eventRepository = eventRepository;
        this.courseRepository = courseRepository;
    }

    @GetMapping
    public List<CourseEvent> getAllEvents() {
        return eventRepository.findAll();
    }

    @GetMapping("/course/{courseId}")
    public List<CourseEvent> getEventsByCourse(@PathVariable Long courseId) {
        return eventRepository.findByCourseIdOrderByStartTimeAsc(courseId);
    }

    @PostMapping
    public CourseEvent createEvent(@RequestBody EventRequest request) {
        Course course = courseRepository.findById(request.courseId).orElseThrow();
        CourseEvent event = new CourseEvent();
        event.setTitle(request.title);
        event.setDescription(request.description);
        event.setStartTime(request.startTime);
        event.setEndTime(request.endTime);
        event.setType(request.type);
        event.setCourse(course);
        return eventRepository.save(event);
    }

    // DTO för inkommande data
    static class EventRequest {
        public String title;
        public String description;
        public java.time.LocalDateTime startTime;
        public java.time.LocalDateTime endTime;
        public String type;
        public Long courseId;
    }
}