package com.eduflex.backend.dto.ai;

/**
 * Request DTO for AI quiz generation.
 */
public class AIQuizGenerationRequest {

    private String title;
    private int questionCount = 5;
    private String difficulty = "MEDIUM";
    private String language = "sv";
    private Long courseId;
    private boolean addToQuestionBank = true;

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public int getQuestionCount() {
        return questionCount;
    }

    public void setQuestionCount(int questionCount) {
        this.questionCount = Math.max(1, Math.min(15, questionCount));
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public boolean isAddToQuestionBank() {
        return addToQuestionBank;
    }

    public void setAddToQuestionBank(boolean addToQuestionBank) {
        this.addToQuestionBank = addToQuestionBank;
    }
}
