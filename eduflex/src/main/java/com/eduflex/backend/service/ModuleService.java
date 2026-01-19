package com.eduflex.backend.service;

import com.eduflex.backend.model.SystemModule;
import com.eduflex.backend.repository.ModuleRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ModuleService {

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
                if (isActive && !licenseService.getTier().isModuleAllowed(key)) {
                        throw new RuntimeException("Modulen '" + key + "' ingår inte i din nuvarande licens ("
                                        + licenseService.getTier() + "). Uppgradera till PRO eller ENTERPRISE.");
                }
                // ---------------------

                SystemModule module = moduleRepository.findByModuleKey(key)
                                .orElseThrow(() -> new RuntimeException("Modul hittades inte: " + key));
                module.setActive(isActive);
                return moduleRepository.save(module);
        }

        @PostConstruct
        public void initModules() {
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
        }

        private void createIfNotExists(String key, String name, String desc, String ver, boolean active, boolean lic) {
                if (moduleRepository.findByModuleKey(key).isEmpty()) {
                        moduleRepository.save(new SystemModule(key, name, desc, ver, active, lic));
                }
        }
}