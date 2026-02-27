package com.eduflex.backend.repository;

import com.eduflex.backend.model.Ebook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EbookRepository extends JpaRepository<Ebook, Long> {
    List<Ebook> findByCategory(String category);

    List<Ebook> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(String title, String author);

    List<Ebook> findByCoursesId(Long courseId);
}
