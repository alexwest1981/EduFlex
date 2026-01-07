package com.eduflex.backend.service;

import com.eduflex.backend.dto.CourseDTO;
import com.eduflex.backend.dto.CreateCourseDTO;
import com.eduflex.backend.dto.UserSummaryDTO;
import com.eduflex.backend.model.*;
import com.eduflex.backend.repository.CourseApplicationRepository;
import com.eduflex.backend.repository.CourseMaterialRepository;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final CourseMaterialRepository materialRepository;
    private final CourseApplicationRepository applicationRepository; // Nytt repository

    @Value("${file.upload-dir}")
    private String uploadDir;

    public CourseService(CourseRepository courseRepository,
                         UserRepository userRepository,
                         CourseMaterialRepository materialRepository,
                         CourseApplicationRepository applicationRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.materialRepository = materialRepository;
        this.applicationRepository = applicationRepository;
    }

    // --- CRUD ---

    public List<CourseDTO> getAllCourseDTOs() {
        return courseRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public CourseDTO getCourseDTOById(Long id) {
        Course course = courseRepository.findById(id).orElseThrow(() -> new RuntimeException("Kurs ej funnen"));
        return convertToDTO(course);
    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id).orElseThrow(() -> new RuntimeException("Kurs ej funnen"));
    }

    public Course createCourse(CreateCourseDTO dto, Long teacherId) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Lärare ej funnen"));

        Course course = new Course();
        course.setName(dto.name());
        course.setCourseCode(dto.courseCode());
        course.setCategory(dto.category());
        course.setDescription(dto.description());

        if (dto.startDate() != null) course.setStartDate(dto.startDate().toString());
        if (dto.endDate() != null) course.setEndDate(dto.endDate().toString());

        if (dto.color() != null && !dto.color().isEmpty()) {
            course.setColor(dto.color());
        } else {
            course.setColor("bg-indigo-600");
        }

        if (dto.maxStudents() != null) {
            course.setMaxStudents(dto.maxStudents());
        }

        course.setTeacher(teacher);
        course.setOpen(true);
        return courseRepository.save(course);
    }

    public CourseDTO updateCourse(Long id, Map<String, Object> updates) {
        Course course = getCourseById(id);

        if (updates.containsKey("name")) course.setName((String) updates.get("name"));
        if (updates.containsKey("courseCode")) course.setCourseCode((String) updates.get("courseCode"));
        if (updates.containsKey("category")) course.setCategory((String) updates.get("category"));
        if (updates.containsKey("description")) course.setDescription((String) updates.get("description"));
        if (updates.containsKey("startDate")) course.setStartDate((String) updates.get("startDate"));
        if (updates.containsKey("endDate")) course.setEndDate((String) updates.get("endDate"));
        if (updates.containsKey("color")) course.setColor((String) updates.get("color"));
        if (updates.containsKey("maxStudents")) course.setMaxStudents((Integer) updates.get("maxStudents"));

        if (updates.containsKey("isOpen")) {
            Object openVal = updates.get("isOpen");
            if (openVal instanceof Boolean) {
                course.setOpen((Boolean) openVal);
            } else if (openVal instanceof String) {
                course.setOpen(Boolean.parseBoolean((String) openVal));
            }
        }

        Course updatedCourse = courseRepository.save(course);
        return convertToDTO(updatedCourse);
    }

    public void deleteCourse(Long id) { courseRepository.deleteById(id); }
    public Course saveCourse(Course course) { return courseRepository.save(course); }

    // --- ANSÖKNINGAR ---

    public void applyToCourse(Long courseId, Long studentId) {
        if (applicationRepository.findByCourseIdAndStudentId(courseId, studentId).isPresent()) {
            throw new RuntimeException("Redan ansökt.");
        }
        Course course = getCourseById(courseId);
        User student = userRepository.findById(studentId).orElseThrow();

        CourseApplication app = new CourseApplication();
        app.setCourse(course);
        app.setStudent(student);
        applicationRepository.save(app);
    }

    public void handleApplication(Long appId, boolean approved) {
        CourseApplication app = applicationRepository.findById(appId).orElseThrow();
        if (approved) {
            Course c = app.getCourse();
            if(c.getStudents().size() >= c.getMaxStudents()) throw new RuntimeException("Fullt!");
            c.getStudents().add(app.getStudent());
            courseRepository.save(c);
            app.setStatus(CourseApplication.Status.APPROVED);
        } else {
            app.setStatus(CourseApplication.Status.REJECTED);
        }
        applicationRepository.save(app);
    }

    public List<CourseApplication> getPendingApplications(Long teacherId) {
        return applicationRepository.findByCourseTeacherIdAndStatus(teacherId, CourseApplication.Status.PENDING);
    }

    public void addStudentToCourse(Long courseId, Long studentId) {
        Course course = getCourseById(courseId);
        User student = userRepository.findById(studentId).orElseThrow();
        if (!course.getStudents().contains(student)) {
            course.getStudents().add(student);
            courseRepository.save(course);
        }
    }

    // --- MATERIALHANTERING (DETTA VAR FELET) ---

    // Metod 1: Skapa nytt material
    public CourseMaterial addMaterial(Long courseId, String title, String content, String link, String type, MultipartFile file) throws IOException {
        Course course = getCourseById(courseId);
        CourseMaterial material = new CourseMaterial();
        material.setTitle(title);
        material.setContent(content);
        material.setLink(link);
        material.setType(CourseMaterial.MaterialType.valueOf(type)); // Enum konvertering
        material.setCourse(course);

        if (file != null && !file.isEmpty()) {
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path path = Paths.get(uploadDir + "/" + fileName);
            Files.createDirectories(path.getParent());
            Files.write(path, file.getBytes());
            material.setFileUrl("/uploads/" + fileName);
        }
        return materialRepository.save(material);
    }

    // Metod 2: Uppdatera material (NYTT)
    public CourseMaterial updateMaterial(Long id, String title, String content, String link, MultipartFile file) throws IOException {
        CourseMaterial material = materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material hittades inte"));

        if (title != null) material.setTitle(title);
        if (content != null) material.setContent(content);
        if (link != null) material.setLink(link);

        if (file != null && !file.isEmpty()) {
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path path = Paths.get(uploadDir + "/" + fileName);
            Files.createDirectories(path.getParent());
            Files.write(path, file.getBytes());
            material.setFileUrl("/uploads/" + fileName);
        }

        return materialRepository.save(material);
    }

    public List<CourseMaterial> getMaterialsForCourse(Long courseId) { return materialRepository.findByCourseId(courseId); }
    public void deleteMaterial(Long id) { materialRepository.deleteById(id); }

    // --- HELPER ---
    public List<CourseDTO> getAvailableCoursesForStudent(Long studentId) {
        User student = userRepository.findById(studentId).orElseThrow();
        return courseRepository.findAll().stream()
                .filter(c -> !c.getStudents().contains(student))
                .filter(Course::isOpen)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<Course> getCoursesForUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        if (user.getRole() == User.Role.TEACHER) {
            return courseRepository.findAll().stream().filter(c -> c.getTeacher().getId().equals(userId)).toList();
        } else {
            return courseRepository.findAll().stream().filter(c -> c.getStudents().contains(user)).toList();
        }
    }

    public CourseEvaluation createEvaluation(Long courseId, CourseEvaluation evaluation) {
        Course course = getCourseById(courseId);
        evaluation.setCourse(course);
        course.setEvaluation(evaluation);
        courseRepository.save(course);
        return evaluation;
    }

    private CourseDTO convertToDTO(Course c) {
        UserSummaryDTO teacherDTO = null;
        if (c.getTeacher() != null) {
            teacherDTO = new UserSummaryDTO(
                    c.getTeacher().getId(),
                    c.getTeacher().getFullName(),
                    c.getTeacher().getUsername(),
                    c.getTeacher().getRole().name()
            );
        }
        List<UserSummaryDTO> studentDTOs = c.getStudents().stream()
                .map(s -> new UserSummaryDTO(s.getId(), s.getFullName(), s.getUsername(), s.getRole().name()))
                .collect(Collectors.toList());

        return new CourseDTO(
                c.getId(), c.getName(), c.getCourseCode(), c.getCategory(), c.getDescription(),
                c.getStartDate(), c.getEndDate(), c.getColor(), teacherDTO, studentDTOs,
                c.isOpen(), c.getEvaluation(), c.getMaxStudents(), c.getStudents().size()
        );
    }
}