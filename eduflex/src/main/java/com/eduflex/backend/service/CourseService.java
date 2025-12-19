package com.eduflex.backend.service;

import com.eduflex.backend.dto.CourseDTO;
import com.eduflex.backend.dto.CreateCourseDTO;
import com.eduflex.backend.dto.UserSummaryDTO;
import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.CourseMaterial;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.CourseMaterialRepository;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final CourseMaterialRepository materialRepository;
    private final Path fileStorageLocation;

    @Autowired
    public CourseService(CourseRepository courseRepository, UserRepository userRepository, CourseMaterialRepository materialRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.materialRepository = materialRepository;
        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
        try { Files.createDirectories(this.fileStorageLocation); } catch (Exception ex) { throw new RuntimeException("Kunde inte skapa mappen.", ex); }
    }

    // --- DTO CONVERSION METHODS (Safe) ---

    private CourseDTO mapToDTO(Course course) {
        // Handle potential null teacher gracefully
        UserSummaryDTO teacherDTO = null;
        if (course.getTeacher() != null) {
            teacherDTO = new UserSummaryDTO(
                    course.getTeacher().getId(),
                    course.getTeacher().getFullName(),
                    course.getTeacher().getUsername(),
                    course.getTeacher().getRole().name()
            );
        }

        // Handle null students list gracefully
        List<UserSummaryDTO> studentDTOs = Collections.emptyList();
        if (course.getStudents() != null) {
            studentDTOs = course.getStudents().stream()
                    .map(s -> new UserSummaryDTO(s.getId(), s.getFullName(), s.getUsername(), s.getRole().name()))
                    .collect(Collectors.toList());
        }

        return new CourseDTO(
                course.getId(),
                course.getName(),
                course.getCourseCode(),
                course.getDescription(),
                course.getStartDate(),
                teacherDTO,
                studentDTOs
        );
    }

    // --- PUBLIC METHODS RETURNING DTOs ---

    public List<CourseDTO> getAllCourseDTOs() {
        return courseRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public CourseDTO getCourseDTOById(Long id) {
        Course course = getCourseById(id);
        return mapToDTO(course);
    }

    // --- CORE LOGIC ---

    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kurs hittades inte"));
    }

    public CourseMaterial addMaterial(Long courseId, String title, String content, String link, String type, MultipartFile file) {
        Course course = getCourseById(courseId);
        CourseMaterial material = new CourseMaterial();
        material.setTitle(title);
        material.setContent(content);
        material.setLink(link);
        material.setType(type);
        material.setCourse(course);

        if (file != null && !file.isEmpty()) {
            String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
            String fileName = UUID.randomUUID().toString() + "_" + originalFileName;
            try {
                Path targetLocation = this.fileStorageLocation.resolve(fileName);
                Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
                material.setFileName(originalFileName);
                material.setFileType(file.getContentType());
                material.setFileUrl("/uploads/" + fileName);
                if("TEXT".equals(type) || type == null) material.setType("FILE");
            } catch (IOException ex) { throw new RuntimeException("Kunde inte spara filen", ex); }
        }
        return materialRepository.save(material);
    }

    public List<CourseMaterial> getMaterialsForCourse(Long courseId) {
        return materialRepository.findByCourseId(courseId);
    }

    public Course createCourse(CreateCourseDTO dto, Long teacherId) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Lärare hittades inte"));

        Course course = new Course();
        course.setName(dto.name());
        course.setCourseCode(dto.courseCode());
        course.setDescription(dto.description());
        course.setStartDate(dto.startDate());
        course.setTeacher(teacher);

        return courseRepository.save(course);
    }

    @Transactional
    public void addStudentToCourse(Long courseId, Long studentId) {
        Course course = getCourseById(courseId);
        User student = userRepository.findById(studentId).orElseThrow(() -> new RuntimeException("Student hittades inte"));
        course.getStudents().add(student);
        courseRepository.save(course);
    }

    public List<Course> getCoursesForUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Användare hittades inte"));
        switch (user.getRole()) {
            case TEACHER: return courseRepository.findByTeacherId(userId);
            case STUDENT: return courseRepository.findByStudents_Id(userId);
            case ADMIN: return courseRepository.findAll();
            default: return List.of();
        }
    }

    @Transactional
    public void deleteCourse(Long id) {
        Course course = getCourseById(id);
        course.getStudents().clear();
        courseRepository.save(course);
        List<CourseMaterial> materials = materialRepository.findByCourseId(id);
        materialRepository.deleteAll(materials);
        courseRepository.deleteById(id);
    }

    public void deleteMaterial(Long id) {
        materialRepository.deleteById(id);
    }
}