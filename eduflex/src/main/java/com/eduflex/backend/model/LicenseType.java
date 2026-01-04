package com.eduflex.backend.model;

public enum LicenseType {
    BASIC(50, false, false),       // Max 50 användare
    PLUS(200, true, false),        // Max 200 användare, Quiz ingår
    ENTERPRISE(-1, true, true);    // Obegränsat, Quiz + Gamification

    private final int maxUsers;
    private final boolean enableQuiz;
    private final boolean enableGamification;

    LicenseType(int maxUsers, boolean enableQuiz, boolean enableGamification) {
        this.maxUsers = maxUsers;
        this.enableQuiz = enableQuiz;
        this.enableGamification = enableGamification;
    }

    public int getMaxUsers() { return maxUsers; }
    public boolean isQuizEnabled() { return enableQuiz; }
    public boolean isGamificationEnabled() { return enableGamification; }
}