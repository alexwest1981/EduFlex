package com.eduflex.backend.service.ai;

import com.eduflex.backend.model.CourseMaterial;
import com.eduflex.backend.model.VectorStoreEntry;
import com.eduflex.backend.repository.CourseMaterialRepository;
import com.eduflex.backend.repository.EmbeddingRepository;
import com.eduflex.backend.service.StorageService;

import org.apache.tika.Tika;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AITutorService {

    private static final Logger logger = LoggerFactory.getLogger(AITutorService.class);
    private final GeminiService geminiService;
    private final EmbeddingRepository embeddingRepository;
    private final CourseMaterialRepository materialRepository;
    private final StorageService storageService;
    private final Tika tika = new Tika();

    public AITutorService(GeminiService geminiService,
            EmbeddingRepository embeddingRepository,
            CourseMaterialRepository materialRepository,
            StorageService storageService) {
        this.geminiService = geminiService;
        this.embeddingRepository = embeddingRepository;
        this.materialRepository = materialRepository;
        this.storageService = storageService;
    }

    private static final int CHUNK_SIZE = 1000;
    private static final int OVERLAP = 100;

    @Transactional
    public void ingestMaterial(Long courseId, Long materialId) {
        try {
            logger.info("Ingesting material {} for course {}", materialId, courseId);

            CourseMaterial material = materialRepository.findById(materialId)
                    .orElseThrow(() -> new RuntimeException("Material not found: " + materialId));

            embeddingRepository.deleteBySourceTypeAndSourceId("MATERIAL", materialId);

            StringBuilder fullText = new StringBuilder();
            if (material.getContent() != null && !material.getContent().isBlank()) {
                fullText.append(material.getContent()).append("\n\n");
            }

            if (material.getFileUrl() != null && !material.getFileUrl().isEmpty()) {
                String storageId = material.getFileUrl();
                if (storageId.contains("/api/storage/"))
                    storageId = storageId.substring(storageId.lastIndexOf("/") + 1);
                else if (storageId.contains("/api/files/"))
                    storageId = storageId.substring(storageId.lastIndexOf("/") + 1);

                try (InputStream stream = storageService.load(storageId)) {
                    String fileText = tika.parseToString(stream);
                    if (fileText != null && !fileText.isBlank()) {
                        fullText.append(fileText).append("\n");
                    }
                } catch (Exception e) {
                    logger.warn("Failed to extract text from material {}: {}", materialId, e.getMessage());
                }
            }

            String text = fullText.toString().trim();
            if (text.isEmpty()) {
                logger.warn("No content to index for material {}", materialId);
                return;
            }

            List<String> chunks = splitText(text);

            for (String chunk : chunks) {
                List<Double> vector = geminiService.generateEmbedding(chunk);
                Double[] vectorArray = vector.toArray(new Double[0]);

                VectorStoreEntry embedding = new VectorStoreEntry();
                embedding.setCourseId(courseId);
                embedding.setSourceType("MATERIAL");
                embedding.setSourceId(materialId);
                embedding.setSourceTitle(material.getTitle());
                embedding.setTextChunk(chunk);
                embedding.setEmbeddingVector(vectorArray);

                embeddingRepository.save(embedding);
            }
            logger.info("Ingested {} chunks for material {}", chunks.size(), materialId);

        } catch (Exception e) {
            logger.error("Ingestion failed", e);
            throw new RuntimeException("Ingestion failed: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void ingestCourse(Long courseId) {
        logger.info("Starting bulk ingestion for course {}", courseId);
        List<CourseMaterial> materials = materialRepository.findByCourseId(courseId);
        for (CourseMaterial material : materials) {
            ingestMaterial(courseId, material.getId());
        }
        logger.info("Finished bulk ingestion for course {}", courseId);
    }

    public String askTutor(Long courseId, String question) {
        try {
            List<Double> questionVector = geminiService.generateEmbedding(question);
            List<VectorStoreEntry> courseEmbeddings = embeddingRepository.findByCourseId(courseId);

            if (courseEmbeddings.isEmpty()) {
                return "Jag har ingen information om den här kursen än. Be din lärare att ladda upp material.";
            }

            List<VectorStoreEntry> relevantChunks = findTopK(questionVector, courseEmbeddings, 3);
            String context = relevantChunks.stream()
                    .map(VectorStoreEntry::getTextChunk)
                    .collect(Collectors.joining("\n\n---\n\n"));

            String prompt = String.format(
                    "Du är en hjälpsam AI-lärare på EduFlex. Använd följande kurssammanhang för att svara på studentens fråga. "
                            +
                            "Om svaret inte finns i sammanhanget, säg att du inte vet baserat på kursmaterialet.\n\n" +
                            "Sammanhang:\n%s\n\nFråga: %s",
                    context, question);

            return geminiService.generateResponse(prompt);

        } catch (Exception e) {
            logger.error("Error in askTutor", e);
            return "Tyvärr uppstod ett fel när jag försökte svara. Försök igen senare.";
        }
    }

    private List<VectorStoreEntry> findTopK(List<Double> target, List<VectorStoreEntry> candidates, int k) {
        return candidates.stream()
                .filter(e -> e.getEmbeddingVector() != null)
                .sorted(Comparator
                        .comparingDouble(e -> -cosineSimilarity(target, Arrays.asList(e.getEmbeddingVector()))))
                .limit(k)
                .collect(Collectors.toList());
    }

    private double cosineSimilarity(List<Double> v1, List<Double> v2) {
        if (v1.size() != v2.size())
            return 0;
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;
        for (int i = 0; i < v1.size(); i++) {
            dotProduct += v1.get(i) * v2.get(i);
            normA += Math.pow(v1.get(i), 2);
            normB += Math.pow(v2.get(i), 2);
        }
        if (normA == 0 || normB == 0)
            return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private List<String> splitText(String text) {
        List<String> chunks = new ArrayList<>();
        int length = text.length();
        for (int i = 0; i < length; i += CHUNK_SIZE - OVERLAP) {
            chunks.add(text.substring(i, Math.min(length, i + CHUNK_SIZE)));
        }
        return chunks;
    }
}
