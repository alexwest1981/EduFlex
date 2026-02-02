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
    private final com.eduflex.backend.repository.CourseRepository courseRepository;
    private final org.springframework.web.client.RestTemplate restTemplate;
    private final com.eduflex.backend.service.ai.TtsService ttsService;

    public EbookService(EbookRepository ebookRepository, StorageService storageService,
            com.eduflex.backend.repository.CourseRepository courseRepository,
            com.eduflex.backend.service.ai.TtsService ttsService) {
        this.ebookRepository = ebookRepository;
        this.storageService = storageService;
        this.courseRepository = courseRepository;
        this.ttsService = ttsService;
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

    public byte[] getEbookCover(Long id) {
        Ebook ebook = getEbookById(id);

        // 1. If cover already exists (and is a local storage path), try to load it
        if (ebook.getCoverUrl() != null && ebook.getCoverUrl().startsWith("/api/storage/")) {
            // FIX: Use prefix length instead of lastIndexOf to preserve folder structure
            String prefix = "/api/storage/";
            String storageId = ebook.getCoverUrl().substring(ebook.getCoverUrl().indexOf(prefix) + prefix.length());
            try (InputStream is = storageService.load(storageId)) {
                return StreamUtils.copyToByteArray(is);
            } catch (Exception e) {
                System.err.println("Failed to load existing cover for book " + id + ": " + e.getMessage());
                // Failed to load existing cover, try to extract again
            }
        }

        // 2. Extract cover from file
        // FIX: Handle ID extraction correctly here too
        String fileUrl = ebook.getFileUrl();
        String filePrefix = "/api/storage/";
        String fileStorageId;
        if (fileUrl.startsWith(filePrefix)) {
            fileStorageId = fileUrl.substring(fileUrl.indexOf(filePrefix) + filePrefix.length());
        } else {
            // Fallback for older URLs if any
            fileStorageId = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
        }

        byte[] coverBytes = null;
        String contentType = "image/png";

        try (InputStream inputStream = storageService.load(fileStorageId)) {
            if (ebook.getFileUrl().toLowerCase().endsWith(".pdf")) {
                try (PdfBookContent content = new PdfBookContent(inputStream)) {
                    String base64Cover = content.getCoverImage();
                    if (base64Cover != null) {
                        String base64Data = base64Cover.split(",")[1];
                        coverBytes = java.util.Base64.getDecoder().decode(base64Data);
                    }
                }
            } else if (ebook.getFileUrl().toLowerCase().endsWith(".epub")) {
                coverBytes = extractEpubCover(inputStream);
                contentType = "image/jpeg"; // Usually JPEGs in EPUBs
            }
        } catch (Exception e) {
            System.err
                    .println("Failed to read ebook file for cover extraction (BookID: " + id + "): " + e.getMessage());
            // Don't throw yet, verify if we can return default or throw
            throw new RuntimeException("Failed to read ebook file", e);
        }

        // 3. Save and Cache if found
        if (coverBytes != null && coverBytes.length > 0) {
            try {
                // User requested: library/covers/
                String extension = contentType.equals("image/png") ? ".png" : ".jpg";
                String customId = "library/covers/cover-" + id + "-" + System.currentTimeMillis() + extension;

                String coverStorageId = storageService.save(new java.io.ByteArrayInputStream(coverBytes), contentType,
                        "cover" + extension, customId);
                ebook.setCoverUrl("/api/storage/" + coverStorageId);
                ebookRepository.save(ebook);
                return coverBytes;
            } catch (Exception e) {
                System.err.println("Failed to save extracted cover: " + e.getMessage());
                throw new RuntimeException("Failed to save extracted cover", e);
            }
        }

        throw new RuntimeException("No cover found");
    }

    private byte[] extractEpubCover(InputStream epubStream) throws Exception {
        // Read into memory to allow multiple passes (ZIP input stream can't reset
        // easily)
        // Or unzip to temp. Better: Load entire ZIP into memory map?
        // Simplest: Copy to byte array first.
        byte[] epubBytes = StreamUtils.copyToByteArray(epubStream);

        try (java.util.zip.ZipInputStream zip = new java.util.zip.ZipInputStream(
                new java.io.ByteArrayInputStream(epubBytes))) {
            java.util.zip.ZipEntry entry;
            String opfPath = null;

            // 1. Find OPF path from META-INF/container.xml
            while ((entry = zip.getNextEntry()) != null) {
                if (entry.getName().equals("META-INF/container.xml")) {
                    // Simple parsing
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

            if (opfPath == null)
                return null;

            // 2. Read OPF to find cover image href
            // Need to reopen zip
            try (java.util.zip.ZipInputStream zip2 = new java.util.zip.ZipInputStream(
                    new java.io.ByteArrayInputStream(epubBytes))) {
                String coverHref = null;
                String opfDir = opfPath.contains("/") ? opfPath.substring(0, opfPath.lastIndexOf("/") + 1) : "";

                while ((entry = zip2.getNextEntry()) != null) {
                    if (entry.getName().equals(opfPath)) {
                        byte[] opfBytes = StreamUtils.copyToByteArray(zip2);
                        String opfXml = new String(opfBytes, java.nio.charset.StandardCharsets.UTF_8);

                        // Look for <item properties="cover-image" href="..." />
                        // OR <meta name="cover" content="cover-item-id" /> -> then find item with that
                        // id

                        // Strategy A: properties="cover-image"
                        int propIndex = opfXml.indexOf("properties=\"cover-image\"");
                        if (propIndex != -1) {
                            // Find href in this tag
                            // Search backwards for <item and forwards for >
                            int tagStart = opfXml.lastIndexOf("<item", propIndex);
                            int tagEnd = opfXml.indexOf(">", propIndex);
                            if (tagStart != -1 && tagEnd != -1) {
                                String tag = opfXml.substring(tagStart, tagEnd);
                                int hrefStart = tag.indexOf("href=\"");
                                if (hrefStart != -1) {
                                    int hrefEnd = tag.indexOf("\"", hrefStart + 6);
                                    coverHref = tag.substring(hrefStart + 6, hrefEnd);
                                }
                            }
                        }

                        // Strategy B: meta name="cover"
                        if (coverHref == null) {
                            int metaIndex = opfXml.indexOf("name=\"cover\"");
                            if (metaIndex != -1) {
                                int contentStart = opfXml.indexOf("content=\"", metaIndex); // simplified, assumes order
                                if (contentStart == -1)
                                    contentStart = opfXml.lastIndexOf("content=\"", metaIndex); // could be before

                                // Actually, regex is safer here
                                java.util.regex.Pattern p = java.util.regex.Pattern
                                        .compile("<meta\\s+name=\"cover\"\\s+content=\"([^\"]+)\"");
                                java.util.regex.Matcher m = p.matcher(opfXml);
                                if (m.find()) {
                                    String coverId = m.group(1);
                                    // Now find item with id=coverId
                                    java.util.regex.Pattern p2 = java.util.regex.Pattern.compile("<item\\s+[^>]*id=\""
                                            + java.util.regex.Pattern.quote(coverId) + "\"[^>]*href=\"([^\"]+)\"");
                                    java.util.regex.Matcher m2 = p2.matcher(opfXml);
                                    if (m2.find()) {
                                        coverHref = m2.group(1);
                                    } else {
                                        // Try reverse order attributes
                                        java.util.regex.Pattern p3 = java.util.regex.Pattern
                                                .compile("<item\\s+[^>]*href=\"([^\"]+)\"[^>]*id=\""
                                                        + java.util.regex.Pattern.quote(coverId) + "\"");
                                        java.util.regex.Matcher m3 = p3.matcher(opfXml);
                                        if (m3.find())
                                            coverHref = m3.group(1);
                                    }
                                }
                            }
                        }
                        break;
                    }
                }

                if (coverHref == null)
                    return null;

                // 3. Extract the cover image
                // Href is relative to OPF
                // If coverHref contains URL encoding, decode it? Usually simple files.
                String fullCoverPath = opfDir + coverHref;

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
}
