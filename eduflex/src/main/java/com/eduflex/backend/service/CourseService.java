package com.eduflex.backend.service;

import com.eduflex.backend.dto.CourseDTO;
import com.eduflex.backend.dto.CreateCourseDTO;
import com.eduflex.backend.dto.UserSummaryDTO;
import com.eduflex.backend.model.*;
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
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final CourseMaterialRepository materialRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public CourseService(CourseRepository courseRepository, UserRepository userRepository, CourseMaterialRepository materialRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.materialRepository = materialRepository;
    }

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
        User teacher = userRepository.findById(teacherId).orElseThrow(() -> new RuntimeException("Lärare ej funnen"));
        Course course = new Course();
        course.setName(dto.name());
        course.setCourseCode(dto.courseCode());
        course.setDescription(dto.description());
        course.setStartDate(dto.startDate());
        course.setEndDate(dto.endDate()); // SPARA SLUTDATUM
        course.setTeacher(teacher);
        return courseRepository.save(course);
    }

    public Course saveCourse(Course course) {
        return courseRepository.save(course);
    }

    public void addStudentToCourse(Long courseId, Long studentId) {
        Course course = getCourseById(courseId);
        User student = userRepository.findById(studentId).orElseThrow(() -> new RuntimeException("Student ej funnen"));
        if (!course.getStudents().contains(student)) {
            course.getStudents().add(student);
            courseRepository.save(course);
        }
    }

    public List<Course> getCoursesForUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        if (user.getRole() == User.Role.TEACHER) {
            return courseRepository.findAll().stream().filter(c -> c.getTeacher().getId().equals(userId)).toList();
        } else {
            return courseRepository.findAll().stream().filter(c -> c.getStudents().contains(user)).toList();
        }
    }

    public List<CourseDTO> getAvailableCoursesForStudent(Long studentId) {
        User student = userRepository.findById(studentId).orElseThrow();
        return courseRepository.findAll().stream()
                .filter(c -> !c.getStudents().contains(student))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CourseMaterial addMaterial(Long courseId, String title, String content, String link, String type, MultipartFile file) throws IOException {
        Course course = getCourseById(courseId);
        CourseMaterial material = new CourseMaterial();
        material.setTitle(title);
        material.setContent(content);
        material.setLink(link);
        material.setType(CourseMaterial.MaterialType.valueOf(type));
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

    public List<CourseMaterial> getMaterialsForCourse(Long courseId) {
        return materialRepository.findByCourseId(courseId);
    }

    public void deleteMaterial(Long id) {
        materialRepository.deleteById(id);
    }

    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }

    public CourseEvaluation createEvaluation(Long courseId, CourseEvaluation evaluation) {
        Course course = getCourseById(courseId);
        evaluation.setCourse(course);
        course.setEvaluation(evaluation);
        courseRepository.save(course);
        return evaluation;
    }

    // Helper för DTO konvertering
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
                c.getId(),
                c.getName(),
                c.getCourseCode(),
                c.getDescription(),
                c.getStartDate(),
                c.getEndDate(), // SKICKA MED SLUTDATUM
                teacherDTO,
                studentDTOs,
                c.isOpen(),
                c.getEvaluation()
        );
    }
}