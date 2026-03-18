package com.eduflex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "education_programs")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class EducationProgram implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String category;
    @Column(name = "sun_code")
    private String sunCode;
    @Column(name = "is_open")
    private boolean isOpen = true;
    @Column(name = "requires_lia", nullable = false, columnDefinition = "boolean default false")
    private boolean requiresLia = false;
    @Column(name = "total_credits")
    private Integer totalCredits;
    @Column(name = "job_tech_skills", columnDefinition = "TEXT")
    private String jobTechSkills; // Matched skills for the entire program

    @ManyToMany
    @JoinTable(name = "program_courses", joinColumns = @JoinColumn(name = "program_id"), inverseJoinColumns = @JoinColumn(name = "course_id"))
    @JsonIgnoreProperties("educationPrograms")
    private Set<Course> courses = new HashSet<>();

    public EducationProgram() {
    }

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

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSunCode() {
        return sunCode;
    }

    public void setSunCode(String sunCode) {
        this.sunCode = sunCode;
    }

    public boolean isOpen() {
        return isOpen;
    }

    public void setOpen(boolean open) {
        isOpen = open;
    }

    public boolean isRequiresLia() {
        return requiresLia;
    }

    public void setRequiresLia(boolean requiresLia) {
        this.requiresLia = requiresLia;
    }

    public Integer getTotalCredits() {
        return totalCredits;
    }

    public void setTotalCredits(Integer totalCredits) {
        this.totalCredits = totalCredits;
    }

    public String getJobTechSkills() {
        return jobTechSkills;
    }

    public void setJobTechSkills(String jobTechSkills) {
        this.jobTechSkills = jobTechSkills;
    }

    public Set<Course> getCourses() {
        return courses;
    }

    public void setCourses(Set<Course> courses) {
        this.courses = courses;
    }

    public void addCourse(Course course) {
        this.courses.add(course);
    }

    public void removeCourse(Course course) {
        this.courses.remove(course);
    }
}
