package com.eduflex.backend.service;

import com.eduflex.backend.model.SystemModule;
import com.eduflex.backend.repository.ModuleRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ModuleService {

    private final ModuleRepository moduleRepository;

    public ModuleService(ModuleRepository moduleRepository) {
        this.moduleRepository = moduleRepository;
    }

    public List<SystemModule> getAllModules() {
        return moduleRepository.findAll();
    }

    public SystemModule toggleModule(String key, boolean isActive) {
        SystemModule module = moduleRepository.findByModuleKey(key)
                .orElseThrow(() -> new RuntimeException("Modul hittades inte: " + key));
        module.setActive(isActive);
        return moduleRepository.save(module);
    }

    @PostConstruct
    public void initModules() {
        // Här definierar vi "App Store"-utbudet som ska finnas vid start
        createIfNotExists("DARK_MODE", "Dark Mode Core", "Globalt mörkt tema för hela plattformen.", "2.4.0", true,
                false);
        createIfNotExists("QUIZ", "QuizRunner Pro", "Skapa och genomför diagnostiska prov och tester.", "1.2.0", true,
                false);
        createIfNotExists("SUBMISSIONS", "Inlämningar", "Hantera inlämningsuppgifter och bedömning.", "1.0.0", true,
                false);
        createIfNotExists("FORUM", "EduForum", "Diskussionsforum för kurser med trådar och svar.", "2.0.1", true,
                false);
        createIfNotExists("CHAT", "EduChat Pro", "Realtidskommunikation via WebSockets.", "3.1.0", true, true);
        createIfNotExists("GAMIFICATION", "Gamification Engine",
                "Engagera studenter med poäng, levlar och utmärkelser.", "1.5.0", true, false);
        createIfNotExists("ANALYTICS", "Investor Insights", "Extensive system analysis and financial reporting.",
                "1.0.0", true, true);
    }

    private void createIfNotExists(String key, String name, String desc, String ver, boolean active, boolean lic) {
        if (moduleRepository.findByModuleKey(key).isEmpty()) {
            moduleRepository.save(new SystemModule(key, name, desc, ver, active, lic));
        }
    }
}