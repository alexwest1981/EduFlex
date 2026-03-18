package com.eduflex.backend.repository;

import com.eduflex.backend.model.Language;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LanguageRepository extends JpaRepository<Language, Long> {
    Optional<Language> findByCode(String code);

    List<Language> findByIsEnabledTrue();
}
