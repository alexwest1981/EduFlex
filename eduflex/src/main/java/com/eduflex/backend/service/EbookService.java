package com.eduflex.backend.service;

import com.eduflex.backend.model.Ebook;
import com.eduflex.backend.repository.EbookRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.eduflex.backend.service.reader.PdfBookContent;
import org.springframework.util.StreamUtils;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import com.eduflex.backend.model.*;
import com.eduflex.backend.repository.*;

@Service
@Transactional
public class EbookService {

    private final EbookRepository ebookRepository;
    private final StorageService storageService;
    private final com.eduflex.backend.repository.CourseRepository courseRepository;
    private final org.springframework.web.client.RestTemplate restTemplate;
    private final com.eduflex.backend.service.ai.TtsService ttsService;
    private final com.eduflex.backend.repository.UserEbookProgressRepository progressRepository;
    private final com.eduflex.backend.repository.UserSavedEbookRepository savedEbookRepository;

    public EbookService(EbookRepository ebookRepository, StorageService storageService,
            com.eduflex.backend.repository.CourseRepository courseRepository,
            com.eduflex.backend.service.ai.TtsService ttsService,
            com.eduflex.backend.repository.UserEbookProgressRepository progressRepository,
            com.eduflex.backend.repository.UserSavedEbookRepository savedEbookRepository) {
        this.ebookRepository = ebookRepository;
        this.storageService = storageService;
        this.courseRepository = courseRepository;
        this.ttsService = ttsService;
        this.progressRepository = progressRepository;
        this.savedEbookRepository = savedEbookRepository;
        this.restTemplate = new org.springframework.web.client.RestTemplate();
    }

    public List<Ebook> getAllEbooks() {
        return ebookRepository.findAll();
    }

    public Ebook getEbookById(Long id) {
        return ebookRepository.findById(id).orElseThrow(() -> new RuntimeException("E-book not found"));
    }

    public Ebook uploadEbook(String title, String author, String description, String category, String language,
            String isbn,
            MultipartFile file, MultipartFile cover, List<Long> courseIds) {
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
        ebook.setIsbn(isbn);

        // Detect type
        String fileName = file.getOriginalFilename().toLowerCase();
        if (fileName.endsWith(".mp3") || fileName.endsWith(".m4b")) {
            ebook.setType(com.eduflex.backend.model.BookType.AUDIO);
        } else if (fileName.endsWith(".pdf")) {
            ebook.setType(com.eduflex.backend.model.BookType.PDF);
        } else {
            ebook.setType(com.eduflex.backend.model.BookType.EPUB);
        }

        if (courseIds != null && !courseIds.isEmpty()) {
            List<com.eduflex.backend.model.Course> courses = courseRepository.findAllById(courseIds);
            ebook.setCourses(new java.util.HashSet<>(courses));
        }

        // Auto-generate cover if not provided
        if (coverUrl == null && file != null) {
            try {
                // We need to read the file again, but InputStream is consumed.
                // Since StorageService saved it, we can load it back using storageId.
                try (InputStream is = storageService.load(storageId)) {
                    byte[] coverBytes = extractAndSaveCover(ebook, is, fileName);
                    if (coverBytes != null && coverBytes.length > 0) {
                        // extraction saves it and updates ebook object
                    }
                }
            } catch (Exception e) {
                logger.error("Failed to auto-extract cover for ebook: {}", title, e);
            }
        }

        return ebookRepository.save(ebook);
    }

    public Ebook updateEbook(Long id, String title, String author, String description, String category,
            String language, String isbn, List<Long> courseIds) {
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
        if (isbn != null)
            ebook.setIsbn(isbn);

        if (courseIds != null) {
            List<com.eduflex.backend.model.Course> courses = courseRepository.findAllById(courseIds);
            ebook.setCourses(new java.util.HashSet<>(courses));
        }

        return ebookRepository.save(ebook);
    }

    public void deleteEbook(Long id) {
        ebookRepository.deleteById(id);
    }

    public List<Ebook> searchEbooks(String query) {
        return ebookRepository.findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(query, query);
    }

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(EbookService.class);

