package com.eduflex.backend.repository;

import com.eduflex.backend.model.QuestionBankItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuestionBankRepository extends JpaRepository<QuestionBankItem, Long> {
    List<QuestionBankItem> findByAuthorId(Long authorId);

    List<QuestionBankItem> findByAuthorIdAndCategory(Long authorId, String category);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT q.category FROM QuestionBankItem q WHERE q.author.id = :authorId")
    List<String> findDistinctCategoriesByAuthorId(
            @org.springframework.web.bind.annotation.RequestParam("authorId") Long authorId);
}
