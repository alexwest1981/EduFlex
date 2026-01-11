package com.eduflex.backend.model;

public enum LicenseType {
    BASIC(50),
    PRO(200),
    ENTERPRISE(-1); // -1 = Unlimited

    private final int maxUsers;

    LicenseType(int maxUsers) {
        this.maxUsers = maxUsers;
    }

    public int getMaxUsers() {
        return maxUsers;
    }

    public boolean isModuleAllowed(String moduleKey) {
        if (this == ENTERPRISE)
            return true;

        switch (moduleKey) {
            case "DARK_MODE":
            case "SUBMISSIONS":
                return true; // Available for all

            case "QUIZ":
            case "CHAT":
            case "FORUM":
                // Basic has NO Quiz, Chat, Forum. Pro has them.
                return this == PRO;

            case "GAMIFICATION":
            case "ANALYTICS":
                // Only Enterprise has these
                return false;

            case "SCORM":
                // Pro or Enterprise
                return this != BASIC;

            default:
                return true; // Unknown modules default to allowed (or arguably restricted)
        }
    }
}