package com.eduflex.backend.service;

import com.eduflex.backend.model.SystemModule;
import com.eduflex.backend.repository.ModuleRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ModuleService {

        private static final Logger logger = LoggerFactory.getLogger(ModuleService.class);

        private final ModuleRepository moduleRepository;
        private final LicenseService licenseService;

        public ModuleService(ModuleRepository moduleRepository, LicenseService licenseService) {
                this.moduleRepository = moduleRepository;
                this.licenseService = licenseService;
        }

        public List<SystemModule> getAllModules() {
                return moduleRepository.findAll();
        }

        public SystemModule toggleModule(String key, boolean isActive) {
                // --- LICENSE CHECK ---
                if (isActive) {
                        com.eduflex.backend.model.LicenseType tier = licenseService.getTier();

                        if (!tier.isModuleAllowed(key)) {
                                throw new RuntimeException("Modulen '" + key + "' ingår inte i din nuvarande licens ("
                                                + tier + "). Uppgradera till PRO eller ENTERPRISE.");
                        }

                        if (!licenseService.isModuleWhitelisted(key)) {
                                throw new RuntimeException("Modulen '" + key
                                                + "' har inaktiverats för din organisation av systemadministratören.");
                        }
                }
                // ---------------------

                SystemModule module = moduleRepository.findByModuleKey(key)
                                .orElseThrow(() -> new RuntimeException("Modul hittades inte: " + key));
                module.setActive(isActive);
                return moduleRepository.save(module);
        }

        @PostConstruct
        public void initModules() {
                logger.info("=== ModuleService: Initializing system modules ===");

                // Ta bort gamla moduler som inte längre används
                moduleRepository.findByModuleKey("QUIZ").ifPresent(moduleRepository::delete);

                // Här definierar vi "App Store"-utbudet som ska finnas vid start
                createIfNotExists("DARK_MODE", "Dark Mode Core", "Globalt mörkt tema för hela plattformen.", "2.4.0",
                                true,
                                false);
                createIfNotExists("QUIZ_BASIC", "QuizRunner Basic", "Skapa och genomför egna quiz (Manuellt).",
                                "1.2.0",
                                true,
                                false);
                createIfNotExists("QUIZ_PRO", "QuizRunner Pro",
                                "Avancerad quizhantering med frågebank och AI-generering.", "2.0.0", true,
                                true);
                createIfNotExists("SUBMISSIONS", "Inlämningar", "Hantera inlämningsuppgifter och bedömning.", "1.0.0",
                                true,
                                false);
                createIfNotExists("FORUM", "Forum (Community)", "Gemensam diskussionsforum med trådar och inlägg.",
                                "1.0.0", true, true);
                createIfNotExists("CHAT", "EduChat Pro", "Realtidskommunikation via WebSockets.", "3.1.0", true, true);
                createIfNotExists("GAMIFICATION", "Gamification Engine",
                                "Belöningssystem: Badges, Achievements, Leaderboards.", "1.1.0", true, false);
                createIfNotExists("ANALYTICS", "Analytics Dashboard", "Systemanalys & datavisualisering.", "2.5.0",
                                true, true);
                createIfNotExists("REVENUE", "Revenue Management", "Prenumerationer, betalningar och fakturering.",
                                "1.0.0", false, true);
                createIfNotExists("SCORM", "SCORM / xAPI Integration",
                                "Importera och kör interaktiva kurspaket (SCORM 1.2).", "1.0.0", false, true);
                createIfNotExists("ENTERPRISE_WHITELABEL", "Enterprise Whitelabel",
                                "Fullt anpassningsbar branding: logotyp, färgtema, favicon och mer. Endast för ENTERPRISE-licens.",
                                "1.0.0", true, true);
                createIfNotExists("AI_QUIZ", "AI Quiz Generator",
                                "Generera quiz-frågor automatiskt från dokument med Google Gemini AI. Kräver PRO eller ENTERPRISE.",
                                "1.0.0", false, true);
                createIfNotExists("AI_TUTOR", "AI Tutor (RAG)",
                                "AI-driven studiecoach som svarar på frågor baserat på kursmaterial. Kräver PRO eller ENTERPRISE.",
                                "1.0.0", false, true);

                createIfNotExists("EDUGAME", "EduGame Core",
                                "Avancerad spelmotor med quests, shop och sociala funktioner. Kräver Gamification Engine.",
                                "1.0.0", false, true);

                createIfNotExists("WELLBEING_CENTER", "Well-being Center",
                                "Konfidentiell kontaktmodul för studenter med direktkoppling till hälsoteamet. Strikt tystnadsplikt.",
                                "1.0.0", false, true);

                createIfNotExists("EXAM_INTEGRITY_PRO", "Exam Integrity Pro",
                                "Avancerad tentavakt med fokus-detektering och LiveKit-proctoring. Kräver PRO eller ENTERPRISE.",
                                "1.0.0", false, true);

                logger.info("=== ModuleService: Module initialization complete. Total modules: {} ===",
                                moduleRepository.count());
        }

        private void createIfNotExists(String key, String name, String desc, String ver, boolean active, boolean lic) {
                if (moduleRepository.findByModuleKey(key).isEmpty()) {
                        logger.info("Creating new module: {}", key);
                        moduleRepository.save(new SystemModule(key, name, desc, ver, active, lic));
                } else {
                        logger.debug("Module already exists: {}", key);
                }
        }
}