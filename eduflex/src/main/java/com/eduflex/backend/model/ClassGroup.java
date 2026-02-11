package com.eduflex.backend.model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "class_groups")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class ClassGroup implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // e.g. "TE22A"

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id")
    private Program program;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id")
    private User mentor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "main_teacher_id")
    private User mainTeacher;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "class_group_teachers",
        joinColumns = @JoinColumn(name = "class_group_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "classGroup", "courses", "coursesCreated" })
    private Set<User> teachers = new HashSet<>();

    public ClassGroup() {
    }

    public ClassGroup(String name, String description, Program program) {
        this.name = name;
        this.description = description;
        this.program = program;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Program getProgram() {
        return program;
    }

    public void setProgram(Program program) {
        this.program = program;
    }

    public User getMentor() {
        return mentor;
    }

    public void setMentor(User mentor) {
        this.mentor = mentor;
    }

    public User getMainTeacher() {
        return mainTeacher;
    }

    public void setMainTeacher(User mainTeacher) {
        this.mainTeacher = mainTeacher;
    }

    public Set<User> getTeachers() {
        return teachers;
    }

    public void setTeachers(Set<User> teachers) {
        this.teachers = teachers;
    }

    // Convenience for API
    public Long getMentorId() {
        return mentor != null ? mentor.getId() : null;
    }

    public void setMentorId(Long mentorId) {
        if (mentorId == null) {
            this.mentor = null;
        } else {
            this.mentor = new User();
            this.mentor.setId(mentorId);
        }
    }

    public Long getMainTeacherId() {
        return mainTeacher != null ? mainTeacher.getId() : null;
    }

    public void setMainTeacherId(Long mainTeacherId) {
        if (mainTeacherId == null) {
            this.mainTeacher = null;
        } else {
            this.mainTeacher = new User();
            this.mainTeacher.setId(mainTeacherId);
        }
    }

    // Program convenience
    public Long getProgramId() {
        return program != null ? program.getId() : null;
    }

    public void setProgramId(Long programId) {
        if (programId == null) {
            this.program = null;
        } else {
            this.program = new Program();
            this.program.setId(programId);
        }
    }
}
