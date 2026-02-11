package com.eduflex.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pdf_templates")
public class PdfTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "template_type", nullable = false, length = 50)
    private String templateType;

    @Column(nullable = false)
    private String name = "Standard";

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "background_image_url", length = 500)
    private String backgroundImageUrl;

    @Column(name = "primary_color", length = 7)
    private String primaryColor = "#C5A009";

    @Column(name = "secondary_color", length = 7)
    private String secondaryColor = "#1E293B";

    @Column(name = "accent_color", length = 7)
    private String accentColor = "#000000";

    @Column(name = "title_text")
    private String titleText = "K U R S I N T Y G";

    @Column(name = "subtitle_text")
    private String subtitleText = "BEVIS PÅ GENOMFÖRD UTBILDNING";

    @Column(name = "intro_text")
    private String introText = "Härmed intygas att";

    @Column(name = "body_text")
    private String bodyText = "Har framgångsrikt genomfört kursen";

    @Column(name = "grade_label", length = 100)
    private String gradeLabel = "GODKÄND";

    @Column(name = "footer_text", length = 500)
    private String footerText = "";

    @Column(name = "signature_title")
    private String signatureTitle = "Rektor";

    @Column(name = "school_name_override")
    private String schoolNameOverride;

    @Column(name = "show_border")
    private Boolean showBorder = true;

    @Column(name = "show_corner_decorations")
    private Boolean showCornerDecorations = true;

    @Column(name = "show_qr_code")
    private Boolean showQrCode = true;

    @Column(name = "qr_position", length = 20)
    private String qrPosition = "BOTTOM_RIGHT";

    @Column(length = 20)
    private String orientation = "LANDSCAPE";

    @Column(name = "title_font_size")
    private Integer titleFontSize = 42;

    @Column(name = "body_font_size")
    private Integer bodyFontSize = 18;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTemplateType() { return templateType; }
    public void setTemplateType(String templateType) { this.templateType = templateType; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public String getBackgroundImageUrl() { return backgroundImageUrl; }
    public void setBackgroundImageUrl(String backgroundImageUrl) { this.backgroundImageUrl = backgroundImageUrl; }

    public String getPrimaryColor() { return primaryColor; }
    public void setPrimaryColor(String primaryColor) { this.primaryColor = primaryColor; }

    public String getSecondaryColor() { return secondaryColor; }
    public void setSecondaryColor(String secondaryColor) { this.secondaryColor = secondaryColor; }

    public String getAccentColor() { return accentColor; }
    public void setAccentColor(String accentColor) { this.accentColor = accentColor; }

    public String getTitleText() { return titleText; }
    public void setTitleText(String titleText) { this.titleText = titleText; }

    public String getSubtitleText() { return subtitleText; }
    public void setSubtitleText(String subtitleText) { this.subtitleText = subtitleText; }

    public String getIntroText() { return introText; }
    public void setIntroText(String introText) { this.introText = introText; }

    public String getBodyText() { return bodyText; }
    public void setBodyText(String bodyText) { this.bodyText = bodyText; }

    public String getGradeLabel() { return gradeLabel; }
    public void setGradeLabel(String gradeLabel) { this.gradeLabel = gradeLabel; }

    public String getFooterText() { return footerText; }
    public void setFooterText(String footerText) { this.footerText = footerText; }

    public String getSignatureTitle() { return signatureTitle; }
    public void setSignatureTitle(String signatureTitle) { this.signatureTitle = signatureTitle; }

    public String getSchoolNameOverride() { return schoolNameOverride; }
    public void setSchoolNameOverride(String schoolNameOverride) { this.schoolNameOverride = schoolNameOverride; }

    public Boolean getShowBorder() { return showBorder; }
    public void setShowBorder(Boolean showBorder) { this.showBorder = showBorder; }

    public Boolean getShowCornerDecorations() { return showCornerDecorations; }
    public void setShowCornerDecorations(Boolean showCornerDecorations) { this.showCornerDecorations = showCornerDecorations; }

    public Boolean getShowQrCode() { return showQrCode; }
    public void setShowQrCode(Boolean showQrCode) { this.showQrCode = showQrCode; }

    public String getQrPosition() { return qrPosition; }
    public void setQrPosition(String qrPosition) { this.qrPosition = qrPosition; }

    public String getOrientation() { return orientation; }
    public void setOrientation(String orientation) { this.orientation = orientation; }

    public Integer getTitleFontSize() { return titleFontSize; }
    public void setTitleFontSize(Integer titleFontSize) { this.titleFontSize = titleFontSize; }

    public Integer getBodyFontSize() { return bodyFontSize; }
    public void setBodyFontSize(Integer bodyFontSize) { this.bodyFontSize = bodyFontSize; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
