package com.eduflex.backend.service;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

import com.eduflex.backend.dto.CourseDTO;
import com.eduflex.backend.dto.CreateCourseDTO;
import com.eduflex.backend.dto.UserSummaryDTO;
import com.eduflex.backend.model.*;
import com.eduflex.backend.model.CourseApplication;
import com.eduflex.backend.repository.CourseApplicationRepository;
import com.eduflex.backend.repository.CourseMaterialRepository;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.SkolverketCourseRepository;

import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.repository.AssignmentRepository;
import com.eduflex.backend.repository.SubmissionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final CourseMaterialRepository materialRepository;
    private final CourseApplicationRepository applicationRepository;
    private final com.eduflex.backend.repository.CourseEvaluationResponseRepository evaluationResponseRepository;
    private final SkolverketCourseRepository skolverketCourseRepository;

    private final com.eduflex.backend.repository.CourseResultRepository resultRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    private final StorageService storageService;

    public CourseService(CourseRepository courseRepository,
            UserRepository userRepository,
            CourseMaterialRepository materialRepository,
            CourseApplicationRepository applicationRepository,
            com.eduflex.backend.repository.CourseEvaluationResponseRepository evaluationResponseRepository,
            com.eduflex.backend.repository.CourseResultRepository resultRepository,
            AssignmentRepository assignmentRepository,
            SubmissionRepository submissionRepository,
            SkolverketCourseRepository skolverketCourseRepository,
            StorageService storageService) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.materialRepository = materialRepository;
        this.applicationRepository = applicationRepository;
        this.evaluationResponseRepository = evaluationResponseRepository;
        this.resultRepository = resultRepository;
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
        this.skolverketCourseRepository = skolverketCourseRepository;
        this.storageService = storageService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        backfillSlugs();
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
        course.setCategory(dto.category());
        course.setDescription(dto.description());
        if (dto.startDate() != null)
            course.setStartDate(dto.startDate().toString());
        if (dto.endDate() != null)
            course.setEndDate(dto.endDate().toString());
        course.setColor(dto.color() != null && !dto.color().isEmpty() ? dto.color() : "bg-indigo-600");
        course.setMaxStudents(dto.maxStudents() != null ? dto.maxStudents() : 30);

        // Link to Skolverket course if provided
        if (dto.skolverketCourseId() != null) {
            skolverketCourseRepository.findById(dto.skolverketCourseId()).ifPresent(course::setSkolverketCourse);
        }

        // Create Group Rooms
        if (dto.groupRooms() != null && !dto.groupRooms().isEmpty()) {
            for (java.util.Map<String, String> roomData : dto.groupRooms()) {
                if (roomData.get("name") != null) { // Modified: Link optional
                    GroupRoom room = new GroupRoom();
                    room.setName(roomData.get("name"));
                    room.setLink(roomData.get("link") != null ? roomData.get("link") : "");
                    room.setType(roomData.getOrDefault("type", "ZOOM"));
                    course.addGroupRoom(room);
                }
            }
        }

        course.setTeacher(teacher);
        course.setOpen(true);

        // Generate slug
        course.setSlug(generateUniqueSlug(course.getName()));

        return courseRepository.save(course);
    }

    private String generateUniqueSlug(String name) {
        if (name == null || name.isBlank()) {
            return UUID.randomUUID().toString().substring(0, 8);
        }

        String baseSlug = name.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");

        if (baseSlug.isBlank()) {
            return UUID.randomUUID().toString().substring(0, 8);
        }

        String slug = baseSlug;
        int count = 1;
        while (courseRepository.findBySlug(slug).isPresent()) {
            slug = baseSlug + "-" + count++;
        }
        return slug;
    }

    @Transactional
    public void backfillSlugs() {
        List<Course> courses = courseRepository.findAll();
        boolean changed = false;
        for (Course course : courses) {
            if (course.getSlug() == null || course.getSlug().isBlank()) {
                course.setSlug(generateUniqueSlug(course.getName()));
                courseRepository.save(course);
                changed = true;
            }
        }
        if (changed) {
            System.out.println("Backfilled slugs for existing courses.");
        }
    }

    @Transactional
    public CourseDTO updateCourse(Long id, Map<String, Object> updates) {
        Course course = getCourseById(id);

        if (updates.containsKey("name"))
            course.setName((String) updates.get("name"));
        if (updates.containsKey("courseCode"))
            course.setCourseCode((String) updates.get("courseCode"));
        if (updates.containsKey("category"))
            course.setCategory((String) updates.get("category"));
        if (updates.containsKey("description"))
            course.setDescription((String) updates.get("description"));
        if (updates.containsKey("startDate"))
            course.setStartDate((String) updates.get("startDate"));
        if (updates.containsKey("endDate"))
            course.setEndDate((String) updates.get("endDate"));
        if (updates.containsKey("color"))
            course.setColor((String) updates.get("color"));
        if (updates.containsKey("maxStudents"))
            course.setMaxStudents((Integer) updates.get("maxStudents"));

        // --- NYA FÄLT: DIGITALA RUM ---
        if (updates.containsKey("classroomLink"))
            course.setClassroomLink((String) updates.get("classroomLink"));
        if (updates.containsKey("classroomType"))
            course.setClassroomType((String) updates.get("classroomType"));
        if (updates.containsKey("examLink"))
            course.setExamLink((String) updates.get("examLink"));
        if (updates.containsKey("examType"))
            course.setExamType((String) updates.get("examType"));

        // Handle Group Rooms Update
        if (updates.containsKey("groupRooms")) {
            List<Map<String, String>> roomsData = (List<Map<String, String>>) updates.get("groupRooms");
            System.out.println("Updating group rooms for course " + id + ". Received: "
                    + (roomsData != null ? roomsData.size() : "null"));

            course.getGroupRooms().clear(); // Replace all
            if (roomsData != null) {
                for (Map<String, String> roomData : roomsData) {
                    if (roomData.get("name") != null) { // Modified: Link is optional now
                        GroupRoom room = new GroupRoom();
                        room.setName(roomData.get("name"));
                        room.setLink(roomData.get("link") != null ? roomData.get("link") : "");
                        room.setType(roomData.getOrDefault("type", "ZOOM"));
                        course.addGroupRoom(room);
                    }
                }
            }
        }
        // ------------------------------

        if (updates.containsKey("isOpen")) {
            Object openVal = updates.get("isOpen");
            if (openVal instanceof Boolean)
                course.setOpen((Boolean) openVal);
            else if (openVal instanceof String)
                course.setOpen(Boolean.parseBoolean((String) openVal));
        }

        // Rename slug if name changed? Usually better to keep it, but if explicitly
        // requested:
        if (updates.containsKey("slug")) {
            course.setSlug((String) updates.get("slug"));
        }

        return convertToDTO(courseRepository.save(course));
    }

    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }

    public Course saveCourse(Course course) {
        return courseRepository.save(course);
    }

    public void applyToCourse(Long courseId, Long studentId) {
        if (applicationRepository.findByCourseIdAndStudentId(courseId, studentId).isPresent())
            throw new RuntimeException("Redan ansökt.");
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
            if (c.getStudents().size() >= c.getMaxStudents())
                throw new RuntimeException("Fullt!");
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

    public CourseMaterial addMaterial(Long courseId, String title, String content, String link, String type,
            String availableFrom,
            MultipartFile file) throws IOException {
        Course course = getCourseById(courseId);
        CourseMaterial material = new CourseMaterial();
        material.setTitle(title);
        material.setContent(content);
        material.setLink(link);
        material.setType(CourseMaterial.MaterialType.valueOf(type));
        if (availableFrom != null && !availableFrom.isEmpty()) {
            material.setAvailableFrom(java.time.LocalDateTime.parse(availableFrom));
        }
        material.setCourse(course);
        if (file != null && !file.isEmpty()) {
            String storageId = storageService.save(file);
            material.setFileUrl("/api/storage/" + storageId);
            material.setFileName(file.getOriginalFilename());

            // Detect video files and set video-specific metadata
            if (isVideoFile(file.getOriginalFilename())) {
                material.setType(CourseMaterial.MaterialType.VIDEO);
                material.setVideoFileSize(file.getSize());
                material.setVideoStatus(CourseMaterial.VideoStatus.READY);
            }
        }
        return materialRepository.save(material);
    }

    /**
     * Check if a filename represents a video file
     */
    private boolean isVideoFile(String fileName) {
        if (fileName == null)
            return false;
        String lower = fileName.toLowerCase();
        return lower.endsWith(".mp4") || lower.endsWith(".webm") ||
                lower.endsWith(".mov") || lower.endsWith(".avi") ||
                lower.endsWith(".mkv") || lower.endsWith(".ogg");
    }

    public CourseMaterial updateMaterial(Long id, String title, String content, String link, String availableFrom,
            MultipartFile file)
            throws IOException {
        CourseMaterial material = materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material hittades inte"));
        if (title != null)
            material.setTitle(title);
        if (content != null)
            material.setContent(content);
        if (link != null)
            material.setLink(link);
        if (availableFrom != null && !availableFrom.isEmpty()) {
            material.setAvailableFrom(java.time.LocalDateTime.parse(availableFrom));
        } else if (availableFrom != null && availableFrom.isEmpty()) {
            material.setAvailableFrom(null);
        }
        if (file != null && !file.isEmpty()) {
            String storageId = storageService.save(file);
            material.setFileUrl("/api/storage/" + storageId);
            material.setFileName(file.getOriginalFilename());

            // Detect video files and set video-specific metadata
            if (isVideoFile(file.getOriginalFilename())) {
                material.setType(CourseMaterial.MaterialType.VIDEO);
                material.setVideoFileSize(file.getSize());
                material.setVideoStatus(CourseMaterial.VideoStatus.READY);
            }
        }
        return materialRepository.save(material);
    }

    public List<CourseMaterial> getMaterialsForCourse(Long courseId) {
        return materialRepository.findByCourseIdOrderBySortOrderAsc(courseId);
    }

    public void deleteMaterial(Long id) {
        materialRepository.deleteById(id);
    }

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
        if ("TEACHER".equals(user.getRole().getName())) {
            return courseRepository.findAll().stream().filter(c -> c.getTeacher().getId().equals(userId)).toList();
        } else {
            return courseRepository.findAll().stream().filter(c -> c.getStudents().contains(user)).toList();
        }
    }

    public List<CourseDTO> getCoursesForStudent(Long studentId) {
        return courseRepository.findByStudentsId(studentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<CourseDTO> getCoursesForTeacher(Long teacherId) {
        return courseRepository.findByTeacherId(teacherId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CourseEvaluation createEvaluation(Long courseId, CourseEvaluation evaluation) {
        Course course = getCourseById(courseId);
        evaluation.setCourse(course);
        course.setEvaluation(evaluation);
        courseRepository.save(course);
        return evaluation;
    }

    public void submitEvaluation(Long evaluationId, Long studentId, Map<Integer, String> answers) {
        if (evaluationResponseRepository.existsByEvaluationIdAndStudentId(evaluationId, studentId)) {
            throw new RuntimeException("Du har redan gjort denna utvärdering.");
        }

        CourseEvaluation evaluation = courseRepository.findAll().stream()
                .filter(c -> c.getEvaluation() != null && c.getEvaluation().getId().equals(evaluationId))
                .findFirst().map(Course::getEvaluation).orElseThrow(() -> new RuntimeException("Utvärdering saknas"));

        User student = userRepository.findById(studentId).orElseThrow();

        CourseEvaluationResponse response = new CourseEvaluationResponse();
        response.setEvaluation(evaluation);
        response.setStudent(student);
        response.setAnswers(answers);
        response.setSubmittedAt(java.time.LocalDateTime.now());

        evaluationResponseRepository.save(response);
    }

    public void setCourseResult(Long courseId, Long studentId, String statusStr) {
        CourseResult result = resultRepository.findByCourseIdAndStudentId(courseId, studentId)
                .orElse(new CourseResult());

        if (result.getId() == null) {
            result.setCourse(getCourseById(courseId));
            result.setStudent(userRepository.findById(studentId).orElseThrow());
        }

        try {
            result.setStatus(CourseResult.Status.valueOf(statusStr.toUpperCase()));
            result.setGradedAt(java.time.LocalDateTime.now());
            resultRepository.save(result);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Ogiltig status. Använd 'PASSED', 'FAILED' eller 'PENDING'.");
        }
    }

    public CourseResult getCourseResult(Long courseId, Long studentId) {
        return resultRepository.findByCourseIdAndStudentId(courseId, studentId).orElse(null);
    }

    public List<CourseResult> getStudentResults(Long studentId) {
        return resultRepository.findByStudentId(studentId);
    }

    public boolean validateCompletion(Long courseId, Long studentId) {
        List<Assignment> assignments = assignmentRepository.findByCourseId(courseId);
        if (assignments.isEmpty())
            return true;

        List<Submission> submissions = submissionRepository.findByStudentId(studentId);

        long completedCount = assignments.stream().filter(a -> submissions.stream().anyMatch(
                s -> s.getAssignment().getId().equals(a.getId()) && s.getStatus() != Submission.Status.RETURNED))
                .count();

        return completedCount == assignments.size();
    }

    public void claimCertificate(Long courseId, Long studentId) {
        if (!validateCompletion(courseId, studentId)) {
            throw new RuntimeException("Du har inte slutfört alla uppgifter än.");
        }
        setCourseResult(courseId, studentId, "PASSED");
    }

    private CourseDTO convertToDTO(Course c) {
        UserSummaryDTO teacherDTO = null;
        if (c.getTeacher() != null) {
            teacherDTO = new UserSummaryDTO(
                    c.getTeacher().getId(),
                    c.getTeacher().getFullName(),
                    c.getTeacher().getUsername(),
                    c.getTeacher().getRole().getName());
        }
        List<UserSummaryDTO> studentDTOs = c.getStudents().stream()
                .map(s -> new UserSummaryDTO(s.getId(), s.getFullName(), s.getUsername(), s.getRole().getName()))
                .collect(Collectors.toList());

        return new CourseDTO(
                c.getId(), c.getName(), c.getCourseCode(), c.getCategory(), c.getDescription(),
                c.getStartDate(), c.getEndDate(), c.getColor(), teacherDTO, studentDTOs,
                c.isOpen(), c.getEvaluation(), c.getMaxStudents(), c.getStudents().size(),
                c.getClassroomLink(), c.getClassroomType(), c.getExamLink(), // Nya fält
                c.getSlug(), // New slug field
                c.getSkolverketCourse(), // Include Skolverket course data
                c.getGroupRooms() // Include Group Rooms
        );
    }
}