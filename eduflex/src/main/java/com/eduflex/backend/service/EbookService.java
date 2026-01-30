package com.eduflex.backend.service;

import com.eduflex.backend.model.Ebook;
import com.eduflex.backend.repository.EbookRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.eduflex.backend.service.reader.PdfBookContent;
import org.springframework.util.StreamUtils;

import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class EbookService {

    private final EbookRepository ebookRepository;
    private final StorageService storageService;

    public EbookService(EbookRepository ebookRepository, StorageService storageService) {
        this.ebookRepository = ebookRepository;
        this.storageService = storageService;
    }

    public List<Ebook> getAllEbooks() {
        return ebookRepository.findAll();
    }

    public Ebook getEbookById(Long id) {
        return ebookRepository.findById(id).orElseThrow(() -> new RuntimeException("E-book not found"));
    }

    public Ebook uploadEbook(String title, String author, String description, String category, String language,
            MultipartFile file, MultipartFile cover) {
        String storageId = storageService.save(file);
        String fileUrl = "/api/storage/" + storageId;

        String coverUrl = null;
        if (cover != null && !cover.isEmpty()) {
            String coverStorageId = storageService.save(cover);
            coverUrl = "/api/storage/" + coverStorageId;
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

    public Map<String, Object> getEbookMetadata(Long id) {
        Ebook ebook = getEbookById(id);
        String storageId = ebook.getFileUrl().substring(ebook.getFileUrl().lastIndexOf("/") + 1);

        try (InputStream inputStream = storageService.load(storageId);
                PdfBookContent content = new PdfBookContent(inputStream)) {

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("title", content.getTitle());
            metadata.put("author", content.getAuthor());
            metadata.put("pageCount", content.getPageCount());
            metadata.put("chapters", content.getChapters());

            return metadata;
        } catch (Exception e) {
            throw new RuntimeException("Failed to load ebook metadata", e);
        }
    }

    public byte[] getEbookPage(Long id, int pageNumber) {
        Ebook ebook = getEbookById(id);
        String storageId = ebook.getFileUrl().substring(ebook.getFileUrl().lastIndexOf("/") + 1);

        try (InputStream inputStream = storageService.load(storageId);
                PdfBookContent content = new PdfBookContent(inputStream)) {

            InputStream pageImage = content.getPageImage(pageNumber);
            return StreamUtils.copyToByteArray(pageImage);
        } catch (Exception e) {
            throw new RuntimeException("Failed to render ebook page", e);
        }
    }
}
