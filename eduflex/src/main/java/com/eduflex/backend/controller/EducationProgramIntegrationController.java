package com.eduflex.backend.controller;

import com.eduflex.backend.model.EducationProgram;
import com.eduflex.backend.repository.EducationProgramRepository;
import com.eduflex.backend.service.EduCareerService;
import com.eduflex.backend.service.SkolverketApiClientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

/**
 * Controller för integration av EducationPrograms mot externa hubbar
 * (SUSA-navet & JobTech).
 */
@RestController
@RequestMapping("/api/admin/programs")
@RequiredArgsConstructor
@Slf4j
public class EducationProgramIntegrationController {

    private final EducationProgramRepository programRepository;
    private final EduCareerService eduCareerService;
    private final SkolverketApiClientService skolverketService;

    /**
     * POST /api/admin/programs/{id}/match-skills
     * Triggar JobEd Connect matchning för hela programmet.
     */
    @PostMapping("/{id}/match-skills")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','SYV','ROLE_SYV')")
    public ResponseEntity<List<String>> matchSkills(@PathVariable Long id) {
        EducationProgram program = programRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Program hittades inte"));

        List<String> skills = eduCareerService.updateProgramSkills(program);
        programRepository.save(program);

        return ResponseEntity.ok(skills);
    }

    /**
     * POST /api/admin/programs/{id}/export
     * Exporterar programmet till Skolverkets Utbildningsnav (SUSA-navet).
     */
    @PostMapping("/{id}/export")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> exportToSusaNav(@PathVariable Long id) {
        EducationProgram program = programRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Program hittades inte"));

        boolean success = skolverketService.publishProgramToSusaNav(program);

        if (success) {
            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "message", "Programmet har köats för publicering till SUSA-navet (Simulering)",
                    "program", program.getName()));
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "ERROR", "message", "Publicering misslyckades"));
        }
    }
}
