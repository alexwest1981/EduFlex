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
@RequestMapping("/api")
public class SchoolStructureController {

    private final SchoolStructureService schoolStructureService;

    public SchoolStructureController(SchoolStructureService schoolStructureService) {
        this.schoolStructureService = schoolStructureService;
    }

    // --- Departments ---
    // Mapped to both /admin/structure/departments AND /principal/structure/departments to support both roles/paths
    @GetMapping({"/admin/structure/departments", "/principal/structure/departments"})
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'PRINCIPAL', 'ROLE_PRINCIPAL')")
    public ResponseEntity<List<Department>> getAllDepartments() {
        return ResponseEntity.ok(schoolStructureService.getAllDepartments());
    }

    @PostMapping({"/admin/structure/departments", "/principal/structure/departments"})
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'PRINCIPAL', 'ROLE_PRINCIPAL')")
    public ResponseEntity<Department> createDepartment(@RequestBody Department department) {
        return ResponseEntity.ok(schoolStructureService.saveDepartment(department));
    }

    @DeleteMapping({"/admin/structure/departments/{id}", "/principal/structure/departments/{id}"})
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'PRINCIPAL', 'ROLE_PRINCIPAL')")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        schoolStructureService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }

    // --- Programs ---
    @GetMapping({"/admin/structure/programs", "/principal/structure/programs"})
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'PRINCIPAL', 'ROLE_PRINCIPAL')")
    public ResponseEntity<List<Program>> getProgramsByDepartment(@RequestParam Long departmentId) {
        return ResponseEntity.ok(schoolStructureService.getProgramsByDepartment(departmentId));
    }

    @PostMapping({"/admin/structure/programs", "/principal/structure/programs"})
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'PRINCIPAL', 'ROLE_PRINCIPAL')")
    public ResponseEntity<Program> createProgram(@RequestBody Program program) {
        return ResponseEntity.ok(schoolStructureService.saveProgram(program));
    }

    @DeleteMapping({"/admin/structure/programs/{id}", "/principal/structure/programs/{id}"})
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'PRINCIPAL', 'ROLE_PRINCIPAL')")
    public ResponseEntity<Void> deleteProgram(@PathVariable Long id) {
        schoolStructureService.deleteProgram(id);
        return ResponseEntity.noContent().build();
    }

    // --- ClassGroups ---
    @GetMapping({"/admin/structure/classes", "/principal/structure/classes"})
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'PRINCIPAL', 'ROLE_PRINCIPAL')")
    public ResponseEntity<List<ClassGroup>> getClassesByProgram(@RequestParam Long programId) {
        return ResponseEntity.ok(schoolStructureService.getClassesByProgram(programId));
    }

    @PostMapping({"/admin/structure/classes", "/principal/structure/classes"})
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'PRINCIPAL', 'ROLE_PRINCIPAL')")
    public ResponseEntity<ClassGroup> createClassGroup(@RequestBody ClassGroup classGroup) {
        return ResponseEntity.ok(schoolStructureService.saveClassGroup(classGroup));
    }

    @PutMapping({"/admin/structure/classes/{id}", "/principal/structure/classes/{id}"})
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'PRINCIPAL', 'ROLE_PRINCIPAL')")
    public ResponseEntity<ClassGroup> updateClassGroup(@PathVariable Long id, @RequestBody ClassGroup classGroup) {
        return ResponseEntity.ok(schoolStructureService.updateClassGroup(id, classGroup));
    }

    @DeleteMapping({"/admin/structure/classes/{id}", "/principal/structure/classes/{id}"})
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'PRINCIPAL', 'ROLE_PRINCIPAL')")
    public ResponseEntity<Void> deleteClassGroup(@PathVariable Long id) {
        schoolStructureService.deleteClassGroup(id);
        return ResponseEntity.noContent().build();
    }

    // --- Class Student Management ---
    @GetMapping({"/admin/structure/classes/{id}/students", "/principal/structure/classes/{id}/students"})
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'PRINCIPAL', 'ROLE_PRINCIPAL')")
    public ResponseEntity<List<com.eduflex.backend.model.User>> getStudentsInClass(@PathVariable Long id) {
        return ResponseEntity.ok(schoolStructureService.getStudentsInClass(id));
    }

    @PostMapping({"/admin/structure/classes/{id}/students/{studentId}", "/principal/structure/classes/{id}/students/{studentId}"})
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'PRINCIPAL', 'ROLE_PRINCIPAL')")
    public ResponseEntity<Void> addStudentToClass(@PathVariable Long id, @PathVariable Long studentId) {
        schoolStructureService.addStudentToClass(id, studentId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping({"/admin/structure/classes/{id}/students/{studentId}", "/principal/structure/classes/{id}/students/{studentId}"})
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'PRINCIPAL', 'ROLE_PRINCIPAL')")
    public ResponseEntity<Void> removeStudentFromClass(@PathVariable Long id, @PathVariable Long studentId) {
        schoolStructureService.removeStudentFromClass(studentId);
        return ResponseEntity.ok().build();
    }

    // --- Class Teacher Management ---
    @GetMapping({"/admin/structure/classes/{id}/teachers", "/principal/structure/classes/{id}/teachers"})
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'PRINCIPAL', 'ROLE_PRINCIPAL')")
    public ResponseEntity<List<com.eduflex.backend.model.User>> getTeachersInClass(@PathVariable Long id) {
        return ResponseEntity.ok(schoolStructureService.getTeachersInClass(id));
    }

    @PostMapping({"/admin/structure/classes/{id}/teachers/{teacherId}", "/principal/structure/classes/{id}/teachers/{teacherId}"})
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'PRINCIPAL', 'ROLE_PRINCIPAL')")
    public ResponseEntity<Void> addTeacherToClass(@PathVariable Long id, @PathVariable Long teacherId) {
        schoolStructureService.addTeacherToClass(id, teacherId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping({"/admin/structure/classes/{id}/teachers/{teacherId}", "/principal/structure/classes/{id}/teachers/{teacherId}"})
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'REKTOR', 'ROLE_REKTOR', 'PRINCIPAL', 'ROLE_PRINCIPAL')")
    public ResponseEntity<Void> removeTeacherFromClass(@PathVariable Long id, @PathVariable Long teacherId) {
        schoolStructureService.removeTeacherFromClass(id, teacherId);
        return ResponseEntity.ok().build();
    }
}
