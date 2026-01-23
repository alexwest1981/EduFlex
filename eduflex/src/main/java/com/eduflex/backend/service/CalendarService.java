package com.eduflex.backend.service;

import com.eduflex.backend.model.CalendarEvent;
import com.eduflex.backend.model.CalendarEvent.EventPlatform;

import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.CalendarEventRepository;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CalendarService {

    private final CalendarEventRepository eventRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(CalendarService.class);

    @Autowired(required = false)
    private MentorService mentorService;

    public CalendarService(CalendarEventRepository eventRepository,
            CourseRepository courseRepository,
            UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    /**
     * TimeSlot representation for 10-minute booking blocks
     */
    public static class TimeSlot {
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private boolean isAvailable;
        private List<CalendarEvent> conflictingEvents;
        private User owner; // For personal booking slots

        public TimeSlot(LocalDateTime startTime, LocalDateTime endTime, boolean isAvailable) {
            this.startTime = startTime;
            this.endTime = endTime;
            this.isAvailable = isAvailable;
            this.conflictingEvents = new ArrayList<>();
        }

        // Getters and setters
        public LocalDateTime getStartTime() {
            return startTime;
        }

        public LocalDateTime getEndTime() {
            return endTime;
        }

        public boolean isAvailable() {
            return isAvailable;
        }

        public void setAvailable(boolean available) {
            isAvailable = available;
        }

        public List<CalendarEvent> getConflictingEvents() {
            return conflictingEvents;
        }

        public void addConflictingEvent(CalendarEvent event) {
            conflictingEvents.add(event);
        }

        public User getOwner() {
            return owner;
        }

        public void setOwner(User owner) {
            this.owner = owner;
        }
    }

    /**
     * Generate 10-minute time slots for a given date
     */
    public List<TimeSlot> generateTimeSlots(LocalDate date, User user) {
        return generateTimeSlots(date, LocalTime.of(8, 0), LocalTime.of(18, 0), 10, user);
    }

    /**
     * Generate time slots with custom parameters
     */
    public List<TimeSlot> generateTimeSlots(LocalDate date, LocalTime startTime, LocalTime endTime,
            int slotDurationMinutes, User user) {
        List<TimeSlot> slots = new ArrayList<>();
        LocalDateTime currentDateTime = LocalDateTime.of(date, startTime);
        LocalDateTime endDateTime = LocalDateTime.of(date, endTime);

        // Get all events for the day
        List<CalendarEvent> dayEvents = getEventsForDate(date, user);

        while (currentDateTime.isBefore(endDateTime)) {
            LocalDateTime slotEnd = currentDateTime.plusMinutes(slotDurationMinutes);

            TimeSlot slot = new TimeSlot(currentDateTime, slotEnd, true);

            // Check for conflicts
            for (CalendarEvent event : dayEvents) {
                if (isTimeSlotConflicting(slot, event)) {
                    slot.setAvailable(false);
                    slot.addConflictingEvent(event);
                }
            }

            slots.add(slot);
            currentDateTime = slotEnd;
        }

        return slots;
    }

    /**
     * Check if a time slot conflicts with an event
     */
    private boolean isTimeSlotConflicting(TimeSlot slot, CalendarEvent event) {
        return slot.getStartTime().isBefore(event.getEndTime()) &&
                slot.getEndTime().isAfter(event.getStartTime());
    }

    /**
     * Get events for a specific date for a user based on their role and permissions
     */
    public List<CalendarEvent> getEventsForDate(LocalDate date, User user) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        List<CalendarEvent> allEvents = eventRepository.findByStartTimeBetweenOrderByStartTimeAsc(startOfDay, endOfDay);

        return allEvents.stream()
                .filter(event -> canUserViewEvent(user, event))
                .collect(Collectors.toList());
    }

    /**
     * Get events for a date range for a user
     */
    public List<CalendarEvent> getEventsForDateRange(LocalDate startDate, LocalDate endDate, User user) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        List<CalendarEvent> allEvents = eventRepository.findByStartTimeBetweenOrderByStartTimeAsc(start, end);

        return allEvents.stream()
                .filter(event -> canUserViewEvent(user, event))
                .collect(Collectors.toList());
    }

    /**
     * Check if a user can view an event based on role and permissions
     */
    public boolean canUserViewEvent(User user, CalendarEvent event) {
        if (user == null || event == null) {
            return false;
        }

        if (user.getRole() == null) {
            logger.warn("⚠️ User {} has no role! Defaulting to denied access for event {}", user.getUsername(),
                    event.getId());
            return false;
        }
        String userRole = user.getRole().getName();

        // ADMIN can see everything
        if ("ADMIN".equals(userRole)) {
            return true;
        }

        // PRINCIPAL can see most things
        if ("PRINCIPAL".equals(userRole)) {
            // Can see all events except private meetings they're not part of
            if (event.getType() == CalendarEvent.EventType.MEETING) {
                return isUserPartOfEvent(user, event);
            }
            return true;
        }

        // TEACHER can see their own course events and their personal meetings
        if ("TEACHER".equals(userRole)) {
            return isUserOwnerOfEvent(user, event) ||
                    isUserTeacherOfCourseEvent(user, event) ||
                    isUserPartOfEvent(user, event);
        }

        // MENTOR can see events with their assigned students and their personal events
        if ("MENTOR".equals(userRole)) {
            return isUserOwnerOfEvent(user, event) ||
                    isUserMentorOfAttendees(user, event) ||
                    isUserPartOfEvent(user, event);
        }

        // STUDENT can only see events they're part of or their course events
        if ("STUDENT".equals(userRole)) {
            return isUserPartOfEvent(user, event) ||
                    isUserEnrolledInCourseEvent(user, event);
        }

        return false;
    }

    /**
     * Check if user is the owner of the event
     */
    private boolean isUserOwnerOfEvent(User user, CalendarEvent event) {
        return event.getOwner() != null && event.getOwner().getId().equals(user.getId());
    }

    /**
     * Check if user is the teacher of a course event
     */
    private boolean isUserTeacherOfCourseEvent(User user, CalendarEvent event) {
        return event.getCourse() != null &&
                event.getCourse().getTeacher() != null &&
                event.getCourse().getTeacher().getId().equals(user.getId());
    }

    /**
     * Check if user is part of an event (owner or attendee)
     */
    public boolean isUserPartOfEvent(User user, CalendarEvent event) {
        if (isUserOwnerOfEvent(user, event)) {
            return true;
        }

        return event.getAttendees().stream()
                .anyMatch(attendee -> attendee.getId().equals(user.getId()));
    }

    /**
     * Check if mentor is assigned to any of the event attendees
     */
    private boolean isUserMentorOfAttendees(User user, CalendarEvent event) {
        if (mentorService == null) {
            return false;
        }

        // Check if event owner is one of mentor's students
        if (event.getOwner() != null) {
            List<User> myStudents = mentorService.getActiveStudentsForMentor(user.getId());
            if (myStudents.stream().anyMatch(s -> s.getId().equals(event.getOwner().getId()))) {
                return true;
            }
        }

        // Check attendees
        return event.getAttendees().stream()
                .anyMatch(attendee -> {
                    List<User> myStudents = mentorService.getActiveStudentsForMentor(user.getId());
                    return myStudents.stream().anyMatch(s -> s.getId().equals(attendee.getId()));
                });
    }

    /**
     * Check if student is enrolled in the course of the event
     */
    private boolean isUserEnrolledInCourseEvent(User user, CalendarEvent event) {
        if (event.getCourse() == null) {
            return false;
        }

        // Check if user is enrolled in the course
        return event.getCourse().getStudents().stream()
                .anyMatch(student -> student.getId().equals(user.getId()));
    }

    /**
     * Create a new event with validation
     */
    public CalendarEvent createEvent(CalendarEvent event, User creator) {
        // Validate time slots
        if (event.getStartTime().isAfter(event.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        // Check for conflicts (optional, based on requirements)
        // List<CalendarEvent> conflictingEvents = getConflictingEvents(event);

        event.setOwner(creator);
        return eventRepository.save(event);
    }

    /**
     * Get conflicting events for a time period
     */
    public List<CalendarEvent> getConflictingEvents(LocalDateTime startTime, LocalDateTime endTime, User user) {
        return eventRepository.findByStartTimeBetweenOrderByStartTimeAsc(startTime, endTime).stream()
                .filter(event -> isEventTimeConflicting(startTime, endTime, event))
                .filter(event -> canUserViewEvent(user, event))
                .collect(Collectors.toList());
    }

    /**
     * Check if two time periods conflict
     */
    private boolean isEventTimeConflicting(LocalDateTime newStart, LocalDateTime newEnd, CalendarEvent existingEvent) {
        return newStart.isBefore(existingEvent.getEndTime()) &&
                newEnd.isAfter(existingEvent.getStartTime());
    }

    /**
     * Get available time slots for a user on a specific date
     */
    public List<TimeSlot> getAvailableTimeSlots(LocalDate date, User user) {
        return generateTimeSlots(date, user).stream()
                .filter(TimeSlot::isAvailable)
                .collect(Collectors.toList());
    }

    /**
     * Get user by email from JWT (legacy, kept for compatibility)
     */
    public User getUserFromJwt(Jwt jwt) {
        if (jwt == null) {
            return null;
        }

        String email = jwt.getClaimAsString("email");
        return userRepository.findByUsername(email).orElse(null);
    }

    /**
     * Get current authenticated user from SecurityContext
     * Works with both local JWT tokens and OAuth2/Keycloak tokens
     */
    public User getCurrentUser() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }

        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findByEmail(username).orElse(null));
    }

    /**
     * Get users that a specific user can book meetings with
     * OPTIMIZED: Removed lazy-loaded collection calls to prevent N+1 queries
     */
    public List<User> getBookableUsers(User user) {
        String userRole = user.getRole().getName();
        List<User> bookableUsers = new ArrayList<>();

        switch (userRole) {
            case "STUDENT":
                // Students can book with teachers and mentors
                // Simplified: return all teachers (avoid N+1 query)
                bookableUsers.addAll(userRepository.findAll().stream()
                        .filter(u -> "TEACHER".equals(u.getRole().getName()) || "MENTOR".equals(u.getRole().getName()))
                        .collect(Collectors.toList()));
                break;

            case "MENTOR":
                // Mentors can book with students, teachers, and principal
                bookableUsers.addAll(userRepository.findAll().stream()
                        .filter(u -> "STUDENT".equals(u.getRole().getName()) ||
                                "TEACHER".equals(u.getRole().getName()) ||
                                "PRINCIPAL".equals(u.getRole().getName()))
                        .collect(Collectors.toList()));
                break;

            case "TEACHER":
                // Teachers can book with students and other teachers
                bookableUsers.addAll(userRepository.findAll().stream()
                        .filter(u -> "STUDENT".equals(u.getRole().getName()) || "TEACHER".equals(u.getRole().getName()))
                        .collect(Collectors.toList()));
                break;

            case "PRINCIPAL":
                // Principal can book with everyone
                bookableUsers.addAll(userRepository.findAll());
                break;

            case "ADMIN":
                // Admin can book with everyone
                bookableUsers.addAll(userRepository.findAll());
                break;
        }

        return bookableUsers.stream().distinct().collect(Collectors.toList());
    }

    /**
     * Generate Google Calendar export URL for user's events
     */
    public String generateGoogleCalendarUrl(User user, LocalDate startDate, LocalDate endDate) {
        List<CalendarEvent> events = getEventsForDateRange(startDate, endDate, user);

        if (events.isEmpty()) {
            return null;
        }

        try {
            StringBuilder baseUrl = new StringBuilder("https://calendar.google.com/calendar/render?action=TEMPLATE");

            // Add events (Google Calendar supports multiple events with
            // &text=&dates=&details= parameters)
            for (int i = 0; i < events.size(); i++) {
                CalendarEvent event = events.get(i);

                // Format dates for Google Calendar (yyyyMMddTHHmmssZ format)
                String startTime = formatForGoogleCalendar(event.getStartTime());
                String endTime = formatForGoogleCalendar(event.getEndTime());

                // URL encode the parameters
                String title = java.net.URLEncoder.encode(event.getTitle(), "UTF-8");
                String description = java.net.URLEncoder.encode(
                        (event.getDescription() != null ? event.getDescription() : "") +
                                (event.getMeetingLink() != null ? "\nMeeting: " + event.getMeetingLink() : "") +
                                (event.getPlatform() != null && event.getPlatform() != EventPlatform.NONE
                                        ? "\nPlatform: " + event.getPlatform()
                                        : ""),
                        "UTF-8");

                baseUrl.append("&text=").append(title)
                        .append("&dates=").append(startTime).append("/").append(endTime)
                        .append("&details=").append(description);

                if (i == 0) {
                    // Add location if available
                    if (event.getTopic() != null && !event.getTopic().trim().isEmpty()) {
                        String location = java.net.URLEncoder.encode(event.getTopic(), "UTF-8");
                        baseUrl.append("&location=").append(location);
                    }
                }
            }

            return baseUrl.toString();

        } catch (Exception e) {
            System.err.println("Error generating Google Calendar URL: " + e.getMessage());
            return null;
        }
    }

    /**
     * Format LocalDateTime for Google Calendar URL
     */
    private String formatForGoogleCalendar(LocalDateTime dateTime) {
        return dateTime.format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss"));
    }

    /**
     * Get users that can be filtered by the current user based on role
     * Role-based filtering rules:
     * - ADMIN: Can see all (teachers, mentors, principals) + own (but not other
     * admins)
     * - PRINCIPAL: Can see teachers + mentors + own
     * - MENTOR: Can see assigned students + colleagues (teacher/mentor/principal) +
     * own
     * - TEACHER: Can see colleagues (teacher/mentor/principal) + own
     * - STUDENT: Can see only their courses and their mentor
     */
    public List<User> getUsersFilterableBy(User currentUser) {
        if (currentUser == null || currentUser.getRole() == null) {
            return new ArrayList<>();
        }

        String role = currentUser.getRole().getName();
        List<User> allUsers = userRepository.findAll();
        Set<User> filterableUsers = new HashSet<>();

        switch (role) {
            case "ADMIN":
                // Can see teachers, mentors, principals, and own
                filterableUsers.addAll(allUsers.stream()
                        .filter(u -> u.getRole() != null &&
                                ("TEACHER".equals(u.getRole().getName()) ||
                                        "MENTOR".equals(u.getRole().getName()) ||
                                        "PRINCIPAL".equals(u.getRole().getName())))
                        .collect(Collectors.toList()));
                filterableUsers.add(currentUser); // Add own
                break;

            case "PRINCIPAL":
                // Can see teachers, mentors, and own
                filterableUsers.addAll(allUsers.stream()
                        .filter(u -> u.getRole() != null &&
                                ("TEACHER".equals(u.getRole().getName()) ||
                                        "MENTOR".equals(u.getRole().getName())))
                        .collect(Collectors.toList()));
                filterableUsers.add(currentUser);
                break;

            case "MENTOR":
                // Can see assigned students + colleagues + own
                if (mentorService != null) {
                    filterableUsers.addAll(mentorService.getActiveStudentsForMentor(currentUser.getId()));
                }
                filterableUsers.addAll(allUsers.stream()
                        .filter(u -> u.getRole() != null &&
                                ("TEACHER".equals(u.getRole().getName()) ||
                                        "MENTOR".equals(u.getRole().getName()) ||
                                        "PRINCIPAL".equals(u.getRole().getName())))
                        .collect(Collectors.toList()));
                filterableUsers.add(currentUser);
                break;

            case "TEACHER":
                // Can see colleagues and own
                filterableUsers.addAll(allUsers.stream()
                        .filter(u -> u.getRole() != null &&
                                ("TEACHER".equals(u.getRole().getName()) ||
                                        "MENTOR".equals(u.getRole().getName()) ||
                                        "PRINCIPAL".equals(u.getRole().getName())))
                        .collect(Collectors.toList()));
                filterableUsers.add(currentUser);
                break;

            case "STUDENT":
                // Can only see their mentor
                if (mentorService != null) {
                    Optional<User> mentor = mentorService.getActiveMentorForStudent(currentUser.getId());
                    mentor.ifPresent(filterableUsers::add);
                }
                filterableUsers.add(currentUser);
                break;

            default:
                filterableUsers.add(currentUser);
                break;
        }

        return new ArrayList<>(filterableUsers);
    }

    /**
     * Sanitize event for privacy when viewed by non-participants
     * Shows: time, length, platform icon, status (lower opacity)
     * Hides: title (replaced with type), description, meeting link, specific
     * details
     */
    public CalendarEvent sanitizeEvent(CalendarEvent event, User viewer, boolean isAdmin) {
        // Admin sees everything
        if (isAdmin) {
            return event;
        }

        // If viewer is owner or participant, show everything
        if (isUserOwnerOfEvent(viewer, event) || isUserPartOfEvent(viewer, event)) {
            return event;
        }

        // Create sanitized copy
        CalendarEvent sanitized = new CalendarEvent();
        sanitized.setId(event.getId());
        sanitized.setStartTime(event.getStartTime());
        sanitized.setEndTime(event.getEndTime());
        sanitized.setType(event.getType());
        sanitized.setStatus(event.getStatus());
        sanitized.setPlatform(event.getPlatform());

        // Replace title with generic event type
        String genericTitle = switch (event.getType()) {
            case LESSON -> "Lektion";
            case EXAM -> "Tenta";
            case MEETING -> "Möte";
            case WORKSHOP -> "Workshop";
            case ASSIGNMENT -> "Uppgift";
            default -> "Upptagen";
        };
        sanitized.setTitle(genericTitle);

        // Hide sensitive information
        sanitized.setDescription(null);
        sanitized.setMeetingLink(null);
        sanitized.setTopic(null);
        sanitized.setIsMandatory(false);
        sanitized.setOwner(null);
        sanitized.setCourse(null);

        return sanitized;
    }

    /**
     * Get events for a specific user (for calendar filtering) with optional type
     * and search filters
     */
    public List<CalendarEvent> getEventsForUser(Long userId, User viewer, List<CalendarEvent.EventType> types,
            String search) {
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        logger.info("📅 getEventsForUser: userId={}, targetUser={}, viewer={}, types={}, search={}",
                userId, targetUser.getUsername(), viewer.getUsername(), types, search);

        List<CalendarEvent> allEvents = eventRepository.findAll();
        logger.info("📊 Total events in database: {}", allEvents.size());

        List<CalendarEvent> events = allEvents.stream()
                .filter(event -> {
                    boolean isOwner = isUserOwnerOfEvent(targetUser, event);
                    boolean isParticipant = isUserPartOfEvent(targetUser, event);
                    boolean isTeacher = event.getCourse() != null && isUserTeacherOfCourseEvent(targetUser, event);
                    boolean matchesUser = isOwner || isParticipant || isTeacher;

                    if (!matchesUser)
                        return false;

                    // Filter by types if provided
                    if (types != null && !types.isEmpty() && !types.contains(event.getType())) {
                        return false;
                    }

                    // Filter by search query if provided
                    if (search != null && !search.trim().isEmpty()) {
                        String s = search.toLowerCase();
                        boolean titleMatch = event.getTitle() != null && event.getTitle().toLowerCase().contains(s);
                        boolean descMatch = event.getDescription() != null
                                && event.getDescription().toLowerCase().contains(s);
                        if (!titleMatch && !descMatch)
                            return false;
                    }

                    return true;
                })
                .collect(Collectors.toList());

        logger.info("🎯 Filtered events: {} events", events.size());

        // Apply privacy filtering
        String viewerRole = viewer.getRole() != null ? viewer.getRole().getName() : "";
        boolean isAdmin = "ADMIN".equals(viewerRole);

        return events.stream()
                .map(event -> sanitizeEvent(event, viewer, isAdmin))
                .collect(Collectors.toList());
    }

    /**
     * Legacy method for backward compatibility
     */
    public List<CalendarEvent> getEventsForUser(Long userId, User viewer) {
        return getEventsForUser(userId, viewer, null, null);
    }

    /**
     * Get events for a specific course with optional filters
     */
    public List<CalendarEvent> getEventsForCourse(Long courseId, User viewer, List<CalendarEvent.EventType> types,
            String search) {
        List<CalendarEvent> events = eventRepository.findAll().stream()
                .filter(event -> event.getCourse() != null &&
                        event.getCourse().getId().equals(courseId))
                .filter(event -> {
                    // Filter by types if provided
                    if (types != null && !types.isEmpty() && !types.contains(event.getType())) {
                        return false;
                    }

                    // Filter by search query if provided
                    if (search != null && !search.trim().isEmpty()) {
                        String s = search.toLowerCase();
                        boolean titleMatch = event.getTitle() != null && event.getTitle().toLowerCase().contains(s);
                        boolean descMatch = event.getDescription() != null
                                && event.getDescription().toLowerCase().contains(s);
                        if (!titleMatch && !descMatch)
                            return false;
                    }

                    return true;
                })
                .collect(Collectors.toList());

        // Apply privacy filtering
        String viewerRole = viewer.getRole() != null ? viewer.getRole().getName() : "";
        boolean isAdmin = "ADMIN".equals(viewerRole);

        return events.stream()
                .map(event -> sanitizeEvent(event, viewer, isAdmin))
                .collect(Collectors.toList());
    }

    /**
     * Legacy method for backward compatibility
     */
    public List<CalendarEvent> getEventsForCourse(Long courseId, User viewer) {
        return getEventsForCourse(courseId, viewer, null, null);
    }

    /**
     * Get IDs of courses a student is enrolled in
     */
    public List<Long> getStudentCourseIds(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Student not found"));

        return student.getCourses().stream()
                .map(com.eduflex.backend.model.Course::getId)
                .collect(Collectors.toList());
    }

    /**
     * Get IDs of courses a teacher teaches
     */
    public List<Long> getTeacherCourseIds(Long teacherId) {
        return courseRepository.findAll().stream()
                .filter(course -> course.getTeacher() != null &&
                        course.getTeacher().getId().equals(teacherId))
                .map(course -> course.getId())
                .collect(Collectors.toList());
    }
}