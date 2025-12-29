package com.eduflex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String courseCode;

    @Column(length = 1000)
    private String description;

    private String startDate;
    private String endDate;

    private String color;

    private boolean isOpen = true;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    @JsonIgnoreProperties({"courses", "coursesCreated", "documents", "submissions"}) // STOPPAR LOOPEN
    private User teacher;

    @ManyToMany
    @JoinTable(
            name = "course_students",
            joinColumns = @JoinColumn(name = "course_id"),
            inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    @JsonIgnoreProperties("courses") // STOPPAR LOOPEN
    private Set<User> students = new HashSet<>();

    @OneToOne(mappedBy = "course", cascade = CascadeType.ALL)
    private CourseEvaluation evaluation;

    // --- GETTERS & SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public boolean isOpen() { return isOpen; }
    public void setOpen(boolean open) { isOpen = open; }

    public User getTeacher() { return teacher; }
    public void setTeacher(User teacher) { this.teacher = teacher; }

    public Set<User> getStudents() { return students; }
    public void setStudents(Set<User> students) { this.students = students; }

    public CourseEvaluation getEvaluation() { return evaluation; }
    public void setEvaluation(CourseEvaluation evaluation) { this.evaluation = evaluation; }
}