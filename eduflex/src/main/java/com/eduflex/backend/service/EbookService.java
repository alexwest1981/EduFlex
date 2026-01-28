package com.eduflex.backend.service;

import com.eduflex.backend.model.Ebook;
import com.eduflex.backend.repository.EbookRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@Transactional
public class EbookService {

    private final EbookRepository ebookRepository;
    private final FileStorageService fileStorageService;

    public EbookService(EbookRepository ebookRepository, FileStorageService fileStorageService) {
        this.ebookRepository = ebookRepository;
        this.fileStorageService = fileStorageService;
    }

    public List<Ebook> getAllEbooks() {
        return ebookRepository.findAll();
    }

    public Ebook getEbookById(Long id) {
        return ebookRepository.findById(id).orElseThrow(() -> new RuntimeException("E-book not found"));
    }

    public Ebook uploadEbook(String title, String author, String description, String category, String language,
            MultipartFile file, MultipartFile cover) {
        String fileUrl = fileStorageService.storeFile(file);
        String coverUrl = null;
        if (cover != null && !cover.isEmpty()) {
            coverUrl = fileStorageService.storeFile(cover);
        }

        Ebook ebook = new Ebook();
        ebook.setTitle(title);
        ebook.setAuthor(author);
        ebook.setDescription(description);
        ebook.setCategory(category);
        ebook.setLanguage(language);
        ebook.setFileUrl(fileUrl);
        ebook.setCoverUrl(coverUrl);

        return ebookRepository.save(ebook);
    }

    public Ebook updateEbook(Long id, String title, String author, String description, String category,
            String language) {
        Ebook ebook = getEbookById(id);
        if (title != null)
            ebook.setTitle(title);
        if (author != null)
            ebook.setAuthor(author);
        if (description != null)
            ebook.setDescription(description);
        if (category != null)
            ebook.setCategory(category);
        if (language != null)
            ebook.setLanguage(language);
        return ebookRepository.save(ebook);
    }

    public void deleteEbook(Long id) {
        ebookRepository.deleteById(id);
    }

    public List<Ebook> searchEbooks(String query) {
        return ebookRepository.findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(query, query);
    }
}
