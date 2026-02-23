package com.eduflex.backend.repository;

import com.eduflex.backend.model.ArticleType;
import com.eduflex.backend.model.SupportArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportArticleRepository extends JpaRepository<SupportArticle, Long> {

    // Hämtar publicerade artiklar av viss typ, sorterat på displayOrder
    List<SupportArticle> findAllByTypeAndIsPublishedTrueOrderByDisplayOrderAsc(ArticleType type);

    // Hämtar alla publicerade artiklar (oavsett typ)
    List<SupportArticle> findAllByIsPublishedTrueOrderByDisplayOrderAsc();

    // Hämtar alla oavsett publiceringsstatus (för admin-vyn)
    List<SupportArticle> findAllByOrderByDisplayOrderAscCreatedAtDesc();
}
