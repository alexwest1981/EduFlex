package com.eduflex.backend.service.ai;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.service.EduAiHubService;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeacherAnalyticsService {

        private final CourseRepository courseRepository;
        private final EduAiHubService eduAiHubService;
        private final GeminiService geminiService;
        private final com.eduflex.backend.repository.UserRepository userRepository;
        private final com.eduflex.backend.repository.CalendarEventRepository calendarEventRepository;
        private final com.eduflex.backend.repository.CourseMaterialRepository courseMaterialRepository;

        @Data
        @Builder
        public static class CourseAnalytics {
                private Map<String, Integer> aggregateRadar;
                private List<StudentPerformance> lowPerformingStudents;
                private List<String> learningGaps;
                private String aiInsight;
        }

        @Data
        @Builder
        public static class StudentPerformance {
                private Long userId;
                private String name;
                private int masteryScore;
        }

        public CourseAnalytics getCourseAnalytics(Long courseId) {
                Course course = courseRepository.findById(courseId)
                                .orElseThrow(() -> new RuntimeException("Course not found"));

                Set<User> students = course.getStudents();
                if (students.isEmpty()) {
                        return CourseAnalytics.builder()
                                        .aggregateRadar(Map.of("Teori", 0, "Praktik", 0, "Focus", 0, "Analys", 0))
                                        .lowPerformingStudents(new ArrayList<>())
                                        .learningGaps(new ArrayList<>())
                                        .aiInsight("Inga studenter registrerade i kursen än.")
                                        .build();
                }

                Map<String, Double> sumStats = new HashMap<>();
                sumStats.put("Teori", 0.0);
                sumStats.put("Praktik", 0.0);
                sumStats.put("Focus", 0.0);
                sumStats.put("Analys", 0.0);

                List<StudentPerformance> performers = new ArrayList<>();

                for (User student : students) {
                        Map<String, Integer> studentStats = eduAiHubService.getRadarStats(student.getId());
                        studentStats.forEach((k, v) -> {
                                double current = sumStats.getOrDefault(k, 0.0);
                                double val = v != null ? v.doubleValue() : 0.0;
                                sumStats.put(k, current + val);
                        });

                        performers.add(StudentPerformance.builder()
                                        .userId(student.getId())
                                        .name(student.getFirstName() + " " + student.getLastName())
                                        .masteryScore(eduAiHubService.getMasteryScore(student.getId()))
                                        .build());
                }

                Map<String, Integer> avgStats = new HashMap<>();
                int count = students.size();
                List<String> gaps = new ArrayList<>();

                sumStats.forEach((k, v) -> {
                        double value = v != null ? v : 0.0;
                        int avg = (int) Math.round(value / count);
                        avgStats.put(k, avg);
                        if (avg < 60) {
                                gaps.add(k);
                        }
                });

                List<StudentPerformance> atRisk = performers.stream()
                                .filter(p -> p.getMasteryScore() < 40)
                                .sorted(Comparator.comparingInt(StudentPerformance::getMasteryScore))
                                .limit(5)
                                .collect(Collectors.toList());

                return CourseAnalytics.builder()
                                .aggregateRadar(avgStats)
                                .lowPerformingStudents(atRisk)
                                .learningGaps(gaps)
                                .build();
        }

        public String generateAiInsight(Long courseId, CourseAnalytics analytics) {
                Course course = courseRepository.findById(courseId).orElse(null);
                String courseName = course != null ? course.getName() : "Kursen";

                StringBuilder prompt = new StringBuilder();
                prompt.append("Du är en senior pedagogisk rådgivare på EduFlex LMS. ");
                prompt.append("Analysera följande aggregerade data för kursen '").append(courseName).append("':\n");
                prompt.append("- Genomsnittliga färdigheter (Radar): ").append(analytics.getAggregateRadar())
                                .append("\n");
                prompt.append("- Identifierade luckor: ").append(analytics.getLearningGaps()).append("\n");
                prompt.append("- Antal elever under 40% mastery: ").append(analytics.getLowPerformingStudents().size())
                                .append("\n\n");
                prompt.append("Ge läraren en konkret, proaktiv insikt på max 3 meningar. ");
                prompt.append("Fokusera på vad läraren kan göra i nästa lektion för att lyfta klassen. Svara på svenska.");

                try {
                        return geminiService.generateControlCenterInsight(prompt.toString());
                } catch (Exception e) {
                        log.error("Failed to generate AI insight for teacher", e);
                        return "Kunde inte generera AI-insikt just nu. Fokusera på att stärka de områden där klassen har lägst poäng.";
                }
        }

        public String generateLessonPlan(Long courseId, CourseAnalytics analytics) {
                Course course = courseRepository.findById(courseId).orElse(null);
                String courseName = course != null ? course.getName() : "Kursen";

                StringBuilder prompt = new StringBuilder();
                prompt.append("Du är en expert-pedagog som skapar dynamiska och engagerande lektionsupplägg. ");
                prompt.append("Skapa ett strukturerat lektionsförslag för pkommande lektion i kursen '")
                                .append(courseName)
                                .append("'. ");
                prompt.append("Lektionsplanen måste baseras på följande aktuella data för klassen:\n");
                prompt.append("- Starka/svaga färdigheter (Radar): ").append(analytics.getAggregateRadar())
                                .append("\n");
                prompt.append("- Kritiska kunskapsluckor (snitt < 60%): ").append(analytics.getLearningGaps())
                                .append("\n");
                prompt.append("- Elever som ligger i riskzonen (< 40% mastery): ")
                                .append(analytics.getLowPerformingStudents().size()).append(" st.\n\n");
                prompt.append(
                                "Skriv hela innehållet så det riktar sig direkt till eleverna som ska läsa lektionen, utan instruktioner till läraren.\n");
                prompt.append("Lektionen ska innehålla:\n");
                prompt.append(
                                "1. **Introduktion:** Vad kommer vi lära oss och varför är det användbart? (Förklara de svaga områdena peppigt).\n");
                prompt.append(
                                "2. **Teori & Pedagogik:** En tydlig, elevvänlig förklaring av koncepten klassen har svårt för, med kodexempel eller verkliga analogier.\n");
                prompt.append(
                                "3. **Praktiska övningar:** Förslag på hands-on kodning, kluriga frågor eller miniprojekt eleverna kan jobba med direkt.\n");
                prompt.append("4. **Sammanfattning:** 'Key takeaways' i en snygg punktlista.\n\n");
                prompt.append(
                                "Formatera svaret snyggt med HTML-taggar (`<h2>`, `<strong>`, `<p>`, `<ul>`, `<li>` etc) istället för Markdown. Skriv på professionell men peppig svenska. ");
                prompt.append(
                                "VIKTIGT: Svara EXAKT med endast HTML-koden för lektionsplanen. Inkludera INGA inledande eller avslutande konversationstexter, och använd INTE markdown-block som ```html. Inkludera INTE <html>, <head> eller <body>-taggar. Skicka bara HTML-innehållet direkt.");
                prompt.append(
                                "MYCKET VIKTIGT: Använd INGA radbrytningar (\\n) inuti dina <p> eller <li> taggar. Skriv hela textstycken på en och samma rad, annars går textformateringen sönder när den redigeras.");

                try {
                        String response = geminiService.generateLessonPlan(prompt.toString());
                        if (response != null) {
                                response = response.replaceAll("```html\\s*", "")
                                                .replaceAll("```HTML\\s*", "")
                                                .replaceAll("```\\s*", "")
                                                .replaceAll("(?i)<!DOCTYPE html>\\s*", "")
                                                .replaceAll("(?i)<html[^>]*>\\s*", "")
                                                .replaceAll("(?i)</html>\\s*", "")
                                                .replaceAll("(?i)<head>[\\s\\S]*?</head>\\s*", "")
                                                .replaceAll("(?i)<body[^>]*>\\s*", "")
                                                .replaceAll("(?i)</body>\\s*", "")
                                                .trim();

                                // Clean up newlines for Quill editor compatibility
                                // We replace newlines with a space, but ONLY outside of <pre> tags (code
                                // blocks)
                                // so we don't destroy the formatting of generated code snippets.
                                String[] parts = response.split("(?i)(?=<pre>)|(?<=</pre>)");
                                StringBuilder noNewlineResponse = new StringBuilder();
                                for (String part : parts) {
                                        if (part.toLowerCase().startsWith("<pre>")) {
                                                noNewlineResponse.append(part);
                                        } else {
                                                noNewlineResponse.append(part.replace("\n", " ").replace("\r", ""));
                                        }
                                }
                                response = noNewlineResponse.toString();
                        }
                        return response;
                } catch (Exception e) {
                        log.error("Failed to generate lesson plan", e);
                        return "Kunde tyvärr inte generera ett lektionsförslag just nu. Vänligen försök igen senare.";
                }
        }

        @org.springframework.transaction.annotation.Transactional
        public void saveLessonPlanToCalendar(Long courseId, String title, String description,
                        java.time.LocalDateTime startTime, java.time.LocalDateTime endTime, String username) {
                Course course = courseRepository.findById(courseId)
                                .orElseThrow(() -> new RuntimeException("Course not found"));

                com.eduflex.backend.model.User owner = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                // 1. Spara The CourseMaterial först för att få ett ID
                com.eduflex.backend.model.CourseMaterial material = new com.eduflex.backend.model.CourseMaterial();
                String finalTitle = title != null && !title.isEmpty() ? title : "AI Lektion: " + course.getName();
                material.setTitle(finalTitle);
                material.setContent(description);
                material.setType(com.eduflex.backend.model.CourseMaterial.MaterialType.LESSON);
                material.setCourse(course);

                int maxSortOrder = courseMaterialRepository.findByCourseId(courseId).stream()
                                .mapToInt(com.eduflex.backend.model.CourseMaterial::getSortOrder)
                                .max()
                                .orElse(0);

                material.setSortOrder(maxSortOrder + 1);
                material = courseMaterialRepository.save(material);

                // 2. Skapa en kort sammanfattning och formatera kalenderbeskrivningen
                String shortDesc = description;
                if (shortDesc.length() > 250) {
                        shortDesc = shortDesc.substring(0, 250) + "...";
                }

                java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter
                                .ofPattern("yyyy-MM-dd HH:mm");
                String timeString = startTime.format(formatter) + " - " + endTime.format(formatter);
                long durationMinutes = java.time.Duration.between(startTime, endTime).toMinutes();
                String durationString = durationMinutes + " minuter";

                String teacherName = owner.getFirstName() + " " + owner.getLastName();
                if (teacherName.trim().isEmpty()) {
                        teacherName = owner.getUsername();
                }

                String subject = course.getName();
                String directLink = "https://www.eduflexlms.se/course/" + courseId + "?tab=material&itemId="
                                + material.getId();

                String calendarDescription = String.format(
                                "**Lektion:** %s\n" +
                                                "**Tid:** %s\n" +
                                                "**Längd:** %s\n" +
                                                "**Lärare:** %s\n" +
                                                "**Ämne:** %s\n\n" +
                                                "**Sammanfattning:**\n%s\n\n" +
                                                "[➡ Klicka här för att gå till hela lektionen](%s)",
                                finalTitle, timeString, durationString, teacherName, subject, shortDesc, directLink);

                // 3. Spara CalendarEvent
                com.eduflex.backend.model.CalendarEvent event = new com.eduflex.backend.model.CalendarEvent();
                event.setTitle(finalTitle);
                event.setDescription(calendarDescription);
                event.setStartTime(startTime);
                event.setEndTime(endTime);
                event.setType(com.eduflex.backend.model.CalendarEvent.EventType.LESSON);
                event.setStatus(com.eduflex.backend.model.CalendarEvent.EventStatus.CONFIRMED);
                event.setPlatform(com.eduflex.backend.model.CalendarEvent.EventPlatform.NONE);
                event.setCourse(course);
                event.setOwner(owner);

                // Add all enrolled students as attendees
                for (com.eduflex.backend.model.User student : course.getStudents()) {
                        event.getAttendees().add(student);
                }

                calendarEventRepository.save(event);
        }
}
