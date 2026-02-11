package com.eduflex.backend.model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "programs")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Program implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @OneToMany(mappedBy = "program", cascade = CascadeType.ALL)
    @JsonIgnore
    private Set<ClassGroup> classes = new HashSet<>();

    public Program() {
    }

    public Program(String name, String description, Department department) {
        this.name = name;
        this.description = description;
        this.department = department;
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

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public Set<ClassGroup> getClasses() {
        return classes;
    }

    public void setClasses(Set<ClassGroup> classes) {
        this.classes = classes;
    }

    // Convenience for API
    public Long getDepartmentId() {
        return department != null ? department.getId() : null;
    }

    public void setDepartmentId(Long departmentId) {
        if (departmentId == null) {
            this.department = null;
        } else {
            this.department = new Department();
            this.department.setId(departmentId);
        }
    }
}
