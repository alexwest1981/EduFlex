package com.eduflex.backend.model.community;

/**
 * Subject categories for community content with display names and icons
 */
public enum CommunitySubject {
    MATEMATIK("Matematik", "calculator", "#8B5CF6"),
    SVENSKA("Svenska", "book-open", "#EC4899"),
    ENGELSKA("Engelska", "globe", "#3B82F6"),
    FYSIK("Fysik", "atom", "#F59E0B"),
    KEMI("Kemi", "flask-conical", "#10B981"),
    BIOLOGI("Biologi", "leaf", "#22C55E"),
    HISTORIA("Historia", "landmark", "#A855F7"),
    SAMHALLSKUNSKAP("Samhällskunskap", "users", "#6366F1"),
    GEOGRAFI("Geografi", "map", "#14B8A6"),
    RELIGIONSKUNSKAP("Religionskunskap", "heart", "#F43F5E"),
    TEKNIK("Teknik", "cog", "#64748B"),
    PROGRAMMERING("Programmering", "code", "#0EA5E9"),

    // Social Sciences & Humanities
    PSYKOLOGI("Psykologi", "brain", "#D946EF"),
    FILOSOFI("Filosofi", "lightbulb", "#FACC15"),
    SOCIOLOGI("Sociologi", "users", "#818CF8"),
    JURIDIK("Juridik", "scale", "#64748B"),
    PEDAGOGIK("Pedagogik", "graduation-cap", "#8B5CF6"),

    // Economy & Tech
    NATIONALEKONOMI("Nationalekonomi", "trending-up", "#059669"),
    FORETAGSEKONOMI("Företagsekonomi", "briefcase", "#B45309"),
    ENTREPRENORSKAP("Entreprenörskap", "rocket", "#F97316"),
    WEBBUTVECKLING("Webbutveckling", "globe", "#2563EB"),

    // Science & Health
    NATURKUNSKAP("Naturkunskap", "zap", "#FBBF24"),
    MEDICIN("Medicin", "stethoscope", "#F43F5E"),
    VARD_OMSORG("Vård & Omsorg", "heart", "#F43F5E"),

    IDROTT("Idrott & Hälsa", "activity", "#EF4444"),
    MUSIK("Musik", "music", "#D946EF"),
    BILD("Bild", "palette", "#F97316"),
    SLOJD("Slöjd", "hammer", "#78716C"),
    HEM_KONSUMENTKUNSKAP("Hem- & konsumentkunskap", "utensils", "#84CC16"),
    MODERSMAL("Modersmål", "message-circle", "#06B6D4"),
    SPRAK_ANNAT("Annat Språk", "languages", "#8B5CF6"),
    OVRIGT("Övrigt", "folder", "#94A3B8");

    private final String displayName;
    private final String iconName;
    private final String color;

    CommunitySubject(String displayName, String iconName, String color) {
        this.displayName = displayName;
        this.iconName = iconName;
        this.color = color;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getIconName() {
        return iconName;
    }

    public String getColor() {
        return color;
    }
}
