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
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final CourseMaterialRepository materialRepository;
    private final Path fileStorageLocation;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    public CourseService(CourseRepository courseRepository, UserRepository userRepository, CourseMaterialRepository materialRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.materialRepository = materialRepository;

        // Skapa mapp för kursmaterial om den inte finns
        this.fileStorageLocation = Paths.get("uploads/materials").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Kunde inte skapa mapp för kursmaterial.", ex);
        }
    }

    public List<CourseDTO> getAllCourseDTOs() {
        return courseRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public CourseDTO getCourseDTOById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kurs inte hittad"));
        return mapToDTO(course);
    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kurs inte hittad"));
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
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student hittades inte"));
        course.getStudents().add(student);
        courseRepository.save(course);
    }

    public List<Course> getCoursesForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Användare hittades inte"));
        switch (user.getRole()) {
            case TEACHER: return courseRepository.findByTeacherId(userId);
            case STUDENT: return courseRepository.findByStudents_Id(userId);
            case ADMIN: return courseRepository.findAll();
            default: return List.of();
        }
    }

    public List<CourseDTO> getAvailableCoursesForStudent(Long studentId) {
        List<Course> allCourses = courseRepository.findAll();
        return allCourses.stream()
                .filter(course -> course.getStudents().stream()
                        .noneMatch(student -> student.getId().equals(studentId)))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // --- MATERIALHANTERING (Här är metoden som saknades) ---

    public CourseMaterial addMaterial(Long courseId, String title, String content, String link, String type, MultipartFile file) {
        Course course = getCourseById(courseId);
        CourseMaterial material = new CourseMaterial();
        material.setTitle(title);
        material.setContent(content);
        material.setLink(link);
        material.setType(type);
        material.setCourse(course);

        if (file != null && !file.isEmpty()) {
            String originalName = StringUtils.cleanPath(file.getOriginalFilename());
            String fileName = UUID.randomUUID().toString() + "_" + originalName;
            try {
                Path target = this.fileStorageLocation.resolve(fileName);
                Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
                material.setFileName(originalName);
                material.setFileType(file.getContentType());
                material.setFileUrl("/uploads/materials/" + fileName);
            } catch (IOException ex) {
                throw new RuntimeException("Kunde inte spara fil", ex);
            }
        }
        return materialRepository.save(material);
    }

    public List<CourseMaterial> getMaterialsForCourse(Long courseId) {
        return materialRepository.findByCourseId(courseId);
    }

    public void deleteMaterial(Long id) {
        materialRepository.deleteById(id);
    }

    // --- SLUT PÅ MATERIALHANTERING ---

    @Transactional
    public void deleteCourse(Long id) {
        try {
            Course course = getCourseById(id);
            course.getStudents().clear();
            courseRepository.save(course);
            courseRepository.deleteById(id);
        } catch (Exception e) {
            System.err.println("Kunde inte radera kurs via JPA (" + e.getMessage() + "). Försöker tvinga bort den via SQL...");
            forceDeleteCourse(id);
        }
    }

    private void forceDeleteCourse(Long courseId) {
        entityManager.createNativeQuery("DELETE FROM course_students WHERE course_id = :id")
                .setParameter("id", courseId)
                .executeUpdate();
        entityManager.createNativeQuery("DELETE FROM course_materials WHERE course_id = :id")
                .setParameter("id", courseId)
                .executeUpdate();
        entityManager.createNativeQuery("DELETE FROM submissions WHERE assignment_id IN (SELECT id FROM assignments WHERE course_id = :id)")
                .setParameter("id", courseId)
                .executeUpdate();
        entityManager.createNativeQuery("DELETE FROM assignments WHERE course_id = :id")
                .setParameter("id", courseId)
                .executeUpdate();
        entityManager.createNativeQuery("DELETE FROM courses WHERE id = :id")
                .setParameter("id", courseId)
                .executeUpdate();
    }

    private CourseDTO mapToDTO(Course course) {
        UserSummaryDTO teacherDTO = new UserSummaryDTO(
                course.getTeacher().getId(),
                course.getTeacher().getFullName(),
                course.getTeacher().getUsername(),
                course.getTeacher().getRole().name()
        );

        List<UserSummaryDTO> studentDTOs = course.getStudents().stream()
                .map(s -> new UserSummaryDTO(s.getId(), s.getFullName(), s.getUsername(), s.getRole().name()))
                .collect(Collectors.toList());

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
}