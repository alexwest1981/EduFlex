package com.eduflex.backend.model;

public enum League {
    BRONZE("Bronsligan", 0, "🥉"),
    SILVER("Silverligan", 501, "🥈"),
    GOLD("Guldligan", 1501, "🥇"),
    PLATINUM("Platinaligan", 3001, "💎"),
    RUBY("Rubinligan", 6001, "🔥");

    private final String displayName;
    private final int minPoints;
    private final String icon;

    League(String displayName, int minPoints, String icon) {
        this.displayName = displayName;
        this.minPoints = minPoints;
        this.icon = icon;
    }

    public String getDisplayName() {
        return displayName;
    }

    public int getMinPoints() {
        return minPoints;
    }

    public String getIcon() {
        return icon;
    }

    public static League determineLeague(int points) {
        if (points >= RUBY.minPoints)
            return RUBY;
        if (points >= PLATINUM.minPoints)
            return PLATINUM;
        if (points >= GOLD.minPoints)
            return GOLD;
        if (points >= SILVER.minPoints)
            return SILVER;
        return BRONZE;
    }
}
