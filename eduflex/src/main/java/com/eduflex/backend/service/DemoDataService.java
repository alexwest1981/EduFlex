package com.eduflex.backend.service;

import com.eduflex.backend.model.*;
import com.eduflex.backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class DemoDataService {

    private static final Logger logger = LoggerFactory.getLogger(DemoDataService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CourseRepository courseRepository;
    private final PasswordEncoder passwordEncoder;
    private final AttendanceRepository attendanceRepository;
    private final CourseResultRepository courseResultRepository;
    private final CalendarEventRepository calendarEventRepository;

    @Autowired
    public DemoDataService(UserRepository userRepository,
            RoleRepository roleRepository,
            CourseRepository courseRepository,
            PasswordEncoder passwordEncoder,
            AttendanceRepository attendanceRepository,
            CourseResultRepository courseResultRepository,
            CalendarEventRepository calendarEventRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.courseRepository = courseRepository;
        this.passwordEncoder = passwordEncoder;
        this.attendanceRepository = attendanceRepository;
        this.courseResultRepository = courseResultRepository;
        this.calendarEventRepository = calendarEventRepository;
    }

    @Transactional
    public void generateSwedishDemoData() {
        logger.info("🇸🇪 Generating Refined Swedish Demo Data for tenant: {}",
                com.eduflex.backend.config.tenant.TenantContext.getCurrentTenant());

        Role teacherRole = roleRepository.findByName("TEACHER").orElseThrow();
        Role studentRole = roleRepository.findByName("STUDENT").orElseThrow();

        // 1. Teachers
        User teacher1 = createDemoUser("Anders", "Andersson", "teacher.anders", "teacher.anders@demo.se", teacherRole);
        User teacher2 = createDemoUser("Karin", "Lundström", "teacher.karin", "teacher.karin@demo.se", teacherRole);

        // 2. Courses
        Course course1 = createDemoCourse("Matematik 1b", "MATMAT01b", teacher1, "Natural Science");
        Course course2 = createDemoCourse("Programmering 1", "PRGPRG01", teacher2, "Technology");

        // 3. Students
        String[] firstNames = { "Lars", "Mikael", "Anna", "Elisabeth", "Erik", "Johan", "Maria", "Karin", "Sven",
                "Linnea" };
        String[] lastNames = { "Svensson", "Persson", "Gustafsson", "Larsson", "Olsson", "Karlsson", "Eriksson",
                "Hansson", "Nilsson", "Åberg" };

        List<User> students = new ArrayList<>();
        for (int i = 0; i < 20; i++) {
            String fName = firstNames[i % firstNames.length];
            String lName = lastNames[i % lastNames.length] + (i >= 10 ? " " + (i + 1) : "");
            User student = createDemoUser(fName, lName, "student." + (i + 1), "student." + (i + 1) + "@demo.se",
                    studentRole);
            students.add(student);

            course1.getStudents().add(student);
            course2.getStudents().add(student);
        }
        courseRepository.save(course1);
        courseRepository.save(course2);

        // 4. Generate Historical Analytics (30 days)
        generateHistoricalData(course1, students);
        generateHistoricalData(course2, students);

        logger.info("✅ Demo data generation complete!");
    }

    private User createDemoUser(String first, String last, String user, String email, Role role) {
        return userRepository.findByUsername(user).orElseGet(() -> {
            User u = new User();
            u.setFirstName(first);
            u.setLastName(last);
            u.setUsername(user);
            u.setEmail(email);
            u.setPassword(passwordEncoder.encode("123"));
            u.setRole(role);
            u.setActive(true);
            return userRepository.save(u);
        });
    }

    private Course createDemoCourse(String name, String code, User teacher, String category) {
        return courseRepository.findByCourseCode(code).orElseGet(() -> {
            Course c = new Course();
            c.setName(name);
            c.setCourseCode(code);
            c.setTeacher(teacher);
            c.setCategory(category);
            c.setOpen(true);
            c.setSlug(code.toLowerCase());
            return courseRepository.save(c);
        });
    }

    private void generateHistoricalData(Course course, List<User> students) {
        Random rand = new Random();
        LocalDateTime now = LocalDateTime.now();

        for (int i = 29; i >= 0; i--) {
            LocalDateTime date = now.minusDays(i);

            // Create a CalendarEvent (Lesson) for each day
            CalendarEvent event = new CalendarEvent();
            event.setTitle("Lektion: " + course.getName());
            event.setCourse(course);
            event.setOwner(course.getTeacher());
            event.setStartTime(date.withHour(8).withMinute(30));
            event.setEndTime(date.withHour(10).withMinute(0));
            event.setType(CalendarEvent.EventType.LESSON);
            event.setStatus(CalendarEvent.EventStatus.CONFIRMED);
            event = calendarEventRepository.save(event);

            for (User student : students) {
                // Attendance
                Attendance att = new Attendance();
                att.setEvent(event);
                att.setStudent(student);
                att.setPresent(rand.nextDouble() > 0.15); // ~85% attendance
                attendanceRepository.save(att);

                // Sample Grading/Results (weekly)
                if (i % 7 == 0) {
                    CourseResult res = courseResultRepository
                            .findByCourseIdAndStudentId(course.getId(), student.getId())
                            .orElse(new CourseResult());
                    res.setCourse(course);
                    res.setStudent(student);
                    res.setGrade(getRandomGrade(rand));
                    res.setStatus(CourseResult.Status.PASSED);
                    res.setGradedAt(date);
                    courseResultRepository.save(res);
                }
            }
        }
    }

    private String getRandomGrade(Random rand) {
        double d = rand.nextDouble();
        if (d > 0.85)
            return "A";
        if (d > 0.70)
            return "B";
        if (d > 0.50)
            return "C";
        if (d > 0.30)
            return "D";
        if (d > 0.10)
            return "E";
        return "F";
    }
}