    public Map<String, Object> fetchMetadataByIsbn(String isbn) {
        // Sanitize ISBN: remove hyphens and spaces
        String cleanIsbn = isbn.replaceAll("[^0-9X]", "");
        String url = "https://www.googleapis.com/books/v1/volumes?q=isbn:" + cleanIsbn;

        logger.info("Fetching metadata for ISBN: {} (Original: {}) from {}", cleanIsbn, isbn, url);
        Map<String, Object> result = new HashMap<>();

        try {
            Map<?, ?> response = restTemplate.getForObject(url, Map.class);
            logger.info("Google Books response: {}", response);
            if (response != null && response.containsKey("items")) {
                List<?> items = (List<?>) response.get("items");
                if (!items.isEmpty()) {
                    Map<?, ?> item = (Map<?, ?>) items.get(0);
                    Map<?, ?> volumeInfo = (Map<?, ?>) item.get("volumeInfo");

                    if (volumeInfo != null) {
                        result.put("title", volumeInfo.get("title"));

                        if (volumeInfo.containsKey("authors")) {
                            List<?> authors = (List<?>) volumeInfo.get("authors");
                            if (authors != null) {
                                result.put("author", String.join(", ", authors.stream().map(Object::toString)
                                        .collect(java.util.stream.Collectors.toList())));
                            }
                        }

                        result.put("description", volumeInfo.get("description"));

                        if (volumeInfo.containsKey("categories")) {
                            List<?> categories = (List<?>) volumeInfo.get("categories");
                            if (categories != null && !categories.isEmpty()) {
                                result.put("category", categories.get(0));
                            }
                        }

                        result.put("language", volumeInfo.get("language"));
                    }
                }
            } else if (response != null && response.containsKey("totalItems")
                    && ((Integer) response.get("totalItems")) == 0) {
                logger.warn("No items found in Google Books response for ISBN: {}", cleanIsbn);
            }
        } catch (Exception e) {
            logger.error("Failed to fetch metadata from Google Books", e);
            throw new RuntimeException("Failed to fetch metadata from Google Books: " + e.getMessage(), e);
        }

        if (result.isEmpty()) {
            throw new RuntimeException("No book found for ISBN: " + cleanIsbn);
        }

        return result;
    }

