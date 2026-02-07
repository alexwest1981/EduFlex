package com.eduflex.backend.service;

import com.eduflex.backend.model.XApiStatement;
import com.eduflex.backend.repository.XApiStatementRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
import com.eduflex.backend.repository.Cmi5PackageRepository;
import com.eduflex.backend.model.Cmi5Package;

@Service
public class XApiAnalyticsService {

    private final XApiStatementRepository statementRepository;
    private final com.eduflex.backend.repository.Cmi5PackageRepository cmi5PackageRepository;

    private static final String VERB_COMPLETED = "http://adlnet.gov/expapi/verbs/completed";
    private static final String VERB_INITIALIZED = "http://adlnet.gov/expapi/verbs/initialized";
    private static final String VERB_PASSED = "http://adlnet.gov/expapi/verbs/passed";

    public XApiAnalyticsService(XApiStatementRepository statementRepository,
            com.eduflex.backend.repository.Cmi5PackageRepository cmi5PackageRepository) {
        this.statementRepository = statementRepository;
        this.cmi5PackageRepository = cmi5PackageRepository;
    }

    public Map<String, Object> getCourseAnalytics(String courseIdStr) {
        Long courseId;
        try {
            courseId = Long.parseLong(courseIdStr);
        } catch (NumberFormatException e) {
            return Map.of("error", "Invalid course ID");
        }

        // 1. Find all packages for this course to get their IDs/URLs
        List<com.eduflex.backend.model.Cmi5Package> packages = cmi5PackageRepository.findByCourseId(courseId);
        if (packages.isEmpty()) {
            return Map.of("totalLearners", 0, "completedLearners", 0, "completionRate", 0.0, "dropOffAnalysis",
                    List.of());
        }

        // Gather all relevant Object IDs (launch URLs or package IDs)
        // In cmi5, the objectId usually matches the AU's launch URL.
        // We look for statements where the objectId *contains* the packageId (since
        // full URL might vary slightly or be absolute)
        Set<String> packageIds = packages.stream()
                .map(com.eduflex.backend.model.Cmi5Package::getPackageId)
                .collect(Collectors.toSet());

        List<XApiStatement> allStatements = statementRepository.findAll();

        // 2. Filter statements belonging to any of these packages
        List<XApiStatement> courseStatements = allStatements.stream()
                .filter(s -> s.getObjectId() != null
                        && packageIds.stream().anyMatch(pid -> s.getObjectId().contains(pid)))
                .collect(Collectors.toList());

        // 2. Calculate Completion Rate
        Set<String> uniqueActors = courseStatements.stream()
                .map(XApiStatement::getActorEmail)
                .collect(Collectors.toSet());

        Set<String> completedActors = courseStatements.stream()
                .filter(s -> VERB_COMPLETED.equals(s.getVerbId()) || VERB_PASSED.equals(s.getVerbId()))
                .map(XApiStatement::getActorEmail)
                .collect(Collectors.toSet());

        double completionRate = uniqueActors.isEmpty() ? 0.0
                : (double) completedActors.size() / uniqueActors.size() * 100.0;

        // 3. Drop-off Analysis (Where do they stop?)
        // Group by ObjectId (e.g., slide or lesson ID) and count 'initialized' vs
        // 'completed'
        Map<String, Long> initializations = courseStatements.stream()
                .filter(s -> VERB_INITIALIZED.equals(s.getVerbId()))
                .collect(Collectors.groupingBy(XApiStatement::getObjectId, Collectors.counting()));

        Map<String, Long> completions = courseStatements.stream()
                .filter(s -> VERB_COMPLETED.equals(s.getVerbId()))
                .collect(Collectors.groupingBy(XApiStatement::getObjectId, Collectors.counting()));

        List<Map<String, Object>> dropOffData = new ArrayList<>();
        initializations.forEach((objId, initCount) -> {
            long compCount = completions.getOrDefault(objId, 0L);
            Map<String, Object> item = new HashMap<>();
            item.put("objectId", objId);
            item.put("initialized", initCount);
            item.put("completed", compCount);
            item.put("dropOffRate", (double) (initCount - compCount) / initCount * 100.0);
            dropOffData.add(item);
        });

        Map<String, Object> result = new HashMap<>();
        result.put("totalLearners", uniqueActors.size());
        result.put("completedLearners", completedActors.size());
        result.put("completionRate", completionRate);
        result.put("dropOffAnalysis", dropOffData);

        return result;
    }
}
