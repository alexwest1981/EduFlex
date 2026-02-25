package com.eduflex.backend.service;

import com.eduflex.backend.model.SavedInternship;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.SavedInternshipRepository;
import com.eduflex.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class EduCareerService {

    private final JobTechApiClientService jobTechClient;
    private final SavedInternshipRepository savedRepo;
    private final UserRepository userRepo;
    private final com.eduflex.backend.service.ai.GeminiService geminiService;

    public Map<String, Object> getRecommendedInternships(Long userId) {
        User user = userRepo.findById(userId).orElseThrow();
        String city = extractCityFromAddress(user.getAddress());

        // We'll search for LIA, APL, and Praktik
        Map<String, Object> rawResults = jobTechClient.searchJobs("LIA APL praktik", city, 20);

        List<Map<String, Object>> hits = (List<Map<String, Object>>) rawResults.get("hits");
        if (hits == null)
            hits = Collections.emptyList();

        // Add Match Score and filter out "Arbetspraktik" if necessary
        List<Map<String, Object>> processed = hits.stream()
                .filter(hit -> !isArbetspraktik(hit))
                .map(hit -> {
                    hit.put("matchScore", calculateBasicMatchScore(hit, user));
                    return hit;
                })
                .sorted((a, b) -> Double.compare(
                        (Double) b.getOrDefault("matchScore", 0.0),
                        (Double) a.getOrDefault("matchScore", 0.0)))
                .collect(Collectors.toList());

        return Map.of(
                "hits", processed,
                "total", processed.size(),
                "location", city != null ? city : "Hela Sverige");
    }

    @Transactional
    public SavedInternship saveInternship(Long userId, Map<String, Object> adData) {
        User user = userRepo.findById(userId).orElseThrow();
        String jobId = (String) adData.get("id");

        Optional<SavedInternship> existing = savedRepo.findByUserIdAndJobId(userId, jobId);
        if (existing.isPresent())
            return existing.get();

        SavedInternship saved = new SavedInternship();
        saved.setUser(user);
        saved.setJobId(jobId);
        saved.setHeadline((String) adData.get("headline"));

        Map<String, Object> employer = (Map<String, Object>) adData.get("employer");
        if (employer != null) {
            saved.setCompanyName((String) employer.get("name"));
        }

        Map<String, Object> workplace = (Map<String, Object>) adData.get("workplace_address");
        if (workplace != null) {
            saved.setCity((String) workplace.get("municipality"));
        }

        saved.setMatchScore((Double) adData.getOrDefault("matchScore", 0.0));

        return savedRepo.save(saved);
    }

    public List<SavedInternship> getSavedInternships(Long userId) {
        return savedRepo.findByUserIdOrderBySavedAtDesc(userId);
    }

    private String extractCityFromAddress(String address) {
        if (address == null || address.isEmpty())
            return null;
        // Simple heuristic: last word if no numbers, or look for something near postal
        // code
        String[] parts = address.split("[,\\s]+");
        return parts[parts.length - 1]; // Assume city is last
    }

    private boolean isArbetspraktik(Map<String, Object> hit) {
        String description = (String) hit.get("description");
        if (description == null)
            return false;
        String descLower = description.toLowerCase();
        // Negative filter for AF labor market measures unless explicitly LIA
        return descLower.contains("arbetspraktik") && !descLower.contains("lia");
    }

    private Double calculateBasicMatchScore(Map<String, Object> hit, User user) {
        // Placeholder for AI-driven matching
        // In reality, we'd use Gemini or semantic search
        return 0.75;
    }
}
