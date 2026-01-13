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

    private String category;

    @Column(length = 5000)
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
    // ------------------------------

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
}