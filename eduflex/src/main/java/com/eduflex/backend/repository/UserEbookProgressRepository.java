package com.eduflex.backend.repository;

import com.eduflex.backend.model.UserEbookProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserEbookProgressRepository extends JpaRepository<UserEbookProgress, Long> {
    Optional<UserEbookProgress> findByUserIdAndEbookId(Long userId, Long ebookId);
}
