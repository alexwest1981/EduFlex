package com.eduflex.backend.service.ai;

import com.eduflex.backend.model.Ebook;
import com.eduflex.backend.model.VectorStoreEntry;
import com.eduflex.backend.repository.EbookRepository;
import com.eduflex.backend.repository.EmbeddingRepository;
import com.eduflex.backend.service.StorageService;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.Tika;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiStudyPalService {
    private static final Logger logger = LoggerFactory.getLogger(AiStudyPalService.class);
    private final GeminiService geminiService;
    private final EmbeddingRepository embeddingRepository;
    private final EbookRepository ebookRepository;
    private final StorageService storageService;
    private final Tika tika = new Tika();

    private static final int CHUNK_SIZE = 1000;
    private static final int OVERLAP = 100;

    public AiStudyPalService(GeminiService geminiService,
            EmbeddingRepository embeddingRepository,
            EbookRepository ebookRepository,
            StorageService storageService) {
        this.geminiService = geminiService;
        this.embeddingRepository = embeddingRepository;
        this.ebookRepository = ebookRepository;
        this.storageService = storageService;
    }

    // We remove @Transactional here because this process can be very long
    // (embedding many chunks) and we don't want to hold a DB connection or
    // timeout the transaction. Each save is individually handled.
    public void indexEbook(Long ebookId) {
        try {
            Ebook ebook = ebookRepository.findById(ebookId)
                    .orElseThrow(() -> new RuntimeException("Ebook not found: " + ebookId));

            embeddingRepository.deleteBySourceTypeAndSourceId("EBOOK", ebookId);

            String storageId = ebook.getFileUrl();
            if (storageId.contains("/api/storage/"))
                storageId = storageId.substring(storageId.lastIndexOf("/") + 1);

            StringBuilder textBuilder = new StringBuilder();
            try (InputStream is = storageService.load(storageId)) {
                logger.info("📄 AI Study Pal: Startar textutvinning för fil: {}", storageId);

                Metadata metadata = new Metadata();
                metadata.set("resourceName", storageId);

                String extracted = tika.parseToString(is, metadata);
                if (extracted != null && !extracted.trim().isEmpty()) {
                    textBuilder.append(extracted);
                    logger.info("✅ AI Study Pal: Lyckades utvinna {} tecken från {}", extracted.length(), storageId);
                } else {
                    logger.warn("⚠️ AI Study Pal: Ingen text kunde utvinnas från {}", storageId);
                }
            } catch (Exception e) {
                logger.error("❌ AI Study Pal: Textutvinning misslyckades för {}. Fel: {}", storageId, e.getMessage());
            }

            String fullText = textBuilder.toString().trim();
            if (fullText.isEmpty()) {
                logger.warn("🚫 Indexering avbruten: Inget innehåll hittades i e-bok {}", ebookId);
                return;
            }

            List<String> chunks = splitText(fullText);
            logger.info("🧩 Delar upp text i {} segment för AI-analys", chunks.size());

            int successCount = 0;
            for (String chunk : chunks) {
                try {
                    List<Double> vector = geminiService.generateEmbedding(chunk);
                    VectorStoreEntry entry = new VectorStoreEntry();
                    entry.setSourceType("EBOOK");
                    entry.setSourceId(ebookId);
                    entry.setSourceTitle(ebook.getTitle());
                    entry.setTextChunk(chunk);
                    entry.setEmbeddingVector(vector.toArray(new Double[0]));
                    embeddingRepository.save(entry);
                    successCount++;
                } catch (Exception chunkError) {
                    logger.error("⚠️ Kunde inte skapa embedding för ett segment i e-bok {}: {}", ebookId,
                            chunkError.getMessage());
                }
            }

            if (successCount > 0) {
                logger.info("✅ Indexering klar för e-bok {}: {}/{} segment sparade", ebookId, successCount,
                        chunks.size());
            } else {
                logger.error("❌ Indexering misslyckades helt för e-bok {}: Inga segment kunde bearbetas", ebookId);
            }
        } catch (Exception e) {
            logger.error("Hoppsan! Något gick fel vid indexering av e-bok {}: {}", ebookId, e.getMessage());
        }
    }

    public String chatWithPal(Long courseId, String lessonTitle, String question) {
        try {
            List<Double> questionVector = geminiService.generateEmbedding(question);

            // 1. Get Course/Lesson Context
            List<VectorStoreEntry> candidates = new ArrayList<>(embeddingRepository.findByCourseId(courseId));

            // 2. If no context or for extra knowledge, check Library Books in same category
            // We'll just fetch a few relevant ones for now
            List<VectorStoreEntry> ebookCandidates = embeddingRepository.findBySourceType("EBOOK");
            candidates.addAll(ebookCandidates);

            if (candidates.isEmpty()) {
                return "Hej kompis! Jag ser att det saknas material här just nu, men jag finns här för dig ändå. Vad funderar du på? Vi kan försöka lista ut det tillsammans!";
            }

            List<VectorStoreEntry> relevantChunks = findTopK(questionVector, candidates, 5);
            String context = relevantChunks.stream()
                    .map(e -> String.format("[%s]: %s", e.getSourceTitle(), e.getTextChunk()))
                    .collect(Collectors.joining("\n\n---\n\n"));

            String personalityPrompt = """
                    Du är 'EduFlex Study Pal' – en varm, entusiastisk och stöttande vän till studenten.
                    Ditt mål är att studenten ska lyckas och känna sig sedd och peppad.

                    TONFALL:
                    - Använd ett informellt, vänligt men professionellt svenskt språk.
                    - Använd hälsningar som 'Hej kompis!', 'Grym fråga!', 'Härligt att du kämpar på!'.
                    - Var aldrig dömande, bara uppmuntrande.
                    - Om du hämtar information från en bok, nämn gärna det: 'Jag kikade lite i boken [Titel] och där står det...'

                    KONTEXT:
                    Du har tillgång till material från kursen och biblioteket nedan.
                    Svara på frågan baserat på detta, men behåll din personlighet.
                    Om informationen saknas helt, försök peppa studenten att fråga sin lärare eller leta vidare i biblioteket.

                    SAMMANHANG:
                    %s

                    FRÅGA: %s
                    """
                    .formatted(context, question);

            return geminiService.generateResponse(personalityPrompt);

        } catch (Exception e) {
            logger.error("Error in AI Study Pal chat", e);
            return "Hoppsan kompis! Min hjärna fick lite hicka just nu. Kan vi prova igen om en liten stund? Jag tror på dig!";
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
        double dotProduct = 0.0, normA = 0.0, normB = 0.0;
        for (int i = 0; i < v1.size(); i++) {
            dotProduct += v1.get(i) * v2.get(i);
            normA += Math.pow(v1.get(i), 2);
            normB += Math.pow(v2.get(i), 2);
        }
        return (normA == 0 || normB == 0) ? 0 : dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private List<String> splitText(String text) {
        List<String> chunks = new ArrayList<>();
        for (int i = 0; i < text.length(); i += CHUNK_SIZE - OVERLAP) {
            chunks.add(text.substring(i, Math.min(text.length(), i + CHUNK_SIZE)));
        }
        return chunks;
    }
}
