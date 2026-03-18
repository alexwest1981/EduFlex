package com.eduflex.backend.service;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.CourseApplication;
import com.eduflex.backend.model.EducationProgram;
import com.eduflex.backend.model.ProgramApplication;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.CourseApplicationRepository;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.EducationProgramRepository;
import com.eduflex.backend.repository.ProgramApplicationRepository;
import com.eduflex.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class EducationProgramService {

    private final EducationProgramRepository repository;
    private final CourseRepository courseRepository;
    private final ProgramApplicationRepository programApplicationRepository;
    private final CourseApplicationRepository courseApplicationRepository;
    private final UserRepository userRepository;

    public List<EducationProgram> getAllPrograms() {
        return repository.findAll();
    }

    public Optional<EducationProgram> getProgramById(Long id) {
        return repository.findById(id);
    }

    public Optional<EducationProgram> getProgramBySlug(String slug) {
        return repository.findBySlug(slug);
    }

    @Transactional
    public EducationProgram saveProgram(EducationProgram program) {
        if (program.getSlug() == null || program.getSlug().isEmpty()) {
            program.setSlug(program.getName().toLowerCase().replaceAll("[^a-z0-9]", "-"));
        }
        return repository.save(program);
    }

    @Transactional
    public void deleteProgram(Long id) {
        repository.deleteById(id);
    }

    @Transactional
    public EducationProgram addCourseToProgram(Long programId, Long courseId) {
        EducationProgram program = repository.findById(programId)
                .orElseThrow(() -> new RuntimeException("Program not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        program.addCourse(course);
        updateProgramMetadata(program);
        return repository.save(program);
    }

    @Transactional
    public EducationProgram removeCourseFromProgram(Long programId, Long courseId) {
        EducationProgram program = repository.findById(programId)
                .orElseThrow(() -> new RuntimeException("Program not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        program.removeCourse(course);
        updateProgramMetadata(program);
        return repository.save(program);
    }

    @Transactional
    public ProgramApplication applyForProgram(Long programId, Long userId) {
        EducationProgram program = repository.findById(programId)
                .orElseThrow(() -> new RuntimeException("Program not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create Program Application
        ProgramApplication app = new ProgramApplication();
        app.setProgram(program);
        app.setUser(user);
        app.setStatus(CourseApplication.Status.PENDING);
        ProgramApplication savedApp = programApplicationRepository.save(app);

        // Create individual Course Applications for all courses in program
        for (Course course : program.getCourses()) {
            boolean alreadyApplied = courseApplicationRepository
                    .findByCourseIdAndStudentId(course.getId(), user.getId()).isPresent();
            if (!alreadyApplied) {
                CourseApplication courseApp = new CourseApplication();
                courseApp.setCourse(course);
                courseApp.setStudent(user);
                courseApp.setStatus(CourseApplication.Status.PENDING);
                courseApp.setAdminNote("Automatiskt skapad via programansökan: " + program.getName());
                courseApplicationRepository.save(courseApp);
            }
        }

        return savedApp;
    }

    private void updateProgramMetadata(EducationProgram program) {
        Set<Course> courses = program.getCourses();
        StringBuilder aggregatedSkills = new StringBuilder();
        int totalCredits = 0;

        for (Course course : courses) {
            if (course.getTags() != null) {
                if (aggregatedSkills.length() > 0)
                    aggregatedSkills.append(", ");
                aggregatedSkills.append(course.getTags());
            }
            // Add credits if available on Course
        }
        program.setJobTechSkills(aggregatedSkills.toString());
        program.setTotalCredits(totalCredits);
    }
}
