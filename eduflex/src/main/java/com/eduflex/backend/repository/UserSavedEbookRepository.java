package com.eduflex.backend.repository;

import com.eduflex.backend.model.Ebook;
import com.eduflex.backend.model.User;
import com.eduflex.backend.model.UserSavedEbook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSavedEbookRepository extends JpaRepository<UserSavedEbook, Long> {
    List<UserSavedEbook> findByUser(User user);

    Optional<UserSavedEbook> findByUserAndEbook(User user, Ebook ebook);

    boolean existsByUserAndEbook(User user, Ebook ebook);

    void deleteByUserAndEbook(User user, Ebook ebook);
}
