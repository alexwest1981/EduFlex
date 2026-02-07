package com.eduflex.backend.dto;

import lombok.Builder;
import lombok.Data;

public class LtiScoreDTO {
    public LtiScoreDTO() {
    }

    public LtiScoreDTO(String userId, Double scoreGiven, Double scoreMaximum, String comment, String timestamp,
            String activityProgress, String gradingProgress) {
        this.userId = userId;
        this.scoreGiven = scoreGiven;
        this.scoreMaximum = scoreMaximum;
        this.comment = comment;
        this.timestamp = timestamp;
        this.activityProgress = activityProgress;
        this.gradingProgress = gradingProgress;
    }

    private String userId;
    private Double scoreGiven;
    private Double scoreMaximum;
    private String comment;
    private String timestamp; // ISO 8601
    private String activityProgress; // Initialized, Started, InProgress, Submitted, Completed
    private String gradingProgress; // FullyGraded, Pending, PendingManual, Failed, NotReady

    public static LtiScoreDTOBuilder builder() {
        return new LtiScoreDTOBuilder();
    }

    public static class LtiScoreDTOBuilder {
        private String userId;
        private Double scoreGiven;
        private Double scoreMaximum;
        private String comment;
        private String timestamp;
        private String activityProgress;
        private String gradingProgress;

        public LtiScoreDTOBuilder userId(String userId) {
            this.userId = userId;
            return this;
        }

        public LtiScoreDTOBuilder scoreGiven(Double scoreGiven) {
            this.scoreGiven = scoreGiven;
            return this;
        }

        public LtiScoreDTOBuilder scoreMaximum(Double scoreMaximum) {
            this.scoreMaximum = scoreMaximum;
            return this;
        }

        public LtiScoreDTOBuilder comment(String comment) {
            this.comment = comment;
            return this;
        }

        public LtiScoreDTOBuilder timestamp(String timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public LtiScoreDTOBuilder activityProgress(String activityProgress) {
            this.activityProgress = activityProgress;
            return this;
        }

        public LtiScoreDTOBuilder gradingProgress(String gradingProgress) {
            this.gradingProgress = gradingProgress;
            return this;
        }

        public LtiScoreDTO build() {
            return new LtiScoreDTO(userId, scoreGiven, scoreMaximum, comment, timestamp, activityProgress,
                    gradingProgress);
        }
    }

    // Manual Getters and Setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Double getScoreGiven() {
        return scoreGiven;
    }

    public void setScoreGiven(Double scoreGiven) {
        this.scoreGiven = scoreGiven;
    }

    public Double getScoreMaximum() {
        return scoreMaximum;
    }

    public void setScoreMaximum(Double scoreMaximum) {
        this.scoreMaximum = scoreMaximum;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getActivityProgress() {
        return activityProgress;
    }

    public void setActivityProgress(String activityProgress) {
        this.activityProgress = activityProgress;
    }

    public String getGradingProgress() {
        return gradingProgress;
    }

    public void setGradingProgress(String gradingProgress) {
        this.gradingProgress = gradingProgress;
    }
}
