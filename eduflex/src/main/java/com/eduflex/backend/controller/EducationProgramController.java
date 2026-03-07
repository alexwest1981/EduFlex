package com.eduflex.backend.controller;

import com.eduflex.backend.model.EducationProgram;
import com.eduflex.backend.model.ProgramApplication;
import com.eduflex.backend.service.EducationProgramService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/education-programs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EducationProgramController {

    private final EducationProgramService service;

    @GetMapping
    public List<EducationProgram> getAllPrograms() {
        return service.getAllPrograms();
    }

    @GetMapping("/{id}")
    public ResponseEntity<EducationProgram> getProgramById(@PathVariable Long id) {
        return service.getProgramById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<EducationProgram> getProgramBySlug(@PathVariable String slug) {
        return service.getProgramBySlug(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/apply")
    public ResponseEntity<ProgramApplication> applyForProgram(@RequestParam Long programId, @RequestParam Long userId) {
        return ResponseEntity.ok(service.applyForProgram(programId, userId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SYV')")
    public ResponseEntity<EducationProgram> saveProgram(@RequestBody EducationProgram program) {
        return ResponseEntity.ok(service.saveProgram(program));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SYV')")
    public ResponseEntity<EducationProgram> updateProgram(@PathVariable Long id,
            @RequestBody EducationProgram program) {
        program.setId(id);
        return ResponseEntity.ok(service.saveProgram(program));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SYV')")
    public ResponseEntity<Void> deleteProgram(@PathVariable Long id) {
        service.deleteProgram(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{programId}/courses/{courseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SYV')")
    public ResponseEntity<EducationProgram> addCourseToProgram(@PathVariable Long programId,
            @PathVariable Long courseId) {
        return ResponseEntity.ok(service.addCourseToProgram(programId, courseId));
    }

    @DeleteMapping("/{programId}/courses/{courseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SYV')")
    public ResponseEntity<EducationProgram> removeCourseFromProgram(@PathVariable Long programId,
            @PathVariable Long courseId) {
        return ResponseEntity.ok(service.removeCourseFromProgram(programId, courseId));
    }
}
