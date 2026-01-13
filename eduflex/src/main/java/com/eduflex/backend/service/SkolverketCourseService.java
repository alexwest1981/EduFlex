package com.eduflex.backend.service;

import com.eduflex.backend.model.SkolverketCourse;
import com.eduflex.backend.model.SkolverketGradingCriteria;
import com.eduflex.backend.repository.SkolverketCourseRepository;
import com.eduflex.backend.repository.SkolverketGradingCriteriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class SkolverketCourseService {

    @Autowired
    private SkolverketCourseRepository repository;

    @Autowired
    private SkolverketGradingCriteriaRepository criteriaRepository;

    public List<SkolverketCourse> getAllCourses() {
        return repository.findAll();
    }

    public List<SkolverketCourse> searchCourses(String query) {
        return repository.searchByNameOrCode(query);
    }

    public List<SkolverketCourse> getCoursesBySubject(String subject) {
        return repository.findBySubjectOrderByCourseName(subject);
    }

    public List<String> getAllSubjects() {
        return repository.findAllSubjects();
    }

    public SkolverketCourse getCourseByCode(String code) {
        return repository.findByCourseCode(code).orElse(null);
    }

    /**
     * Import Skolverket courses from CSV file.
     * Expected format: Kurskod,Kursnamn,Poäng,Ämne
     * Example: "ADIADM51","Administration 1","100","Administration"
     */
    public int importFromCsv(MultipartFile file) throws Exception {
        List<SkolverketCourse> courses = new ArrayList<>();
        int skippedRows = 0;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            String line;
            boolean firstLine = true;
            int lineNumber = 0;

            while ((line = reader.readLine()) != null) {
                lineNumber++;

                // Skip header line
                if (firstLine) {
                    firstLine = false;
                    continue;
                }

                // Parse CSV line (handling quoted fields)
                String[] fields = parseCsvLine(line);

                if (fields.length >= 4) {
                    try {
                        String courseCode = fields[0].trim();
                        String courseName = fields[1].trim();
                        String pointsStr = fields[2].trim();
                        String subject = fields[3].trim();

                        // Skip rows with empty or null values
                        if (courseCode.isEmpty() || courseName.isEmpty() ||
                                pointsStr.isEmpty() || pointsStr.equalsIgnoreCase("null") ||
                                subject.isEmpty()) {
                            skippedRows++;
                            continue;
                        }

                        Integer points = Integer.parseInt(pointsStr);

                        // Check if course already exists
                        if (repository.findByCourseCode(courseCode).isEmpty()) {
                            courses.add(new SkolverketCourse(courseCode, courseName, points, subject));
                        }
                    } catch (NumberFormatException e) {
                        // Skip rows with invalid point values
                        System.err.println("Skipping row " + lineNumber + " due to invalid points value");
                        skippedRows++;
                    }
                } else {
                    skippedRows++;
                }
            }

            // Batch save
            repository.saveAll(courses);
            System.out.println("Imported " + courses.size() + " courses, skipped " + skippedRows + " invalid rows");
            return courses.size();
        }
    }

    /**
     * Parse CSV line handling quoted fields
     */
    private String[] parseCsvLine(String line) {
        List<String> result = new ArrayList<>();
        boolean inQuotes = false;
        StringBuilder current = new StringBuilder();

        for (char c : line.toCharArray()) {
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                result.add(current.toString());
                current = new StringBuilder();
            } else {
                current.append(c);
            }
        }
        result.add(current.toString());

        return result.toArray(new String[0]);
    }

    public long getCount() {
        return repository.count();
    }

    /**
     * Count courses that have been completed (have description filled)
     */
    public long getCompletedCount() {
        return repository.countByDescriptionIsNotNull();
    }

    public void deleteAll() {
        repository.deleteAll();
    }

    public List<SkolverketGradingCriteria> getCriteriaByCode(String code) {
        SkolverketCourse course = repository.findByCourseCode(code).orElse(null);
        if (course == null) {
            return new ArrayList<>();
        }
        return criteriaRepository.findByCourseOrderBySortOrder(course);
    }

    public SkolverketCourse updateCourseDetails(String code, Map<String, String> details) {
        SkolverketCourse course = repository.findByCourseCode(code)
                .orElseThrow(() -> new RuntimeException("Course not found: " + code));

        if (details.containsKey("description"))
            course.setDescription(details.get("description"));
        if (details.containsKey("englishTitle"))
            course.setEnglishTitle(details.get("englishTitle"));
        if (details.containsKey("skolformer"))
            course.setSkolformer(details.get("skolformer"));
        if (details.containsKey("pdfUrl"))
            course.setPdfUrl(details.get("pdfUrl"));
        if (details.containsKey("subjectPurpose"))
            course.setSubjectPurpose(details.get("subjectPurpose"));
        if (details.containsKey("objectives"))
            course.setObjectives(details.get("objectives"));

        return repository.save(course);
    }

    public List<SkolverketGradingCriteria> saveCriteria(String code, List<Map<String, Object>> criteriaData) {
        SkolverketCourse course = repository.findByCourseCode(code)
                .orElseThrow(() -> new RuntimeException("Course not found: " + code));

        // Delete existing criteria for this course
        criteriaRepository.deleteByCourse(course);

        // Create new criteria
        List<SkolverketGradingCriteria> criteria = new ArrayList<>();
        for (Map<String, Object> data : criteriaData) {
            String gradeLevel = (String) data.get("gradeLevel");
            String criteriaText = (String) data.get("criteriaText");
            Integer sortOrder = (Integer) data.get("sortOrder");

            SkolverketGradingCriteria criterion = new SkolverketGradingCriteria(
                    course, gradeLevel, criteriaText, sortOrder);
            criteria.add(criterion);
        }

        return criteriaRepository.saveAll(criteria);
    }
}
