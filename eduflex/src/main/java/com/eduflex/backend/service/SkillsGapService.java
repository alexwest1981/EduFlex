package com.eduflex.backend.service;

import com.eduflex.backend.dto.SkillsGapDTO;
import com.eduflex.backend.model.*;
import com.eduflex.backend.repository.*;
import com.eduflex.backend.service.ai.GeminiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SkillsGapService {

    private final SkillRepository skillRepository;
    private final CourseSkillMappingRepository mappingRepository;
    private final StudentSkillLevelRepository studentSkillRepository;
    private final CourseResultRepository courseResultRepository;
    private final UserRepository userRepository;
    private final GeminiService geminiService;

    @Transactional(readOnly = true)
    public SkillsGapDTO getStudentGaps(Long userId) {
        User student = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<StudentSkillLevel> currentLevels = studentSkillRepository.findByStudentId(userId);

        // Find all skills associated with the student's courses to determine targets
        List<CourseResult> results = courseResultRepository.findByStudentId(userId);
        List<Long> courseIds = results.stream().map(r -> r.getCourse().getId()).collect(Collectors.toList());

        List<SkillsGapDTO.SkillProgressDTO> skillProgress = new ArrayList<>();

        for (StudentSkillLevel level : currentLevels) {
            // Find mappings for this skill in the student's courses to find the max target
            double maxTarget = 100.0; // Default target

            SkillsGapDTO.SkillProgressDTO dto = SkillsGapDTO.SkillProgressDTO.builder()
                    .skillName(level.getSkill().getName())
                    .category(level.getSkill().getCategory())
                    .currentLevel(level.getCurrentLevel())
                    .targetLevel(maxTarget)
                    .gap(Math.max(0, maxTarget - level.getCurrentLevel()))
                    .build();

            skillProgress.add(dto);
        }

        String advice = generateAiAdvice(student, skillProgress);

        return SkillsGapDTO.builder()
                .skills(skillProgress)
                .aiRecommendation(advice)
                .build();
    }

    @Transactional(readOnly = true)
    public List<SkillsGapDTO.SkillProgressDTO> getCourseHeatmap(Long courseId) {
        List<CourseSkillMapping> mappings = mappingRepository.findByCourseId(courseId);
        List<SkillsGapDTO.SkillProgressDTO> heatmap = new ArrayList<>();

        for (CourseSkillMapping mapping : mappings) {
            // Calculate average level for this skill across students in this course
            // For now, simplified average. In a real scenario, we'd query
            // student_skill_levels joined with course enrollments.
            double avgLevel = 45.0; // Placeholder for demo

            heatmap.add(SkillsGapDTO.SkillProgressDTO.builder()
                    .skillName(mapping.getSkill().getName())
                    .category(mapping.getSkill().getCategory())
                    .currentLevel(avgLevel)
                    .targetLevel(mapping.getRequiredLevel())
                    .gap(Math.max(0, mapping.getRequiredLevel() - avgLevel))
                    .build());
        }

        return heatmap;
    }

    @Transactional
    public void updateSkillsFromPerformance(Long userId) {
        User student = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<CourseResult> results = courseResultRepository.findByStudentId(userId);

        for (CourseResult result : results) {
            if (result.getStatus() == CourseResult.Status.PASSED) {
                List<CourseSkillMapping> mappings = mappingRepository.findByCourseId(result.getCourse().getId());
                for (CourseSkillMapping mapping : mappings) {
                    updateSkillLevel(student, mapping.getSkill(), mapping.getContributionWeight());
                }
            }
        }
    }

    private void updateSkillLevel(User student, Skill skill, Double weight) {
        StudentSkillLevel level = studentSkillRepository.findByStudentIdAndSkillId(student.getId(), skill.getId())
                .orElseGet(() -> {
                    StudentSkillLevel newLevel = new StudentSkillLevel();
                    newLevel.setStudent(student);
                    newLevel.setSkill(skill);
                    newLevel.setCurrentLevel(0.0);
                    return newLevel;
                });

        level.setCurrentLevel(Math.min(100.0, level.getCurrentLevel() + weight));
        level.setLastUpdated(LocalDateTime.now());
        studentSkillRepository.save(level);
    }

    private String generateAiAdvice(User student, List<SkillsGapDTO.SkillProgressDTO> gaps) {
        if (gaps.isEmpty())
            return "Börja läsa kurser för att se din kompetensutveckling!";

        StringBuilder context = new StringBuilder();
        context.append("Student: ").append(student.getUsername()).append("\n");
        context.append("Status för kompetenser:\n");
        for (SkillsGapDTO.SkillProgressDTO gap : gaps) {
            context.append("- ").append(gap.getSkillName())
                    .append(": ").append(gap.getCurrentLevel())
                    .append("/").append(gap.getTargetLevel())
                    .append(" (Gap: ").append(gap.getGap()).append(")\n");
        }

        String prompt = String.format(
                "Du är en pedagogisk AI-coach. Analysera studentens kompetensluckor och ge korta, konkreta tips på hur de kan förbättra sina svagaste områden.\n"
                        +
                        "Håll det motiverande och fokuserat på nästa steg.\n\nContext:\n%s",
                context.toString());

        try {
            return geminiService.generateResponse(prompt);
        } catch (Exception e) {
            log.error("Failed to generate AI advice for skills gap", e);
            return "Fortsätt jobba på bra med dina kurser för att nå dina mål!";
        }
    }
}
