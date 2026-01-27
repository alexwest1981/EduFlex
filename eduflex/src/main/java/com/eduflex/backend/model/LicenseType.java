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
            case "QUIZ_BASIC":
                return true; // Available for all

            case "QUIZ_PRO":
            case "CHAT":
            case "FORUM":
            case "SCORM":
            case "AI_QUIZ":
                // Basic has NO these modules. Pro and Enterprise have them.
                return this == PRO;

            case "GAMIFICATION":
            case "ANALYTICS":
            case "ENTERPRISE_WHITELABEL":
            case "REVENUE":
                // Only Enterprise has these
                return false;

            default:
                return true; // Unknown modules default to allowed
        }
    }
}