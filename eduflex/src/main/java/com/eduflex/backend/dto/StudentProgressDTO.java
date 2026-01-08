package com.eduflex.backend.dto;

import java.util.List;

public class StudentProgressDTO {
    private Long courseId;
    private String courseName;
    private String estimatedGrade; // "A", "B", ... "F" or "N/A"
    private boolean isAtRisk;
    private String riskReason; // "Low Grade", "Missing Deadlines", etc.

    private int completedAssignments;
    private int totalAssignments;
    private int completedQuizzes;
    private int totalQuizzes;

    // Nya fält för specifika resultat
    private List<ResultDetail> recentResults;

    public StudentProgressDTO(Long courseId, String courseName, String estimatedGrade, boolean isAtRisk,
            String riskReason, int completedAssignments, int totalAssignments, int completedQuizzes, int totalQuizzes,
            List<ResultDetail> recentResults) {
        this.courseId = courseId;
        this.courseName = courseName;
        this.estimatedGrade = estimatedGrade;
        this.isAtRisk = isAtRisk;
        this.riskReason = riskReason;
        this.completedAssignments = completedAssignments;
        this.totalAssignments = totalAssignments;
        this.completedQuizzes = completedQuizzes;
        this.totalQuizzes = totalQuizzes;
        this.recentResults = recentResults;
    }

    // Getters
    public Long getCourseId() {
        return courseId;
    }

    public String getCourseName() {
        return courseName;
    }

    public String getEstimatedGrade() {
        return estimatedGrade;
    }

    public boolean getIsAtRisk() {
        return isAtRisk;
    }

    public String getRiskReason() {
        return riskReason;
    }

    public int getCompletedAssignments() {
        return completedAssignments;
    }

    public int getTotalAssignments() {
        return totalAssignments;
    }

    public int getCompletedQuizzes() {
        return completedQuizzes;
    }

    public int getTotalQuizzes() {
        return totalQuizzes;
    }

    public List<ResultDetail> getRecentResults() {
        return recentResults;
    }

    // Inner class for simple result details
    public static class ResultDetail {
        private String type; // "ASSIGNMENT" or "QUIZ"
        private String title;
        private String scoreOrGrade;

        public ResultDetail(String type, String title, String scoreOrGrade) {
            this.type = type;
            this.title = title;
            this.scoreOrGrade = scoreOrGrade;
        }

        public String getType() {
            return type;
        }

        public String getTitle() {
            return title;
        }

        public String getScoreOrGrade() {
            return scoreOrGrade;
        }
    }
}
