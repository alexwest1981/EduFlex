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
