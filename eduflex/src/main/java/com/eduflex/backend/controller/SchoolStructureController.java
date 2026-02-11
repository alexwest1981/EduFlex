package com.eduflex.backend.controller;

import com.eduflex.backend.model.ClassGroup;
import com.eduflex.backend.model.Department;
import com.eduflex.backend.model.Program;
import com.eduflex.backend.service.SchoolStructureService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/structure")
public class SchoolStructureController {

    private final SchoolStructureService schoolStructureService;

    public SchoolStructureController(SchoolStructureService schoolStructureService) {
        this.schoolStructureService = schoolStructureService;
    }

    // --- Departments ---
    @GetMapping("/departments")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR')")
    public ResponseEntity<List<Department>> getAllDepartments() {
        return ResponseEntity.ok(schoolStructureService.getAllDepartments());
    }

    @PostMapping("/departments")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR')")
    public ResponseEntity<Department> createDepartment(@RequestBody Department department) {
        return ResponseEntity.ok(schoolStructureService.saveDepartment(department));
    }

    @DeleteMapping("/departments/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR')")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        schoolStructureService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }

    // --- Programs ---
    @GetMapping("/programs")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR')")
    public ResponseEntity<List<Program>> getProgramsByDepartment(@RequestParam Long departmentId) {
        return ResponseEntity.ok(schoolStructureService.getProgramsByDepartment(departmentId));
    }

    @PostMapping("/programs")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR')")
    public ResponseEntity<Program> createProgram(@RequestBody Program program) {
        return ResponseEntity.ok(schoolStructureService.saveProgram(program));
    }

    @DeleteMapping("/programs/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR')")
    public ResponseEntity<Void> deleteProgram(@PathVariable Long id) {
        schoolStructureService.deleteProgram(id);
        return ResponseEntity.noContent().build();
    }

    // --- ClassGroups ---
    @GetMapping("/classes")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR')")
    public ResponseEntity<List<ClassGroup>> getClassesByProgram(@RequestParam Long programId) {
        return ResponseEntity.ok(schoolStructureService.getClassesByProgram(programId));
    }

    @PostMapping("/classes")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR')")
    public ResponseEntity<ClassGroup> createClassGroup(@RequestBody ClassGroup classGroup) {
        return ResponseEntity.ok(schoolStructureService.saveClassGroup(classGroup));
    }

    @PutMapping("/classes/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR')")
    public ResponseEntity<ClassGroup> updateClassGroup(@PathVariable Long id, @RequestBody ClassGroup classGroup) {
        return ResponseEntity.ok(schoolStructureService.updateClassGroup(id, classGroup));
    }

    @DeleteMapping("/classes/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR')")
    public ResponseEntity<Void> deleteClassGroup(@PathVariable Long id) {
        schoolStructureService.deleteClassGroup(id);
        return ResponseEntity.noContent().build();
    }

    // --- Class Student Management ---
    @GetMapping("/classes/{id}/students")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR')")
    public ResponseEntity<List<com.eduflex.backend.model.User>> getStudentsInClass(@PathVariable Long id) {
        return ResponseEntity.ok(schoolStructureService.getStudentsInClass(id));
    }

    @PostMapping("/classes/{id}/students/{studentId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR')")
    public ResponseEntity<Void> addStudentToClass(@PathVariable Long id, @PathVariable Long studentId) {
        schoolStructureService.addStudentToClass(id, studentId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/classes/{id}/students/{studentId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR')")
    public ResponseEntity<Void> removeStudentFromClass(@PathVariable Long id, @PathVariable Long studentId) {
        schoolStructureService.removeStudentFromClass(studentId);
        return ResponseEntity.ok().build();
    }

    // --- Class Teacher Management ---
    @GetMapping("/classes/{id}/teachers")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR')")
    public ResponseEntity<List<com.eduflex.backend.model.User>> getTeachersInClass(@PathVariable Long id) {
        return ResponseEntity.ok(schoolStructureService.getTeachersInClass(id));
    }

    @PostMapping("/classes/{id}/teachers/{teacherId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR')")
    public ResponseEntity<Void> addTeacherToClass(@PathVariable Long id, @PathVariable Long teacherId) {
        schoolStructureService.addTeacherToClass(id, teacherId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/classes/{id}/teachers/{teacherId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR')")
    public ResponseEntity<Void> removeTeacherFromClass(@PathVariable Long id, @PathVariable Long teacherId) {
        schoolStructureService.removeTeacherFromClass(id, teacherId);
        return ResponseEntity.ok().build();
    }
}
