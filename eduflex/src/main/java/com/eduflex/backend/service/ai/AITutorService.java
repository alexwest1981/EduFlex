package com.eduflex.backend.service.ai;

import com.eduflex.backend.model.CourseMaterial;
import com.eduflex.backend.model.Embedding;
import com.eduflex.backend.repository.CourseMaterialRepository;
import com.eduflex.backend.repository.EmbeddingRepository;
import com.eduflex.backend.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.apache.tika.Tika;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AITutorService {

    private static final Logger logger = LoggerFactory.getLogger(AITutorService.class);
    private final GeminiService geminiService;
    private final EmbeddingRepository embeddingRepository;
    private final CourseMaterialRepository materialRepository;
    private final FileStorageService fileStorageService;
    private final Tika tika = new Tika();

    private static final int CHUNK_SIZE = 1000;
    private static final int OVERLAP = 100;

    /**
     * Ingests a material item (CourseMaterial).
     */
    @Transactional
    public void ingestMaterial(Long courseId, Long materialId) {
        try {
            logger.info("Ingesting material {} for course {}", materialId, courseId);

            CourseMaterial material = materialRepository.findById(materialId)
                    .orElseThrow(() -> new RuntimeException("Material not found: " + materialId));

            // Clear existing embeddings for this document
            embeddingRepository.deleteByDocumentId(materialId);

            StringBuilder fullText = new StringBuilder();

            // 1. Add Text Content / Description
            if (material.getContent() != null && !material.getContent().isBlank()) {
                fullText.append(material.getContent()).append("\n\n");
            }

            // 2. Add Attachment Content (if any) - Only if it is a file or has fileUrl
            if (material.getFileUrl() != null && !material.getFileUrl().isEmpty()) {
                try (InputStream stream = fileStorageService.getFileStream(material.getFileUrl())) {
                    String fileText = tika.parseToString(stream);
                    if (fileText != null && !fileText.isBlank()) {
                        fullText.append(fileText).append("\n");
                    }
                } catch (Exception e) {
                    logger.warn("Failed to extract text from attachment for material {}: {}", materialId,
                            e.getMessage());
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

                Embedding embedding = Embedding.builder()
                        .courseId(courseId)
                        .documentId(materialId)
                        .textChunk(chunk)
                        .vector(vectorArray)
                        .build();

                embeddingRepository.save(embedding);
            }
            logger.info("Ingested {} chunks for material {}", chunks.size(), materialId);

        } catch (Exception e) {
            logger.error("Ingestion failed", e);
            throw new RuntimeException("Ingestion failed: " + e.getMessage(), e);
        }
    }

    /**
     * Ingests ALL materials in a course.
     */
    @Transactional
    public void ingestCourse(Long courseId) {
        logger.info("Starting bulk ingestion for course {}", courseId);
        List<CourseMaterial> materials = materialRepository.findByCourseId(courseId);
        logger.info("Found {} materials for course {}", materials.size(), courseId);

        for (CourseMaterial mat : materials) {
            try {
                ingestMaterial(courseId, mat.getId());
                // Wait a bit to avoid rate limits
                Thread.sleep(500);
            } catch (Exception e) {
                logger.error("Failed to ingest material {} in bulk op", mat.getId(), e);
            }
        }
        logger.info("Completed bulk ingestion for course {}", courseId);
    }

    private List<String> splitText(String text) {
        List<String> chunks = new ArrayList<>();
        // Simple chunking implementation
        int len = text.length();
        for (int i = 0; i < len; i += (CHUNK_SIZE - OVERLAP)) {
            int end = Math.min(len, i + CHUNK_SIZE);
            chunks.add(text.substring(i, end));
            if (end == len)
                break;
        }
        return chunks;
    }

    /**
     * RAG Chat: Search similar chunks -> Ask LLM.
     */
    public String askTutor(Long courseId, String question) {
        if (!geminiService.isAvailable()) {
            return "AI-tjänsten är tyvärr inte tillgänglig just nu.";
        }

        // 1. Vectorize Question
        List<Double> questionVector = geminiService.generateEmbedding(question);

        // 2. Fetch all course embeddings
        List<Embedding> courseEmbeddings = embeddingRepository.findByCourseId(courseId);

        if (courseEmbeddings.isEmpty()) {
            return "Jag saknar kursmaterial att svara utifrån. Be din lärare indexera materialet!";
        }

        // 3. Find Top K relevant chunks (Cosine Similarity)
        List<Embedding> relevantChunks = findTopK(questionVector, courseEmbeddings, 3);

        if (relevantChunks.isEmpty()) {
            return "Jag hittar tyvärr ingen relevant information i kursmaterialet.";
        }

        // 4. Construct Prompt
        String context = relevantChunks.stream()
                .map(Embedding::getTextChunk)
                .collect(Collectors.joining("\n\n---\n\n"));

        String prompt = String.format("""
                Du är en inspirerande och pedagogisk AI-tutor.
                Använd följande utdrag från kursmaterialet för att svara på studentens fråga.
                Svara koncist och på svenska.
                Om svaret inte finns i texten, erkänn det ärligt.

                KURSMATERIAL:
                %s

                STUDENTENS FRÅGA: %s
                """, context, question);

        // 5. Generate Answer
        return geminiService.generateResponse(prompt);
    }

    private List<Embedding> findTopK(List<Double> target, List<Embedding> candidates, int k) {
        if (target == null || candidates == null)
            return Collections.emptyList();

        return candidates.stream()
                .sorted(Comparator.comparingDouble(e -> -cosineSimilarity(target, Arrays.asList(e.getVector())))) // Descending
                .limit(k)
                .collect(Collectors.toList());
    }

    private double cosineSimilarity(List<Double> v1, List<Double> v2) {
        if (v1 == null || v2 == null || v1.size() != v2.size())
            return 0.0;
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;
        for (int i = 0; i < v1.size(); i++) {
            dotProduct += v1.get(i) * v2.get(i);
            normA += Math.pow(v1.get(i), 2);
            normB += Math.pow(v2.get(i), 2);
        }
        if (normA == 0 || normB == 0)
            return 0.0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
