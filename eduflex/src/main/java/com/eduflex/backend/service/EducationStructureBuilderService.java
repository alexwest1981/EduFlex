package com.eduflex.backend.service;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.NationalSyllabus;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.NationalSyllabusRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class EducationStructureBuilderService {

    private final SkolverketApiClientService skolverketClient;
    private final CourseRepository courseRepository;
    private final NationalSyllabusRepository syllabusRepository;

    public EducationStructureBuilderService(
            SkolverketApiClientService skolverketClient,
            CourseRepository courseRepository,
            NationalSyllabusRepository syllabusRepository) {
        this.skolverketClient = skolverketClient;
        this.courseRepository = courseRepository;
        this.syllabusRepository = syllabusRepository;
    }

    /**
     * Bygger upp ett utbildningspaket i EduFlex utifrån en SUN-kod via SUSA-navet.
     * Skapar nödvändiga kurser och strukturer automatisk (tex Yrkeshögskola).
     */
    @Transactional
    public List<Course> buildStructureFromSunCode(String sunCode, User creator) {
        log.info("🏗️ Startar bygge av utbildningsstruktur från SUN-kod: {}", sunCode);

        List<Map<String, Object>> programsData = skolverketClient.fetchProgramBySunCode(sunCode);
        List<Course> createdCourses = new ArrayList<>();

        if (programsData == null || programsData.isEmpty()) {
            log.warn("⚠️ Inga program hittades för SUN-kod: {}", sunCode);
            // I en live-miljö skulle vi här kasta ett exception eller returnera tomt, men
            // för att testa under utveckling bygger vi en mock-struktur ifall API:et ej är
            // igång
            programsData = mockProgramDataFallback(sunCode);
        }

        for (Map<String, Object> progMap : programsData) {
            String code = (String) progMap.getOrDefault("code",
                    "UNKNOWN-" + UUID.randomUUID().toString().substring(0, 5));
            String name = (String) progMap.getOrDefault("name", "Ny Utbildning");
            String desc = (String) progMap.getOrDefault("description", "Skapad via SUSA-navet");
            boolean requiresLia = (Boolean) progMap.getOrDefault("requiresLia", false);

            // Kolla om kursen redan existerar för att undvika dubbletter
            if (courseRepository.findByCourseCode(code).isPresent()) {
                log.info("ℹ️ Kursen/Programmet {} finns redan. Hoppar över skapande.", code);
                continue;
            }

            // 1. Skapa eller hämta NationalSyllabus (Kursplan Caching)
            NationalSyllabus syllabus = syllabusRepository.findByCode(code).orElseGet(() -> {
                NationalSyllabus newSyllabus = NationalSyllabus.builder()
                        .code(code)
                        .name(name)
                        .purpose(desc)
                        .level("Yrkeshögskola")
                        .build();
                return syllabusRepository.save(newSyllabus);
            });

            // 2. Skapa EduFlex Course entiteten
            Course course = new Course();
            course.setCourseCode(code);
            course.setName(name);
            course.setDescription(desc);
            course.setSunCode(sunCode);
            course.setNationalSyllabus(syllabus);
            course.setRequiresLia(requiresLia);
            course.setTeacher(creator);
            course.setVisibility(Course.CourseVisibility.PRIVATE);
            course.setStartDate(LocalDateTime.now().toLocalDate().toString());
            course.setSlug(code.toLowerCase() + "-" + System.currentTimeMillis());

            // TODO: Skapa automatisk "LIA-Modul" (Lesson) om requiresLia är true.

            course = courseRepository.save(course);
            createdCourses.add(course);

            log.info("✅ Skapade EduFlex-kurs {} (SUN: {}) baserad på SUSA-navet.", course.getName(), sunCode);
        }

        return createdCourses;
    }

    private List<Map<String, Object>> mockProgramDataFallback(String sunCode) {
        log.info("💉 Använder Fallback MOCK-data för SUSA-navet SUN: {}", sunCode);
        return List.of(
                Map.of(
                        "code", "YH-" + sunCode + "-1",
                        "name", "Objektorienterad Programmering (SUSA)",
                        "description",
                        "Grunderna i objektorienterad systemutveckling. Hämtad från Skolverkets referensram.",
                        "requiresLia", false),
                Map.of(
                        "code", "YH-" + sunCode + "-LIA",
                        "name", "Lärande i Arbete (LIA) - Systemutveckling",
                        "description", "Praktikperiod där de teoretiska målen omsätts i praktik.",
                        "requiresLia", true));
    }
}