    public Map<String, Object> getEbookMetadata(Long id) {
        Ebook ebook = getEbookById(id);
        String storageId = ebook.getFileUrl().substring(ebook.getFileUrl().lastIndexOf("/") + 1);

        logger.info("Fetching metadata for ebook ID: {}, Storage ID: {}, URL: {}", id, storageId, ebook.getFileUrl());

        try (InputStream inputStream = storageService.load(storageId);
                PdfBookContent content = new PdfBookContent(inputStream)) {

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("title", content.getTitle());
            metadata.put("author", content.getAuthor());
            metadata.put("pageCount", content.getPageCount());
            metadata.put("chapters", content.getChapters());

            return metadata;
        } catch (Exception e) {
            logger.error("Failed to load ebook metadata for ID: {}", id, e);
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

    public byte[] getEbookCover(Long id) {
        Ebook ebook = getEbookById(id);
        String coverUrl = ebook.getCoverUrl();

        // 1. If cover already exists (and is a local storage path), try to load it
        if (coverUrl != null && (coverUrl.contains("/api/storage/") || coverUrl.contains("/uploads/"))) {
            String storageId = extractStorageId(coverUrl);
            try (InputStream is = storageService.load(storageId)) {
                return StreamUtils.copyToByteArray(is);
            } catch (Exception e) {
                logger.warn("Failed to load existing cover for book {} from {}: {}", id, storageId, e.getMessage());
                // Failed to load existing cover, try to extract again
            }
        }

        // 2. Extract cover from file based on type (Fallback if not extracted on
        // upload)
        byte[] coverBytes = null;
        String fileUrl = ebook.getFileUrl();
        if (fileUrl != null) {
            String fileStorageId = extractStorageId(fileUrl);
            try (InputStream inputStream = storageService.load(fileStorageId)) {
                String fileName = ebook.getFileUrl().substring(ebook.getFileUrl().lastIndexOf("/") + 1);
                coverBytes = extractAndSaveCover(ebook, inputStream, fileName);
                if (coverBytes != null)
                    return coverBytes;
            } catch (Exception e) {
                logger.error("Failed to extract cover from file for book {}: {}", id, e.getMessage());
            }
        }

        // 4. Ultimate Fallback: Return a default image based on type metadata
        return getFallbackCover(ebook.getType());
    }

    private String extractStorageId(String url) {
        if (url == null)
            return null;
        String[] prefixes = { "/api/storage/", "/uploads/", "/api/files/fetch?filename=" };
        for (String prefix : prefixes) {
            int index = url.indexOf(prefix);
            if (index != -1) {
                return url.substring(index + prefix.length());
            }
        }
        // Fallback to last part of path
        return url.substring(url.lastIndexOf("/") + 1);
    }

    private byte[] getFallbackCover(com.eduflex.backend.model.BookType type) {
        // Return a simple 1x1 transparent PNG or a small colored square as fallback
        // In a real scenario, this would load a default-cover.png from resources
        try {
            // Minimal valid 1x1 transparent PNG
            return java.util.Base64.getDecoder().decode(
                    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=");
        } catch (Exception e) {
            return new byte[0];
        }
    }

    private byte[] extractEpubCover(InputStream epubStream) throws Exception {
        byte[] epubBytes = StreamUtils.copyToByteArray(epubStream);

        try (java.util.zip.ZipInputStream zip = new java.util.zip.ZipInputStream(
                new java.io.ByteArrayInputStream(epubBytes))) {
            java.util.zip.ZipEntry entry;
            String opfPath = null;

            // 1. Find OPF path
            while ((entry = zip.getNextEntry()) != null) {
                if (entry.getName().equals("META-INF/container.xml")) {
                    byte[] containerBytes = StreamUtils.copyToByteArray(zip);
                    String xml = new String(containerBytes, java.nio.charset.StandardCharsets.UTF_8);
                    int start = xml.indexOf("full-path=\"");
                    if (start != -1) {
                        int end = xml.indexOf("\"", start + 11);
                        opfPath = xml.substring(start + 11, end);
                    }
                    break;
                }
            }

            if (opfPath != null) {
                // 2. Read OPF
                try (java.util.zip.ZipInputStream zip2 = new java.util.zip.ZipInputStream(
                        new java.io.ByteArrayInputStream(epubBytes))) {
                    String coverHref = null;
                    String opfDir = opfPath.contains("/") ? opfPath.substring(0, opfPath.lastIndexOf("/") + 1) : "";

                    while ((entry = zip2.getNextEntry()) != null) {
                        if (entry.getName().equals(opfPath)) {
                            byte[] opfBytes = StreamUtils.copyToByteArray(zip2);
                            String opfXml = new String(opfBytes, java.nio.charset.StandardCharsets.UTF_8);

                            // Strategy A: properties="cover-image"
                            if (opfXml.contains("properties=\"cover-image\"")) {
                                java.util.regex.Pattern p = java.util.regex.Pattern
                                        .compile("<item[^>]*href=\"([^\"]+)\"[^>]*properties=\"cover-image\"");
                                java.util.regex.Matcher m = p.matcher(opfXml);
                                if (m.find()) {
                                    coverHref = m.group(1);
                                } else {
                                    // Try reverse attr order
                                    java.util.regex.Pattern pRev = java.util.regex.Pattern
                                            .compile("<item[^>]*properties=\"cover-image\"[^>]*href=\"([^\"]+)\"");
                                    java.util.regex.Matcher mRev = pRev.matcher(opfXml);
                                    if (mRev.find())
                                        coverHref = mRev.group(1);
                                }
                            }

                            // Strategy B: meta name="cover"
                            if (coverHref == null) {
                                java.util.regex.Pattern pMeta = java.util.regex.Pattern
                                        .compile("<meta\\s+name=\"cover\"\\s+content=\"([^\"]+)\"");
                                java.util.regex.Matcher mMeta = pMeta.matcher(opfXml);
                                if (mMeta.find()) {
                                    String coverId = mMeta.group(1);
                                    // Find item with id
                                    java.util.regex.Pattern pItem = java.util.regex.Pattern.compile("<item[^>]*id=\""
                                            + java.util.regex.Pattern.quote(coverId) + "\"[^>]*href=\"([^\"]+)\"");
                                    java.util.regex.Matcher mItem = pItem.matcher(opfXml);
                                    if (mItem.find())
                                        coverHref = mItem.group(1);
                                }
                            }
                            break;
                        }
                    }

                    if (coverHref != null) {
                        String fullCoverPath = opfDir + coverHref;
                        logger.info("Found EPUB cover at: {}", fullCoverPath);
                        try (java.util.zip.ZipInputStream zip3 = new java.util.zip.ZipInputStream(
                                new java.io.ByteArrayInputStream(epubBytes))) {
                            while ((entry = zip3.getNextEntry()) != null) {
                                if (entry.getName().equals(fullCoverPath)) {
                                    return StreamUtils.copyToByteArray(zip3);
                                }
                            }
                        }
                    }
                }
            }
        }

        // Strategy C: Common filenames fallback
        logger.info("Metadata extraction failed, trying fallback filenames...");
        String[] commonNames = { "cover.jpg", "cover.jpeg", "cover.png", "OEBPS/cover.jpg", "OPS/cover.jpg",
                "images/cover.jpg" };
        try (java.util.zip.ZipInputStream zipFallback = new java.util.zip.ZipInputStream(
                new java.io.ByteArrayInputStream(epubBytes))) {
            java.util.zip.ZipEntry entry;
            while ((entry = zipFallback.getNextEntry()) != null) {
                for (String name : commonNames) {
                    if (entry.getName().equalsIgnoreCase(name)) {
                        logger.info("Found fallback cover: {}", entry.getName());
                        return StreamUtils.copyToByteArray(zipFallback);
                    }
                }
            }
        }

        logger.warn("No cover found in EPUB.");
        return null;
    }

    public byte[] getTtsForChapter(Long ebookId, String text) {
        Ebook ebook = getEbookById(ebookId);
        logger.info("Generating AI TTS for book: {}", ebook.getTitle());
        // Simplified: Generate and return bytes.
        // In a real scenario, we'd hash the text and check MinIO/Local if we already
        // have it.
        return ttsService.generateSpeech(text, "nova");
    }

    public Ebook regenerateAudiobook(Long ebookId) {
        Ebook ebook = getEbookById(ebookId);
        if (ebook.getType() != com.eduflex.backend.model.BookType.AUDIO) {
            throw new RuntimeException("Book is not an audiobook");
        }

        logger.info("Regenerating audio for book: {}", ebook.getTitle());

        // 1. Determine text to synthesize (Description if available, else title)
        String textToSynthesize = ebook.getDescription();
        if (textToSynthesize == null || textToSynthesize.trim().isEmpty()) {
            textToSynthesize = "Detta är en ljudbok med titeln " + ebook.getTitle();
        }

        // 2. Generate audio
        byte[] audioBytes = ttsService.generateSpeech(textToSynthesize, "nova");

        // 3. Save to Storage (MinIO)
        String fileName = ebook.getTitle().replaceAll("[^a-zA-Z0-9]", "_") + ".mp3";
        String customId = "audiobooks/" + java.util.UUID.randomUUID().toString() + ".mp3";

        String storageId = storageService.save(
                new java.io.ByteArrayInputStream(audioBytes),
                "audio/mpeg",
                fileName,
                customId);

        // 4. Update Ebook record
        ebook.setFileUrl("/api/storage/" + storageId);
        return ebookRepository.save(ebook);
    }

    private byte[] extractAndSaveCover(Ebook ebook, InputStream inputStream, String fileName) {
        byte[] coverBytes = null;
        String contentType = "image/png";

        try {
            if (fileName.toLowerCase().endsWith(".pdf")) {
                try (PdfBookContent content = new PdfBookContent(inputStream)) {
                    String base64Cover = content.getCoverImage();
                    if (base64Cover != null && base64Cover.contains(",")) {
                        String base64Data = base64Cover.split(",")[1];
                        coverBytes = java.util.Base64.getDecoder().decode(base64Data);
                    }
                }
            } else if (fileName.toLowerCase().endsWith(".epub")) {
                coverBytes = extractEpubCover(inputStream);
                contentType = "image/jpeg";
            }
            // Add other types here
        } catch (Exception e) {
            logger.error("Error generating cover for {}: {}", ebook.getTitle(), e.getMessage());
        }

        if (coverBytes != null && coverBytes.length > 0) {
            try {
                String extension = contentType.equals("image/png") ? ".png" : ".jpg";
                String customId = "library/covers/cover-" + ebook.getId() + "-" + System.currentTimeMillis()
                        + extension;
                String coverStorageId = storageService.save(new java.io.ByteArrayInputStream(coverBytes),
                        contentType, "cover" + extension, customId);

                ebook.setCoverUrl("/api/storage/" + coverStorageId);
                // We don't save ebook here if called from uploadEbook (as it saves later),
                // but if called from getEbookCover we might need to save.
                // However, Java objects are references.
                // getEbookCover explicitly calls save.
                // uploadEbook calls save at the end.
                // So we are good.
                return coverBytes;
            } catch (Exception e) {
                logger.error("Failed to save extracted cover: {}", e.getMessage());
            }
        }
        return null;
    }

    public com.eduflex.backend.model.UserEbookProgress getProgress(Long ebookId, com.eduflex.backend.model.User user) {
        return progressRepository.findByUserIdAndEbookId(user.getId(), ebookId)
                .orElse(new com.eduflex.backend.model.UserEbookProgress(user, getEbookById(ebookId)));
    }

    public com.eduflex.backend.model.UserEbookProgress saveProgress(Long ebookId, com.eduflex.backend.model.User user,
            Map<String, Object> progressData) {
        if (ebookId == null || user == null) {
            throw new IllegalArgumentException("Ebook ID and User must not be null");
        }

        com.eduflex.backend.model.UserEbookProgress progress = progressRepository
                .findByUserIdAndEbookId(user.getId(), ebookId)
                .orElseGet(() -> {
                    com.eduflex.backend.model.UserEbookProgress p = new com.eduflex.backend.model.UserEbookProgress();
                    p.setUser(user);
                    p.setEbook(getEbookById(ebookId));
                    return p;
                });

        if (progressData.containsKey("lastLocation") && progressData.get("lastLocation") != null)
            progress.setLastLocation(progressData.get("lastLocation").toString());

        if (progressData.containsKey("lastPage") && progressData.get("lastPage") != null) {
            try {
                progress.setLastPage(Integer.valueOf(progressData.get("lastPage").toString()));
            } catch (NumberFormatException e) {
                logger.warn("Invalid lastPage value: {}", progressData.get("lastPage"));
            }
        }

        if (progressData.containsKey("lastTimestamp") && progressData.get("lastTimestamp") != null) {
            try {
                progress.setLastTimestamp(Double.valueOf(progressData.get("lastTimestamp").toString()));
            } catch (NumberFormatException e) {
                logger.warn("Invalid lastTimestamp value: {}", progressData.get("lastTimestamp"));
            }
        }

        if (progressData.containsKey("percentage") && progressData.get("percentage") != null) {
            try {
                progress.setPercentage(Double.valueOf(progressData.get("percentage").toString()));
            } catch (NumberFormatException e) {
                logger.warn("Invalid percentage value: {}", progressData.get("percentage"));
            }
        }

        return progressRepository.save(progress);
    }

    public List<Ebook> getSavedEbooks(User user) {
        return savedEbookRepository.findByUser(user).stream()
                .map(UserSavedEbook::getEbook)
                .collect(java.util.stream.Collectors.toList());
    }

    public List<Long> getSavedEbookIds(User user) {
        return savedEbookRepository.findByUser(user).stream()
                .map(saved -> saved.getEbook().getId())
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public boolean toggleSaved(Long ebookId, User user) {
        Ebook ebook = ebookRepository.findById(ebookId)
                .orElseThrow(() -> new RuntimeException("Ebook not found"));

        Optional<UserSavedEbook> existing = savedEbookRepository.findByUserAndEbook(user, ebook);
        if (existing.isPresent()) {
            savedEbookRepository.delete(existing.get());
            return false;
        } else {
            savedEbookRepository.save(new UserSavedEbook(user, ebook));
            return true;
        }
    }
}
