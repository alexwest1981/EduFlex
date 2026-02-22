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
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SkillsGapService {

    private final SkillRepository skillRepository;
    private final CourseSkillMappingRepository mappingRepository;
    private final StudentSkillLevelRepository studentSkillRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final GeminiService geminiService;

    @Transactional(readOnly = true)
    public SkillsGapDTO getStudentGaps(Long userId) {
        User student = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get all courses student is enrolled in
        Set<Course> enrolledCourses = student.getCourses();

        // Find targets for all skills in these courses
        Map<Long, Double> skillTargets = new HashMap<>();
        Map<Long, Skill> skillMap = new HashMap<>();

        for (Course course : enrolledCourses) {
            List<CourseSkillMapping> mappings = mappingRepository.findByCourseId(course.getId());
            for (CourseSkillMapping mapping : mappings) {
                Long skillId = mapping.getSkill().getId();
                double target = mapping.getRequiredLevel();
                skillTargets.put(skillId, Math.max(skillTargets.getOrDefault(skillId, 0.0), target));
                skillMap.put(skillId, mapping.getSkill());
            }
        }

        // Get current levels
        List<StudentSkillLevel> currentLevels = studentSkillRepository.findByStudentId(userId);
        Map<Long, Double> currentLevelsMap = currentLevels.stream()
                .collect(Collectors.toMap(l -> l.getSkill().getId(), StudentSkillLevel::getCurrentLevel));

        List<SkillsGapDTO.SkillProgressDTO> skillProgress = new ArrayList<>();

        // Add all skills that have a target in the student's current courses
        for (Map.Entry<Long, Double> entry : skillTargets.entrySet()) {
            Long skillId = entry.getKey();
            Double target = entry.getValue();
            Double current = currentLevelsMap.getOrDefault(skillId, 0.0);
            Skill skill = skillMap.get(skillId);

            skillProgress.add(SkillsGapDTO.SkillProgressDTO.builder()
                    .skillName(skill.getName())
                    .category(skill.getCategory())
                    .currentLevel(current)
                    .targetLevel(target)
                    .gap(Math.max(0, target - current))
                    .build());
        }

        // Sort by gap descending (most critical first)
        skillProgress.sort((a, b) -> Double.compare(b.getGap(), a.getGap()));

        String advice = generateAiAdvice(student, skillProgress);

        return SkillsGapDTO.builder()
                .skills(skillProgress)
                .aiRecommendation(advice)
                .build();
    }

    @Transactional(readOnly = true)
    public List<SkillsGapDTO.SkillProgressDTO> getCourseHeatmap(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        List<CourseSkillMapping> mappings = mappingRepository.findByCourseId(courseId);
        Set<User> students = course.getStudents();

        List<SkillsGapDTO.SkillProgressDTO> heatmap = new ArrayList<>();

        for (CourseSkillMapping mapping : mappings) {
            Skill skill = mapping.getSkill();

            // Calculate actual average from all students in the course
            double totalLevel = 0;
            int count = 0;

            for (User student : students) {
                Optional<StudentSkillLevel> levelOpt = studentSkillRepository.findByStudentIdAndSkillId(student.getId(),
                        skill.getId());
                totalLevel += levelOpt.map(StudentSkillLevel::getCurrentLevel).orElse(0.0);
                count++;
            }

            double avgLevel = count > 0 ? totalLevel / count : 0.0;

            heatmap.add(SkillsGapDTO.SkillProgressDTO.builder()
                    .skillName(skill.getName())
                    .category(skill.getCategory())
                    .currentLevel(avgLevel)
                    .targetLevel(mapping.getRequiredLevel())
                    .gap(Math.max(0, mapping.getRequiredLevel() - avgLevel))
                    .build());
        }

        return heatmap;
    }

    @Transactional
    public void processPerformanceResult(Long userId, Long courseId, Double masteryScore) {
        User student = userRepository.findById(userId).orElse(null);
        if (student == null)
            return;

        List<CourseSkillMapping> mappings = mappingRepository.findByCourseId(courseId);
        for (CourseSkillMapping mapping : mappings) {
            // Contribution = masteryScore * contributionWeight (as percentage of max)
            double contribution = (masteryScore / 100.0) * mapping.getContributionWeight();
            updateSkillLevel(student, mapping.getSkill(), contribution);
        }
    }

    private void updateSkillLevel(User student, Skill skill, Double contribution) {
        StudentSkillLevel level = studentSkillRepository.findByStudentIdAndSkillId(student.getId(), skill.getId())
                .orElseGet(() -> {
                    StudentSkillLevel newLevel = new StudentSkillLevel();
                    newLevel.setStudent(student);
                    newLevel.setSkill(skill);
                    newLevel.setCurrentLevel(0.0);
                    return newLevel;
                });

        level.setCurrentLevel(Math.min(100.0, level.getCurrentLevel() + contribution));
        level.setLastUpdated(LocalDateTime.now());
        studentSkillRepository.save(level);
    }

    private String generateAiAdvice(User student, List<SkillsGapDTO.SkillProgressDTO> gaps) {
        if (gaps.isEmpty())
            return "Börja läsa kurser för att se din kompetensutveckling!";

        StringBuilder context = new StringBuilder();
        context.append("Student: ").append(student.getFirstName()).append("\n");
        context.append("Status för kompetenser:\n");
        for (SkillsGapDTO.SkillProgressDTO gap : gaps) {
            context.append("- ").append(gap.getSkillName())
                    .append(": ").append(Math.round(gap.getCurrentLevel()))
                    .append("/").append(Math.round(gap.getTargetLevel()))
                    .append("% (Gap: ").append(Math.round(gap.getGap())).append("%)\n");
        }

        String prompt = String.format(
                "Du är en pedagogisk AI-coach i EduFlex LMS. Analysera studentens kompetensluckor och ge korta, konkreta tips på hur de kan förbättra sina svagaste områden.\n"
                        + "Håll det motiverande, personligt och fokuserat på nästa steg. Svara på svenska.\n\nContext:\n%s",
                context.toString());

        try {
            return geminiService.generateResponse(prompt);
        } catch (Exception e) {
            log.error("Failed to generate AI advice for skills gap", e);
            return "Fortsätt jobba på bra med dina kurser för att nå dina mål!";
        }
    }
}
