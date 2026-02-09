package com.eduflex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "courses")
@EntityListeners(com.eduflex.backend.service.AuditListener.class)
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String courseCode;

    @Column(unique = true)
    private String slug;

    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String startDate;
    private String endDate;

    private String color;

    private boolean isOpen = true;

    // --- NYA FÄLT: DIGITALA RUM ---
    private String classroomLink; // URL till mötet
    private String classroomType; // T.ex. "ZOOM", "TEAMS", "MEET"

    private String examLink; // URL till tentarum
    private String examType; // T.ex. "ZOOM", "INSPO"

    @Column(columnDefinition = "TEXT")
    private String tags; // Comma-separated tags for AI context (e.g. "Math, Algebra, Linear Equations")

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private java.util.List<GroupRoom> groupRooms = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private java.util.List<CourseMaterial> materials = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private java.util.List<Lesson> lessons = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private java.util.List<Assignment> assignments = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private java.util.List<Quiz> quizzes = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private java.util.List<CalendarEvent> calendarEvents = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private java.util.List<ScormPackage> scormPackages = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private java.util.List<Cmi5Package> cmi5Packages = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private java.util.List<ForumCategory> forumCategories = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private java.util.List<StudentActivityLog> activityLogs = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private java.util.List<CourseApplication> courseApplications = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private java.util.List<CourseResult> courseResults = new java.util.ArrayList<>();

    public java.util.List<GroupRoom> getGroupRooms() {
        return groupRooms;
    }

    public void setGroupRooms(java.util.List<GroupRoom> groupRooms) {
        this.groupRooms = groupRooms;
        // Helper to maintain bi-directional relationship
        if (groupRooms != null) {
            for (GroupRoom room : groupRooms) {
                room.setCourse(this);
            }
        }
    }

    public void addGroupRoom(GroupRoom room) {
        groupRooms.add(room);
        room.setCourse(this);
    }

    public void removeGroupRoom(GroupRoom room) {
        groupRooms.remove(room);
        room.setCourse(null);
    }

    @Column(columnDefinition = "integer default 100")
    private Integer maxStudents = 100;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    @JsonIgnoreProperties({ "courses", "coursesCreated", "documents", "submissions", "password", "roles",
            "hibernateLazyInitializer", "handler" })
    private User teacher;

    @ManyToMany
    @JoinTable(name = "course_students", joinColumns = @JoinColumn(name = "course_id"), inverseJoinColumns = @JoinColumn(name = "student_id"))
    @JsonIgnore
    private Set<User> students = new HashSet<>();

    @OneToOne(mappedBy = "course", cascade = CascadeType.ALL)
    private CourseEvaluation evaluation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_group_id")
    private ClassGroup classGroup;

    @ManyToOne
    @JoinColumn(name = "skolverket_course_id")
    @JsonIgnoreProperties("createdAt")
    private SkolverketCourse skolverketCourse;

    // --- GETTERS & SETTERS ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public boolean isOpen() {
        return isOpen;
    }

    public void setOpen(boolean open) {
        isOpen = open;
    }

    public String getClassroomLink() {
        return classroomLink;
    }

    public void setClassroomLink(String classroomLink) {
        this.classroomLink = classroomLink;
    }

    public String getClassroomType() {
        return classroomType;
    }

    public void setClassroomType(String classroomType) {
        this.classroomType = classroomType;
    }

    public String getExamLink() {
        return examLink;
    }

    public void setExamLink(String examLink) {
        this.examLink = examLink;
    }

    public String getExamType() {
        return examType;
    }

    public void setExamType(String examType) {
        this.examType = examType;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public Integer getMaxStudents() {
        return maxStudents;
    }

    public void setMaxStudents(Integer maxStudents) {
        this.maxStudents = maxStudents;
    }

    public User getTeacher() {
        return teacher;
    }

    public void setTeacher(User teacher) {
        this.teacher = teacher;
    }

    public Set<User> getStudents() {
        return students;
    }

    public void setStudents(Set<User> students) {
        this.students = students;
    }

    public CourseEvaluation getEvaluation() {
        return evaluation;
    }

    public void setEvaluation(CourseEvaluation evaluation) {
        this.evaluation = evaluation;
    }

    public SkolverketCourse getSkolverketCourse() {
        return skolverketCourse;
    }

    public void setSkolverketCourse(SkolverketCourse skolverketCourse) {
        this.skolverketCourse = skolverketCourse;
    }

    public java.util.List<CourseMaterial> getMaterials() {
        return materials;
    }

    public void setMaterials(java.util.List<CourseMaterial> materials) {
        this.materials = materials;
    }

    public java.util.List<Lesson> getLessons() {
        return lessons;
    }

    public void setLessons(java.util.List<Lesson> lessons) {
        this.lessons = lessons;
    }

    public java.util.List<Assignment> getAssignments() {
        return assignments;
    }

    public void setAssignments(java.util.List<Assignment> assignments) {
        this.assignments = assignments;
    }

    public java.util.List<Quiz> getQuizzes() {
        return quizzes;
    }

    public void setQuizzes(java.util.List<Quiz> quizzes) {
        this.quizzes = quizzes;
    }

    public java.util.List<CalendarEvent> getCalendarEvents() {
        return calendarEvents;
    }

    public void setCalendarEvents(java.util.List<CalendarEvent> calendarEvents) {
        this.calendarEvents = calendarEvents;
    }

    public java.util.List<ScormPackage> getScormPackages() {
        return scormPackages;
    }

    public void setScormPackages(java.util.List<ScormPackage> scormPackages) {
        this.scormPackages = scormPackages;
    }

    public java.util.List<Cmi5Package> getCmi5Packages() {
        return cmi5Packages;
    }

    public void setCmi5Packages(java.util.List<Cmi5Package> cmi5Packages) {
        this.cmi5Packages = cmi5Packages;
    }

    public java.util.List<ForumCategory> getForumCategories() {
        return forumCategories;
    }

    public void setForumCategories(java.util.List<ForumCategory> forumCategories) {
        this.forumCategories = forumCategories;
    }

    public java.util.List<StudentActivityLog> getActivityLogs() {
        return activityLogs;
    }

    public void setActivityLogs(java.util.List<StudentActivityLog> activityLogs) {
        this.activityLogs = activityLogs;
    }

    public java.util.List<CourseApplication> getCourseApplications() {
        return courseApplications;
    }

    public void setCourseApplications(java.util.List<CourseApplication> courseApplications) {
        this.courseApplications = courseApplications;
    }

    public java.util.List<CourseResult> getCourseResults() {
        return courseResults;
    }

    public void setCourseResults(java.util.List<CourseResult> courseResults) {
        this.courseResults = courseResults;
    }
}