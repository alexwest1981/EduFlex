package com.eduflex.backend.service.ai;

import com.eduflex.backend.model.CourseMaterial;
import com.eduflex.backend.model.CourseResult;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.CourseMaterialRepository;
import com.eduflex.backend.repository.CourseResultRepository;
import com.eduflex.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdaptivePathService {

    private final GeminiService geminiService;
    private final CourseMaterialRepository materialRepository;
    private final CourseResultRepository resultRepository;
    private final UserRepository userRepository;

    public String getRecommendation(Long studentId, Long courseId) {
        User student = userRepository.findById(studentId).orElseThrow();
        Optional<CourseResult> result = resultRepository.findByCourseIdAndStudentId(courseId, studentId);
        List<CourseMaterial> availableMaterials = materialRepository.findByCourseIdOrderBySortOrderAsc(courseId);

        StringBuilder prompt = new StringBuilder();
        prompt.append("Du är en adaptiv studiecoach för EduFlex LMS. ");
        prompt.append("Analysera studenten: ").append(student.getFullName()).append("\n");

        if (result.isPresent()) {
            prompt.append("Nuvarande status i kursen: ").append(result.get().getStatus()).append("\n");
        }

        prompt.append("Tillgängligt material (ID, Titel, Svårighetsgrad):\n");
        for (CourseMaterial m : availableMaterials) {
            prompt.append("- ").append(m.getId()).append(": ").append(m.getTitle())
                    .append(" (Nivå: ").append(m.getDifficultyLevel()).append(")\n");
        }

        prompt.append("\nGe en kortfattad rekommendation på vad studenten bör fokusera på härnäst. ");
        prompt.append("Om studenten har det svårt, rekommendera lägre svårighetsgrad (1-2). ");
        prompt.append("Om studenten presterar bra, rekommendera utmanande material (4-5). ");
        prompt.append("Svara på svenska.");

        try {
            return geminiService.generateResponse(prompt.toString());
        } catch (Exception e) {
            log.error("Failed to generate adaptive recommendation", e);
            return "Fortsätt med nästa lektion i din kursplan.";
        }
    }
}
