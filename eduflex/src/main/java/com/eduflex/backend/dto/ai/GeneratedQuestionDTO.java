package com.eduflex.backend.dto.ai;

import java.util.List;

/**
 * DTO for a single generated question in an AI quiz.
 */
public class GeneratedQuestionDTO {
    private String text;
    private List<String> options;
    private int correctIndex;
    private String explanation;

    public GeneratedQuestionDTO() {
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }

    public int getCorrectIndex() {
        return correctIndex;
    }

    public void setCorrectIndex(int correctIndex) {
        this.correctIndex = correctIndex;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
}
