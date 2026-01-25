package com.eduflex.backend.service.ai;

import com.eduflex.backend.dto.ai.AIQuizGenerationRequest;
import com.eduflex.backend.dto.ai.AIQuizGenerationResponse;
import com.eduflex.backend.dto.ai.GeneratedQuestionDTO;
import com.eduflex.backend.model.*;
import com.eduflex.backend.repository.QuizRepository;
import com.eduflex.backend.repository.QuestionBankRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Service that orchestrates AI-powered quiz generation.
 * Combines document parsing with OpenAI to generate quizzes from uploaded content.
 */
@Service
@ConditionalOnBean(OpenAIService.class)
public class AIQuizGeneratorService {

    private static final Logger logger = LoggerFactory.getLogger(AIQuizGeneratorService.class);

    private final DocumentParserService documentParserService;
    private final OpenAIService openAIService;
    private final QuizRepository quizRepository;
    private final QuestionBankRepository questionBankRepository;
    private final ObjectMapper objectMapper;

    @Autowired
    public AIQuizGeneratorService(DocumentParserService documentParserService,
                                   OpenAIService openAIService,
                                   QuizRepository quizRepository,
                                   QuestionBankRepository questionBankRepository,
                                   ObjectMapper objectMapper) {
        this.documentParserService = documentParserService;
        this.openAIService = openAIService;
        this.quizRepository = quizRepository;
        this.questionBankRepository = questionBankRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * Generates quiz questions from an uploaded document file.
     *
     * @param file          The uploaded PDF/DOCX file
     * @param request       Generation parameters (questionCount, difficulty, etc.)
     * @return AIQuizGenerationResponse containing generated questions
     * @throws IOException If file cannot be parsed
     */
    public AIQuizGenerationResponse generateFromFile(MultipartFile file,
                                                      AIQuizGenerationRequest request) throws IOException {
        long startTime = System.currentTimeMillis();

        // Validate file type
        if (!documentParserService.isSupportedFileType(file)) {
            throw new IllegalArgumentException("Unsupported file type. Please upload PDF, DOCX, DOC, TXT, RTF, or ODT.");
        }

        // Extract text from document
        String documentText = documentParserService.extractText(file);

        if (documentText.isBlank()) {
            throw new IllegalArgumentException("Could not extract text from the document. The file may be empty or corrupted.");
        }

        logger.info("Extracted {} characters from document", documentText.length());

        // Generate questions using OpenAI
        String jsonResponse = openAIService.generateQuizQuestions(
                documentText,
                request.getQuestionCount(),
                request.getDifficulty(),
                request.getLanguage()
        );

        // Parse the response
        List<GeneratedQuestionDTO> questions = parseGeneratedQuestions(jsonResponse);

        long processingTime = System.currentTimeMillis() - startTime;

        return AIQuizGenerationResponse.builder()
                .success(true)
                .title(request.getTitle() != null ? request.getTitle() : "AI-genererat Quiz")
                .questions(questions)
                .sourceDocumentName(file.getOriginalFilename())
                .sourceDocumentChars(documentText.length())
                .processingTimeMs(processingTime)
                .build();
    }

    /**
     * Generates quiz questions from plain text content.
     *
     * @param textContent   The source text to generate questions from
     * @param request       Generation parameters
     * @return AIQuizGenerationResponse containing generated questions
     */
    public AIQuizGenerationResponse generateFromText(String textContent,
                                                      AIQuizGenerationRequest request) {
        long startTime = System.currentTimeMillis();

        if (textContent == null || textContent.isBlank()) {
            throw new IllegalArgumentException("Text content cannot be empty");
        }

        // Truncate if necessary
        int maxChars = documentParserService.getMaxDocumentChars();
        if (textContent.length() > maxChars) {
            textContent = textContent.substring(0, maxChars);
        }

        // Generate questions using OpenAI
        String jsonResponse = openAIService.generateQuizQuestions(
                textContent,
                request.getQuestionCount(),
                request.getDifficulty(),
                request.getLanguage()
        );

        List<GeneratedQuestionDTO> questions = parseGeneratedQuestions(jsonResponse);

        long processingTime = System.currentTimeMillis() - startTime;

        return AIQuizGenerationResponse.builder()
                .success(true)
                .title(request.getTitle() != null ? request.getTitle() : "AI-genererat Quiz")
                .questions(questions)
                .sourceDocumentChars(textContent.length())
                .processingTimeMs(processingTime)
                .build();
    }

    /**
     * Saves generated questions as a new Quiz entity.
     *
     * @param response      The generation response containing questions
     * @param author        The user creating the quiz
     * @param course        Optional course to associate with the quiz
     * @param addToBank     Whether to also add questions to the question bank
     * @return The saved Quiz entity
     */
    @Transactional
    public Quiz saveAsQuiz(AIQuizGenerationResponse response, User author,
                           Course course, boolean addToBank) {
        logger.info("Saving AI-generated quiz with {} questions", response.getQuestions().size());

        Quiz quiz = new Quiz();
        quiz.setTitle(response.getTitle());
        quiz.setDescription("AI-genererat quiz baserat på uppladdat material");
        quiz.setAuthor(author);
        quiz.setCourse(course);

        List<Question> questions = new ArrayList<>();
        List<QuestionBankItem> bankItems = new ArrayList<>();

        for (GeneratedQuestionDTO dto : response.getQuestions()) {
            // Create Question for Quiz
            Question question = new Question();
            question.setText(dto.getText());
            question.setQuiz(quiz);

            List<Option> options = new ArrayList<>();
            for (int i = 0; i < dto.getOptions().size(); i++) {
                Option option = new Option();
                option.setText(dto.getOptions().get(i));
                option.setCorrect(i == dto.getCorrectIndex());
                option.setQuestion(question);
                options.add(option);
            }
            question.setOptions(options);
            questions.add(question);

            // Create QuestionBankItem if requested
            if (addToBank) {
                QuestionBankItem bankItem = new QuestionBankItem();
                bankItem.setQuestionText(dto.getText());
                bankItem.setCategory("AI-genererat");
                bankItem.setDifficulty(QuestionBankItem.Difficulty.MEDIUM);
                bankItem.setType(QuestionBankItem.QuestionType.MULTIPLE_CHOICE);
                bankItem.setOptions(dto.getOptions());
                bankItem.setCorrectAnswer(dto.getOptions().get(dto.getCorrectIndex()));
                bankItem.setAuthor(author);
                bankItems.add(bankItem);
            }
        }

        quiz.setQuestions(questions);
        Quiz savedQuiz = quizRepository.save(quiz);

        if (addToBank && !bankItems.isEmpty()) {
            questionBankRepository.saveAll(bankItems);
            logger.info("Added {} questions to question bank", bankItems.size());
        }

        logger.info("Saved quiz with ID: {}", savedQuiz.getId());
        return savedQuiz;
    }

    /**
     * Parses the JSON response from OpenAI into GeneratedQuestionDTO objects.
     */
    private List<GeneratedQuestionDTO> parseGeneratedQuestions(String jsonResponse) {
        List<GeneratedQuestionDTO> questions = new ArrayList<>();

        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode questionsNode = root.get("questions");

            if (questionsNode != null && questionsNode.isArray()) {
                for (JsonNode qNode : questionsNode) {
                    GeneratedQuestionDTO dto = new GeneratedQuestionDTO();
                    dto.setText(qNode.get("text").asText());

                    List<String> options = new ArrayList<>();
                    JsonNode optionsNode = qNode.get("options");
                    if (optionsNode != null && optionsNode.isArray()) {
                        for (JsonNode optNode : optionsNode) {
                            options.add(optNode.asText());
                        }
                    }
                    dto.setOptions(options);

                    dto.setCorrectIndex(qNode.get("correctIndex").asInt());

                    if (qNode.has("explanation")) {
                        dto.setExplanation(qNode.get("explanation").asText());
                    }

                    questions.add(dto);
                }
            }

        } catch (Exception e) {
            logger.error("Failed to parse generated questions", e);
            throw new RuntimeException("Failed to parse AI response: " + e.getMessage(), e);
        }

        return questions;
    }

    /**
     * Checks if AI quiz generation is available.
     */
    public boolean isAvailable() {
        return openAIService != null && openAIService.isAvailable();
    }
}
