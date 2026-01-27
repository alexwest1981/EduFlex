package com.eduflex.backend.dto.ai;

import java.util.List;

/**
 * Response DTO for AI quiz generation.
 */
public class AIQuizGenerationResponse {

    private boolean success;
    private String title;
    private List<GeneratedQuestionDTO> questions;
    private String sourceDocumentName;
    private int sourceDocumentChars;
    private long processingTimeMs;
    private String errorMessage;
    private Long savedQuizId;

    // Private constructor for builder
    private AIQuizGenerationResponse() {}

    // Static builder method
    public static Builder builder() {
        return new Builder();
    }

    // Builder class
    public static class Builder {
        private final AIQuizGenerationResponse response = new AIQuizGenerationResponse();

        public Builder success(boolean success) {
            response.success = success;
            return this;
        }

        public Builder title(String title) {
            response.title = title;
            return this;
        }

        public Builder questions(List<GeneratedQuestionDTO> questions) {
            response.questions = questions;
            return this;
        }

        public Builder sourceDocumentName(String sourceDocumentName) {
            response.sourceDocumentName = sourceDocumentName;
            return this;
        }

        public Builder sourceDocumentChars(int sourceDocumentChars) {
            response.sourceDocumentChars = sourceDocumentChars;
            return this;
        }

        public Builder processingTimeMs(long processingTimeMs) {
            response.processingTimeMs = processingTimeMs;
            return this;
        }

        public Builder errorMessage(String errorMessage) {
            response.errorMessage = errorMessage;
            return this;
        }

        public Builder savedQuizId(Long savedQuizId) {
            response.savedQuizId = savedQuizId;
            return this;
        }

        public AIQuizGenerationResponse build() {
            return response;
        }
    }

    // Getters
    public boolean isSuccess() {
        return success;
    }

    public String getTitle() {
        return title;
    }

    public List<GeneratedQuestionDTO> getQuestions() {
        return questions;
    }

    public String getSourceDocumentName() {
        return sourceDocumentName;
    }

    public int getSourceDocumentChars() {
        return sourceDocumentChars;
    }

    public long getProcessingTimeMs() {
        return processingTimeMs;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public Long getSavedQuizId() {
        return savedQuizId;
    }

    // Setters for JSON deserialization
    public void setSuccess(boolean success) {
        this.success = success;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setQuestions(List<GeneratedQuestionDTO> questions) {
        this.questions = questions;
    }

    public void setSourceDocumentName(String sourceDocumentName) {
        this.sourceDocumentName = sourceDocumentName;
    }

    public void setSourceDocumentChars(int sourceDocumentChars) {
        this.sourceDocumentChars = sourceDocumentChars;
    }

    public void setProcessingTimeMs(long processingTimeMs) {
        this.processingTimeMs = processingTimeMs;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public void setSavedQuizId(Long savedQuizId) {
        this.savedQuizId = savedQuizId;
    }
}
