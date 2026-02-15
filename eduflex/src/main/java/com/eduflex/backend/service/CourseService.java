package com.eduflex.backend.service;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.context.ApplicationEventPublisher;
import com.eduflex.backend.event.CourseResultGradedEvent;
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
import com.eduflex.backend.repository.SkolverketGradingCriteriaRepository;
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
    private final SkolverketGradingCriteriaRepository gradingCriteriaRepository;
    private final SkolverketApiClientService skolverketApiClient;

    private final com.eduflex.backend.repository.CourseResultRepository resultRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final com.eduflex.backend.repository.UserLessonProgressRepository userLessonProgressRepository;
    private final com.eduflex.backend.repository.StudentActivityLogRepository studentActivityLogRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    private final StorageService storageService;
    private final LicenseService licenseService;
    private final ApplicationEventPublisher eventPublisher;

    public CourseService(CourseRepository courseRepository,
            UserRepository userRepository,
            CourseMaterialRepository materialRepository,
            CourseApplicationRepository applicationRepository,
            com.eduflex.backend.repository.CourseEvaluationResponseRepository evaluationResponseRepository,
            com.eduflex.backend.repository.CourseResultRepository resultRepository,
            AssignmentRepository assignmentRepository,
            SubmissionRepository submissionRepository,
            SkolverketCourseRepository skolverketCourseRepository,
            SkolverketGradingCriteriaRepository gradingCriteriaRepository,
            SkolverketApiClientService skolverketApiClient,
            StorageService storageService,
            LicenseService licenseService,
            com.eduflex.backend.repository.UserLessonProgressRepository userLessonProgressRepository,
            com.eduflex.backend.repository.StudentActivityLogRepository studentActivityLogRepository,
            ApplicationEventPublisher eventPublisher) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.materialRepository = materialRepository;
        this.applicationRepository = applicationRepository;
        this.evaluationResponseRepository = evaluationResponseRepository;
        this.resultRepository = resultRepository;
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
        this.skolverketCourseRepository = skolverketCourseRepository;
        this.gradingCriteriaRepository = gradingCriteriaRepository;
        this.skolverketApiClient = skolverketApiClient;
        this.storageService = storageService;
        this.licenseService = licenseService;
        this.userLessonProgressRepository = userLessonProgressRepository;
        this.studentActivityLogRepository = studentActivityLogRepository;
        this.eventPublisher = eventPublisher;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        backfillSlugs();
    }

    // ... imports

    @org.springframework.cache.annotation.Cacheable("courses")
    public List<CourseDTO> getAllCourseDTOs() {
        return courseRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @org.springframework.cache.annotation.Cacheable(value = "course_details", key = "#id")
    public CourseDTO getCourseDTOById(Long id) {
        Course course = courseRepository.findById(id).orElseThrow(() -> new RuntimeException("Kurs ej funnen"));
        return convertToDTO(course);
    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id).orElseThrow(() -> new RuntimeException("Kurs ej funnen"));
    }

    @org.springframework.cache.annotation.CacheEvict(value = "courses", allEntries = true)
    public Course createCourse(CreateCourseDTO dto, Long teacherId) {
        // ... (existing code implementation)
        // ...
        // ...

        // --- HIDDEN LICENSE TRAP ---
        if (licenseService != null && !licenseService.isValid()) {
            throw new RuntimeException("Ett internt fel uppstod vid validering av resurser (Error: 0xSEC-C01).");
        }
        // ---------------------------

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

        // Link to Skolverket course if provided + fetch rich data from API
        if (dto.skolverketCourseId() != null) {
            skolverketCourseRepository.findById(dto.skolverketCourseId()).ifPresent(skCourse -> {
                course.setSkolverketCourse(skCourse);
                enrichSkolverketCourse(skCourse, course);
            });
        } else if (course.getCourseCode() != null && !course.getCourseCode().isBlank()) {
            // Automatically try to link by course code if ID not provided (manual entry)
            skolverketCourseRepository.findByCourseCode(course.getCourseCode()).ifPresent(skCourse -> {
                course.setSkolverketCourse(skCourse);
                enrichSkolverketCourse(skCourse, course);
            });
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

    /**
     * Fetch rich data from Skolverket API and enrich a SkolverketCourse with
     * criteria, central content etc. Also links the EduFlex Course to the
     * best individual course (the one that has criteria).
     */
    @SuppressWarnings("unchecked")
    private void enrichSkolverketCourse(SkolverketCourse skCourse, Course course) {
        try {
            String initialCode = skCourse.getCourseCode();
            Object apiResponse = skolverketApiClient.getSubject(initialCode);

            // If the direct code fails (it's a course code, not a subject), try the subject
            // name
            if (apiResponse instanceof java.util.Map) {
                java.util.Map<String, Object> data = (java.util.Map<String, Object>) apiResponse;
                if (data.containsKey("error")) {
                    // courseCode might be a subject code or a course code — try common prefixes
                    if (initialCode.length() >= 3) {
                        String subjectPrefix = initialCode.substring(0, 3);
                        apiResponse = skolverketApiClient.getSubject(subjectPrefix);
                        if (apiResponse instanceof java.util.Map) {
                            data = (java.util.Map<String, Object>) apiResponse;
                            if (data.containsKey("error"))
                                return;
                        } else {
                            return;
                        }
                    } else {
                        return;
                    }
                }

                java.util.Map<String, Object> subjectData = (java.util.Map<String, Object>) data.get("subject");
                if (subjectData == null)
                    return;

                // Update skCourse with API data if missing
                if (skCourse.getDescription() == null || skCourse.getDescription().isEmpty()) {
                    skCourse.setDescription((String) subjectData.get("description"));
                }

                // Copy description to course if course description is missing
                if (course.getDescription() == null || course.getDescription().isBlank()) {
                    course.setDescription(skCourse.getDescription());
                }

                if (skCourse.getSubjectPurpose() == null || skCourse.getSubjectPurpose().isEmpty()) {
                    skCourse.setSubjectPurpose((String) subjectData.get("purpose"));
                }
                if (skCourse.getEnglishTitle() == null || skCourse.getEnglishTitle().isEmpty()) {
                    skCourse.setEnglishTitle((String) subjectData.get("englishName"));
                }

                // Parse individual courses and find the one matching our courseCode
                java.util.List<java.util.Map<String, Object>> courses = (java.util.List<java.util.Map<String, Object>>) subjectData
                        .get("courses");
                if (courses != null) {
                    for (java.util.Map<String, Object> apiCourse : courses) {
                        String courseCode = (String) apiCourse.get("code");
                        if (courseCode == null)
                            continue;

                        // Find or create the individual SkolverketCourse
                        SkolverketCourse skIndividual = skolverketCourseRepository
                                .findByCourseCode(courseCode)
                                .orElseGet(() -> {
                                    SkolverketCourse sc = new SkolverketCourse();
                                    sc.setCourseCode(courseCode);
                                    sc.setCourseName((String) apiCourse.get("name"));
                                    sc.setSubject(skCourse.getSubject());
                                    return sc;
                                });

                        // Parse points
                        Object pointsObj = apiCourse.get("points");
                        if (pointsObj != null) {
                            try {
                                skIndividual.setPoints(Integer.parseInt(pointsObj.toString().trim()));
                            } catch (NumberFormatException ignored) {
                            }
                        }

                        skIndividual.setDescription((String) apiCourse.get("description"));
                        skIndividual.setEnglishTitle((String) apiCourse.get("englishName"));
                        skIndividual.setSubjectPurpose((String) subjectData.get("purpose"));

                        java.util.Map<String, Object> centralContent = (java.util.Map<String, Object>) apiCourse
                                .get("centralContent");
                        if (centralContent != null) {
                            skIndividual.setObjectives((String) centralContent.get("text"));
                        }

                        skolverketCourseRepository.save(skIndividual);

                        // Save knowledge requirements (betygskriterier)
                        java.util.List<java.util.Map<String, Object>> knowledgeReqs = (java.util.List<java.util.Map<String, Object>>) apiCourse
                                .get("knowledgeRequirements");
                        if (knowledgeReqs != null && !knowledgeReqs.isEmpty()) {
                            gradingCriteriaRepository.deleteByCourse(skIndividual);

                            java.util.Map<String, Integer> gradeOrder = java.util.Map.of(
                                    "E", 1, "D", 2, "C", 3, "B", 4, "A", 5);

                            for (java.util.Map<String, Object> req : knowledgeReqs) {
                                String gradeStep = (String) req.get("gradeStep");
                                String text = (String) req.get("text");
                                if (gradeStep == null || text == null)
                                    continue;

                                SkolverketGradingCriteria criteria = new SkolverketGradingCriteria(
                                        skIndividual, gradeStep, text,
                                        gradeOrder.getOrDefault(gradeStep, 0));
                                gradingCriteriaRepository.save(criteria);
                            }
                        }

                        // If this individual course matches the selected one, link it
                        if (courseCode.equals(skCourse.getCourseCode())) {
                            course.setSkolverketCourse(skIndividual);
                        }
                    }

                    // If the selected skCourse was the subject code (not a course code),
                    // link to the first individual course instead
                    if (course.getSkolverketCourse() == skCourse && !courses.isEmpty()) {
                        String firstCode = (String) courses.get(0).get("code");
                        if (firstCode != null) {
                            skolverketCourseRepository.findByCourseCode(firstCode)
                                    .ifPresent(sk -> {
                                        course.setSkolverketCourse(sk);
                                        if (course.getDescription() == null || course.getDescription().isBlank()) {
                                            course.setDescription(sk.getDescription());
                                        }
                                    });
                        }
                    }
                }

                // Final check to sync description if still missing
                if ((course.getDescription() == null || course.getDescription().isBlank())
                        && skCourse.getDescription() != null) {
                    course.setDescription(skCourse.getDescription());
                }

                skolverketCourseRepository.save(skCourse);
            }
        } catch (Exception e) {
            System.err.println("Failed to enrich Skolverket course: " + e.getMessage());
        }
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
    @org.springframework.cache.annotation.CacheEvict(value = { "courses", "course_details" }, allEntries = true)
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

        if (updates.containsKey("teacherId")) {
            Object tId = updates.get("teacherId");
            if (tId != null && !tId.toString().isEmpty()) {
                try {
                    // Handle potential decimal strings from Double serialization (e.g. "2.0")
                    long teacherId = (long) Double.parseDouble(tId.toString());
                    User teacher = userRepository.findById(teacherId)
                            .orElseThrow(() -> new RuntimeException("Teacher not found: " + teacherId));
                    course.setTeacher(teacher);
                } catch (NumberFormatException e) {
                    System.err.println("Invalid teacherId format: " + tId);
                }
            }
        }

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

    @org.springframework.cache.annotation.CacheEvict(value = { "courses", "course_details" }, allEntries = true)
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
            MultipartFile file,
            Integer difficulty,
            Integer estimatedTime,
            Long prerequisiteId) throws IOException {
        Course course = getCourseById(courseId);
        CourseMaterial material = new CourseMaterial();
        material.setTitle(title);
        material.setContent(content);
        material.setLink(link);
        material.setType(CourseMaterial.MaterialType.valueOf(type));
        if (availableFrom != null && !availableFrom.isEmpty()) {
            try {
                material.setAvailableFrom(java.time.LocalDateTime.parse(availableFrom,
                        java.time.format.DateTimeFormatter
                                .ofPattern("[yyyy-MM-dd'T'HH:mm[:ss]][yyyy-MM-dd HH:mm[:ss]]")));
            } catch (Exception e) {
                System.err.println("Could not parse date: " + availableFrom + ". Error: " + e.getMessage());
            }
        }
        material.setCourse(course);
        if (file != null && !file.isEmpty()) {
            String storageId = storageService.save(file);
            material.setFileUrl("/api/storage/" + storageId);
            material.setFileName(file.getOriginalFilename());

            if (isVideoFile(file.getOriginalFilename())) {
                material.setType(CourseMaterial.MaterialType.VIDEO);
                material.setVideoFileSize(file.getSize());
                material.setVideoStatus(CourseMaterial.VideoStatus.READY);
            }
        }

        if (difficulty != null)
            material.setDifficultyLevel(difficulty);
        if (estimatedTime != null)
            material.setEstimatedTimeMinutes(estimatedTime);
        if (prerequisiteId != null) {
            material.setPrerequisiteMaterial(materialRepository.findById(prerequisiteId).orElse(null));
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
            MultipartFile file,
            Integer difficulty,
            Integer estimatedTime,
            Long prerequisiteId)
            throws IOException {
        CourseMaterial material = materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material hittades inte"));
        if (title != null)
            material.setTitle(title);
        if (content != null)
            material.setContent(content);
        if (link != null)
            material.setLink(link);
        if (availableFrom != null) {
            if (availableFrom.isEmpty()) {
                material.setAvailableFrom(null);
            } else {
                try {
                    material.setAvailableFrom(java.time.LocalDateTime.parse(availableFrom,
                            java.time.format.DateTimeFormatter
                                    .ofPattern("[yyyy-MM-dd'T'HH:mm[:ss]][yyyy-MM-dd HH:mm[:ss]]")));
                } catch (Exception e) {
                    System.err.println("Could not parse date in update: " + availableFrom);
                }
            }
        }
        if (file != null && !file.isEmpty()) {
            String storageId = storageService.save(file);
            material.setFileUrl("/api/storage/" + storageId);
            material.setFileName(file.getOriginalFilename());

            if (isVideoFile(file.getOriginalFilename())) {
                material.setType(CourseMaterial.MaterialType.VIDEO);
                material.setVideoFileSize(file.getSize());
                material.setVideoStatus(CourseMaterial.VideoStatus.READY);
            }
        }

        if (difficulty != null)
            material.setDifficultyLevel(difficulty);
        if (estimatedTime != null)
            material.setEstimatedTimeMinutes(estimatedTime);
        if (prerequisiteId != null) {
            material.setPrerequisiteMaterial(materialRepository.findById(prerequisiteId).orElse(null));
        }

        return materialRepository.save(material);
    }

    public List<CourseMaterial> getMaterialsForCourse(Long courseId) {
        return materialRepository.findByCourseIdOrderBySortOrderAsc(courseId);
    }

    public CourseMaterial getMaterialById(Long id) {
        return materialRepository.findById(id).orElseThrow(() -> new RuntimeException("Material hittades inte: " + id));
    }

    @Transactional
    public void deleteMaterial(Long id) {
        // Ta bort beroenden först
        userLessonProgressRepository.deleteByMaterialId(id);
        studentActivityLogRepository.deleteByMaterialId(id);
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
            CourseResult saved = resultRepository.save(result);

            // Publish event for automatic document generation
            eventPublisher.publishEvent(new CourseResultGradedEvent(saved));

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

    public CourseDTO convertToDTO(Course c) {
        UserSummaryDTO teacherDTO = null;
        if (c.getTeacher() != null) {
            teacherDTO = new UserSummaryDTO(
                    c.getTeacher().getId(),
                    c.getTeacher().getFirstName(),
                    c.getTeacher().getLastName(),
                    c.getTeacher().getFullName(),
                    c.getTeacher().getUsername(),
                    c.getTeacher().getRole().getName(),
                    c.getTeacher().getProfilePictureUrl());
        }
        List<UserSummaryDTO> studentDTOs = c.getStudents().stream()
                .map(s -> new UserSummaryDTO(
                        s.getId(),
                        s.getFirstName(),
                        s.getLastName(),
                        s.getFullName(),
                        s.getUsername(),
                        s.getRole().getName(),
                        s.getProfilePictureUrl()))
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