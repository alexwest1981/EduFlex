package com.eduflex.backend.repository;

import com.eduflex.backend.model.SystemModule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ModuleRepository extends JpaRepository<SystemModule, Long> {
    Optional<SystemModule> findByModuleKey(String moduleKey);
}