package com.eduflex.backend.service;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.PdfTemplate;
import com.eduflex.backend.model.User;
import com.eduflex.backend.model.SystemSetting;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.repository.SystemSettingRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URL;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class CertificateService {

    private static final Logger logger = LoggerFactory.getLogger(CertificateService.class);

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final SystemSettingRepository settingRepository;
    private final PdfTemplateService pdfTemplateService;

    public CertificateService(CourseRepository courseRepository, UserRepository userRepository,
                              SystemSettingRepository settingRepository, PdfTemplateService pdfTemplateService) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.settingRepository = settingRepository;
        this.pdfTemplateService = pdfTemplateService;
    }

    private Color parseHexColor(String hex, Color fallback) {
        try {
            if (hex != null && hex.startsWith("#") && hex.length() == 7) {
                return new Color(
                    Integer.parseInt(hex.substring(1, 3), 16),
                    Integer.parseInt(hex.substring(3, 5), 16),
                    Integer.parseInt(hex.substring(5, 7), 16)
                );
            }
        } catch (Exception ignored) {}
        return fallback;
    }

    public byte[] generateCertificate(Long courseId, Long studentId) throws DocumentException, IOException {
        Course course = courseRepository.findById(courseId).orElseThrow();
        User student = userRepository.findById(studentId).orElseThrow();

        String schoolName = settingRepository.findBySettingKey("school_name")
                .map(SystemSetting::getSettingValue)
                .orElse("EduFlex Academy");

        // Load template settings (or use defaults)
        PdfTemplate tmpl = pdfTemplateService.getActiveTemplate("CERTIFICATE").orElse(null);

        // Override school name if template specifies
        if (tmpl != null && tmpl.getSchoolNameOverride() != null && !tmpl.getSchoolNameOverride().isBlank()) {
            schoolName = tmpl.getSchoolNameOverride();
        }

        // Resolve configurable values
        Color goldColor = parseHexColor(tmpl != null ? tmpl.getPrimaryColor() : null, new Color(197, 160, 9));
        Color darkBlue = parseHexColor(tmpl != null ? tmpl.getSecondaryColor() : null, new Color(30, 41, 59));
        Color black = Color.BLACK;

        String titleTextStr = tmpl != null && tmpl.getTitleText() != null ? tmpl.getTitleText() : "K U R S I N T Y G";
        String subtitleStr = tmpl != null && tmpl.getSubtitleText() != null ? tmpl.getSubtitleText() : "BEVIS PÅ GENOMFÖRD UTBILDNING";
        String introStr = tmpl != null && tmpl.getIntroText() != null ? tmpl.getIntroText() : "Härmed intygas att";
        String bodyStr = tmpl != null && tmpl.getBodyText() != null ? tmpl.getBodyText() : "Har framgångsrikt genomfört kursen";
        String gradeStr = tmpl != null && tmpl.getGradeLabel() != null ? tmpl.getGradeLabel() : "GODKÄND";
        String signatureTitleStr = tmpl != null && tmpl.getSignatureTitle() != null ? tmpl.getSignatureTitle() : "Rektor";

        int titleSize = tmpl != null && tmpl.getTitleFontSize() != null ? tmpl.getTitleFontSize() : 42;
        int bodySize = tmpl != null && tmpl.getBodyFontSize() != null ? tmpl.getBodyFontSize() : 18;

        boolean showBorder = tmpl == null || tmpl.getShowBorder() == null || tmpl.getShowBorder();
        boolean showCorners = tmpl == null || tmpl.getShowCornerDecorations() == null || tmpl.getShowCornerDecorations();

        boolean isLandscape = tmpl == null || tmpl.getOrientation() == null || "LANDSCAPE".equals(tmpl.getOrientation());

        // 1. Skapa dokument
        Document document = new Document(isLandscape ? PageSize.A4.rotate() : PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter writer = PdfWriter.getInstance(document, out);

        document.open();
        PdfContentByte canvas = writer.getDirectContent();

        // --- TYPSNITT ---
        BaseFont times = BaseFont.createFont(BaseFont.TIMES_ROMAN, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
        BaseFont timesBold = BaseFont.createFont(BaseFont.TIMES_BOLD, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
        BaseFont helvetica = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);

        float width = document.getPageSize().getWidth();
        float height = document.getPageSize().getHeight();

        // --- BAKGRUNDSBILD ---
        if (tmpl != null && tmpl.getBackgroundImageUrl() != null && !tmpl.getBackgroundImageUrl().isBlank()) {
            try {
                String bgUrl = tmpl.getBackgroundImageUrl();
                if (!bgUrl.startsWith("http")) {
                    bgUrl = "http://localhost:8080" + bgUrl;
                }
                Image bg = Image.getInstance(new URL(bgUrl));
                bg.scaleAbsolute(width, height);
                bg.setAbsolutePosition(0, 0);
                canvas.addImage(bg);
            } catch (Exception e) {
                logger.warn("Could not load background image for certificate template", e);
            }
        }

        // --- RAMAR ---
        if (showBorder) {
            canvas.setColorStroke(goldColor);
            canvas.setLineWidth(8);
            canvas.rectangle(20, 20, width - 40, height - 40);
            canvas.stroke();

            canvas.setColorStroke(darkBlue);
            canvas.setLineWidth(2);
            canvas.rectangle(35, 35, width - 70, height - 70);
            canvas.stroke();
        }

        // Hörn-dekorationer
        if (showCorners) {
            drawCornerDecoration(canvas, 35, 35, goldColor);
            drawCornerDecoration(canvas, width - 35, 35, goldColor);
            drawCornerDecoration(canvas, 35, height - 35, goldColor);
            drawCornerDecoration(canvas, width - 35, height - 35, goldColor);
        }

        // --- LOGOTYP ---
        try {
            Image logo;
            if (tmpl != null && tmpl.getLogoUrl() != null && !tmpl.getLogoUrl().isBlank()) {
                String logoUrl = tmpl.getLogoUrl();
                if (!logoUrl.startsWith("http")) {
                    logoUrl = "http://localhost:8080" + logoUrl;
                }
                logo = Image.getInstance(new URL(logoUrl));
            } else {
                logo = Image.getInstance(new ClassPathResource("static/images/logo.png").getURL());
            }
            logo.scaleToFit(60, 60);
            logo.setAbsolutePosition((width - logo.getScaledWidth()) / 2, height - 120);
            document.add(logo);
        } catch (Exception e) {
            logger.debug("Could not load logo for certificate", e);
        }

        // --- TEXTINNEHÅLL ---
        Paragraph spacer = new Paragraph(" ");
        spacer.setSpacingAfter(80);
        document.add(spacer);

        Font titleFont = new Font(timesBold, titleSize, Font.NORMAL, darkBlue);
        Paragraph title = new Paragraph(titleTextStr, titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(10);
        document.add(title);

        Font subTitleFont = new Font(helvetica, 12, Font.BOLD, Color.GRAY);
        Paragraph subTitle = new Paragraph(subtitleStr, subTitleFont);
        subTitle.setAlignment(Element.ALIGN_CENTER);
        subTitle.setSpacingAfter(40);
        document.add(subTitle);

        Font textFont = new Font(times, bodySize, Font.ITALIC, Color.BLACK);
        Paragraph intro = new Paragraph(introStr, textFont);
        intro.setAlignment(Element.ALIGN_CENTER);
        intro.setSpacingAfter(20);
        document.add(intro);

        Font nameFont = new Font(timesBold, 36, Font.UNDERLINE, darkBlue);
        Paragraph studentName = new Paragraph(student.getFullName(), nameFont);
        studentName.setAlignment(Element.ALIGN_CENTER);
        studentName.setSpacingAfter(25);
        document.add(studentName);

        Paragraph midText = new Paragraph(bodyStr, textFont);
        midText.setAlignment(Element.ALIGN_CENTER);
        midText.setSpacingAfter(15);
        document.add(midText);

        Font courseFont = new Font(timesBold, 26, Font.NORMAL, black);
        Paragraph courseName = new Paragraph(course.getName(), courseFont);
        courseName.setAlignment(Element.ALIGN_CENTER);
        document.add(courseName);

        Font detailsFont = new Font(helvetica, 10, Font.NORMAL, Color.GRAY);
        Paragraph details = new Paragraph("Kurskod: " + course.getCourseCode() + "  |  Betyg: " + gradeStr, detailsFont);
        details.setAlignment(Element.ALIGN_CENTER);
        details.setSpacingAfter(60);
        document.add(details);

        // --- SIGNATUR & DATUM ---
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(75);
        table.setWidths(new int[]{1, 1});

        PdfPCell dateCell = new PdfPCell();
        dateCell.setBorder(Rectangle.NO_BORDER);
        dateCell.addElement(new Paragraph("Datum: " + LocalDate.now().format(DateTimeFormatter.ISO_DATE), new Font(times, 14, Font.NORMAL, black)));
        dateCell.addElement(new Paragraph("__________________________", new Font(times, 12, Font.NORMAL, Color.LIGHT_GRAY)));
        dateCell.addElement(new Paragraph("Utfärdat datum", new Font(helvetica, 8, Font.NORMAL, Color.GRAY)));
        table.addCell(dateCell);

        PdfPCell signCell = new PdfPCell();
        signCell.setBorder(Rectangle.NO_BORDER);
        signCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

        Paragraph signName = new Paragraph(schoolName, new Font(timesBold, 16, Font.ITALIC, goldColor));
        signName.setAlignment(Element.ALIGN_RIGHT);
        signCell.addElement(signName);

        Paragraph signLine = new Paragraph("__________________________", new Font(times, 12, Font.NORMAL, Color.LIGHT_GRAY));
        signLine.setAlignment(Element.ALIGN_RIGHT);
        signCell.addElement(signLine);

        Paragraph signLabel = new Paragraph("Signerat av " + signatureTitleStr, new Font(helvetica, 8, Font.NORMAL, Color.GRAY));
        signLabel.setAlignment(Element.ALIGN_RIGHT);
        signCell.addElement(signLabel);

        table.addCell(signCell);

        document.add(table);
        document.close();

        return out.toByteArray();
    }

    private void drawCornerDecoration(PdfContentByte canvas, float x, float y, Color color) {
        canvas.setColorFill(color);
        canvas.circle(x, y, 4);
        canvas.fill();
    }
}
