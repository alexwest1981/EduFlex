package com.eduflex.backend.service;

import com.eduflex.backend.model.Language;
import com.eduflex.backend.repository.LanguageRepository;
import com.eduflex.backend.service.ai.GeminiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;

@Service
public class LanguageService {

    private static final Logger logger = LoggerFactory.getLogger(LanguageService.class);

    @Autowired
    private LanguageRepository repository;

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private MinioStorageService storageService;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${eduflex.frontend.path:../frontend/src}")
    private String frontendPath;

    public List<Language> getAllLanguages() {
        return repository.findAll();
    }

    public List<Language> getEnabledLanguages() {
        return repository.findByIsEnabledTrue();
    }

    @Transactional
    public Language addLanguage(String code, String name, String nativeName, String flagIcon) {
        if (repository.findByCode(code).isPresent()) {
            throw new RuntimeException("Language already exists: " + code);
        }

        Language language = Language.builder()
                .code(code)
                .name(name)
                .nativeName(nativeName)
                .flagIcon(flagIcon)
                .isEnabled(true)
                .isDefault(false)
                .build();

        // Trigger AI Translation before saving
        translateAllFilesForLanguage(code);

        return repository.save(language);
    }

    @Transactional
    public void deleteLanguage(String code) {
        if (code.equals("sv"))
            throw new RuntimeException("Cannot delete primary language (Swedish)");
        repository.findByCode(code).ifPresent(repository::delete);
    }

    @Transactional
    public void toggleLanguage(String code, boolean enabled) {
        repository.findByCode(code).ifPresent(l -> {
            l.setEnabled(enabled);
            repository.save(l);
        });
    }

    @Transactional
    public void syncAllEnabledLanguages() {
        logger.info("Starting global language sync for all enabled languages.");
        List<Language> enabledLanguages = repository.findByIsEnabledTrue();
        for (Language lang : enabledLanguages) {
            translateAllFilesForLanguage(lang.getCode());
        }
    }

    private void translateAllFilesForLanguage(String targetCode) {
        logger.info("Starting AI translation for language: {}", targetCode);

        List<File> svFiles = findSvFiles(new File(frontendPath));
        for (File svFile : svFiles) {
            try {
                String content = Files.readString(svFile.toPath());
                String moduleName = determineModuleName(svFile);

                logger.info("Translating module: {} for language: {}", moduleName, targetCode);

                String translatedJson;
                if (targetCode.equals("sv") || targetCode.equals("sv2")) {
                    translatedJson = content; // Source is Swedish
                } else if (svFile.getName().equals("translation.json") && content.length() > 5000) {
                    translatedJson = translateLargeJson(content, targetCode);
                } else {
                    String prompt = String.format(
                            "You are a professional software translator. Translate the values in this JSON from Swedish (sv) to %s. "
                                    +
                                    "Keep all keys exactly as they are. Keep variables like {{name}} intact. " +
                                    "Return only the valid JSON result.",
                            targetCode);
                    translatedJson = geminiService.generateJsonContent(prompt + "\n\n" + content);
                    translatedJson = stripMarkdown(translatedJson);
                }

                // 1. SAVE TO MINIO
                String minioKey = String.format("locales/%s/%s.json", targetCode, moduleName);
                byte[] bytes = translatedJson.getBytes(java.nio.charset.StandardCharsets.UTF_8);
                try (java.io.ByteArrayInputStream is = new java.io.ByteArrayInputStream(bytes)) {
                    storageService.save(is, "application/json", minioKey, minioKey);
                }

                // 2. SAVE TO FILESYSTEM (Dev Sync)
                String targetPath = determineTargetPath(svFile, targetCode);
                File targetFile = new File(targetPath);
                if (targetFile.getParentFile().exists() || targetFile.getParentFile().mkdirs()) {
                    Files.writeString(targetFile.toPath(), translatedJson);
                }

            } catch (Exception e) {
                logger.error("Failed to translate file: {}", svFile.getAbsolutePath(), e);
            }
        }
    }

    private String translateLargeJson(String content, String targetCode) throws Exception {
        com.fasterxml.jackson.databind.JsonNode rootNode = objectMapper.readTree(content);
        com.fasterxml.jackson.databind.node.ObjectNode resultNode = objectMapper.createObjectNode();

        if (rootNode.isObject()) {
            java.util.Iterator<java.util.Map.Entry<String, com.fasterxml.jackson.databind.JsonNode>> fields = rootNode
                    .fields();
            while (fields.hasNext()) {
                java.util.Map.Entry<String, com.fasterxml.jackson.databind.JsonNode> field = fields.next();
                String key = field.getKey();
                String valueString = objectMapper.writeValueAsString(field.getValue());

                logger.info("Translating chunk: {} for language: {}", key, targetCode);

                String prompt = String.format(
                        "You are a professional software translator. Translate the values in this JSON chunk (sub-part of a larger file) from Swedish (sv) to %s. "
                                +
                                "Keep all keys exactly as they are. Keep variables like {{name}} intact. " +
                                "Return ONLY the valid JSON result for this specific chunk.",
                        targetCode);

                String translatedChunk = geminiService
                        .generateJsonContent(prompt + "\n\n{\"" + key + "\": " + valueString + "}");
                translatedChunk = stripMarkdown(translatedChunk);

                try {
                    com.fasterxml.jackson.databind.JsonNode chunkNode = objectMapper.readTree(translatedChunk);
                    if (chunkNode.has(key)) {
                        resultNode.set(key, chunkNode.get(key));
                    } else {
                        // Sometimes AI returns only the content of the field without the key
                        resultNode.set(key, chunkNode);
                    }
                } catch (Exception e) {
                    logger.error("Failed to parse translated chunk for key: {}", key, e);
                    // Fallback: put empty object or placeholder to maintain valid JSON
                    resultNode.set(key, field.getValue());
                }
            }
        }
        return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(resultNode);
    }

    private String determineModuleName(File svFile) {
        if (svFile.getName().equals("translation.json"))
            return "translation";
        return svFile.getParentFile().getParentFile().getName();
    }

    public String getTranslationsFromMinio(String lang, String module) {
        String key = String.format("locales/%s/%s.json", lang, module);
        try (java.io.InputStream is = storageService.load(key)) {
            return new String(is.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            logger.warn("Could not load translations from MinIO for {}/{}: {}", lang, module, e.getMessage());
            return null;
        }
    }

    private List<File> findSvFiles(File dir) {
        List<File> results = new ArrayList<>();
        if (!dir.exists() || !dir.isDirectory())
            return results;

        File[] files = dir.listFiles();
        if (files == null)
            return results;

        for (File file : files) {
            if (file.isDirectory()) {
                results.addAll(findSvFiles(file));
            } else if (file.getName().equals("sv.json")
                    || (file.getName().equals("translation.json") && file.getParentFile().getName().equals("sv"))) {
                results.add(file);
            }
        }
        return results;
    }

    private String stripMarkdown(String content) {
        if (content == null)
            return null;
        content = content.trim();
        // Regex to find content inside ```json ... ``` or ``` ... ```
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("(?s)```(?:json)?\\s*(.*?)\\s*```");
        java.util.regex.Matcher matcher = pattern.matcher(content);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        return content;
    }

    private String determineTargetPath(File svFile, String targetCode) {
        String path = svFile.getAbsolutePath();
        if (svFile.getName().equals("sv.json")) {
            return path.replace("sv.json", targetCode + ".json");
        } else {
            return path.replace(File.separator + "sv" + File.separator, File.separator + targetCode + File.separator);
        }
    }
}
