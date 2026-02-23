package com.eduflex.backend.service;

import com.eduflex.backend.model.ArticleType;
import com.eduflex.backend.model.SupportArticle;
import com.eduflex.backend.repository.SupportArticleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SupportArticleService {

    @Autowired
    private SupportArticleRepository repository;

    // Hämtar alla artiklar – för admin-vyn
    public List<SupportArticle> getAll() {
        return repository.findAllByOrderByDisplayOrderAscCreatedAtDesc();
    }

    // Hämtar bara publicerade artiklar – för den publika sidan
    public List<SupportArticle> getPublished() {
        return repository.findAllByIsPublishedTrueOrderByDisplayOrderAsc();
    }

    // Hämtar publicerade av viss typ
    public List<SupportArticle> getPublishedByType(ArticleType type) {
        return repository.findAllByTypeAndIsPublishedTrueOrderByDisplayOrderAsc(type);
    }

    // Skapar en ny artikel
    public SupportArticle create(SupportArticle article) {
        return repository.save(article);
    }

    // Uppdaterar en befintlig artikel
    public SupportArticle update(Long id, SupportArticle updated) {
        SupportArticle existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Support-artikel hittades inte: " + id));

        existing.setTitle(updated.getTitle());
        existing.setContent(updated.getContent());
        existing.setCategory(updated.getCategory());
        existing.setType(updated.getType());
        existing.setVideoUrl(updated.getVideoUrl());
        existing.setDuration(updated.getDuration());
        existing.setThumbnail(updated.getThumbnail());
        existing.setDisplayOrder(updated.getDisplayOrder());
        existing.setIsPublished(updated.getIsPublished());

        return repository.save(existing);
    }

    // Tar bort en artikel
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
