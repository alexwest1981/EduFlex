package com.eduflex.backend.service;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.User;
import com.eduflex.backend.model.SystemSetting;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.repository.SystemSettingRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class CertificateService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final SystemSettingRepository settingRepository;

    public CertificateService(CourseRepository courseRepository, UserRepository userRepository, SystemSettingRepository settingRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.settingRepository = settingRepository;
    }

    public byte[] generateCertificate(Long courseId, Long studentId) throws DocumentException, IOException {
        Course course = courseRepository.findById(courseId).orElseThrow();
        User student = userRepository.findById(studentId).orElseThrow();

        String schoolName = settingRepository.findBySettingKey("school_name")
                .map(SystemSetting::getSettingValue)
                .orElse("EduFlex Academy");

        // 1. Skapa dokument (A4 Landskap)
        Document document = new Document(PageSize.A4.rotate());
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter writer = PdfWriter.getInstance(document, out);

        document.open();
        PdfContentByte canvas = writer.getDirectContent();

        // --- FÄRGER ---
        Color goldColor = new Color(197, 160, 9);   // Guld-aktig
        Color darkBlue = new Color(30, 41, 59);     // Mörkblå
        Color black = Color.BLACK;

        // --- TYPSNITT (Använder inbyggda standardfonter för att slippa filberoenden) ---
        BaseFont times = BaseFont.createFont(BaseFont.TIMES_ROMAN, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
        BaseFont timesBold = BaseFont.createFont(BaseFont.TIMES_BOLD, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
        BaseFont helvetica = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);

        // --- 2. RITA RAM (Klassisk Design) ---
        float width = document.getPageSize().getWidth();
        float height = document.getPageSize().getHeight();

        // Yttre tjock ram (Guld)
        canvas.setColorStroke(goldColor);
        canvas.setLineWidth(8);
        canvas.rectangle(20, 20, width - 40, height - 40);
        canvas.stroke();

        // Inre tunn ram (Mörkblå)
        canvas.setColorStroke(darkBlue);
        canvas.setLineWidth(2);
        canvas.rectangle(35, 35, width - 70, height - 70);
        canvas.stroke();

        // Hörn-dekorationer (Enkla cirklar i hörnen)
        drawCornerDecoration(canvas, 35, 35, goldColor);
        drawCornerDecoration(canvas, width - 35, 35, goldColor);
        drawCornerDecoration(canvas, 35, height - 35, goldColor);
        drawCornerDecoration(canvas, width - 35, height - 35, goldColor);

        // --- 3. LOGOTYP (Försök ladda, annars hoppa över) ---
        try {
            Image logo = Image.getInstance(new ClassPathResource("static/images/logo.png").getURL());
            logo.scaleToFit(60, 60);
            logo.setAbsolutePosition((width - logo.getScaledWidth()) / 2, height - 120);
            document.add(logo);
        } catch (Exception ignored) {}

        // --- 4. TEXTINNEHÅLL ---

        // Flytta ner markören lite
        Paragraph spacer = new Paragraph(" ");
        spacer.setSpacingAfter(80);
        document.add(spacer);

        // RUBRIK: "CERTIFICATE"
        Font titleFont = new Font(timesBold, 42, Font.NORMAL, darkBlue);
        Paragraph title = new Paragraph("K U R S I N T Y G", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(10);
        document.add(title);

        // UNDERRUBRIK: "OF COMPLETION"
        Font subTitleFont = new Font(helvetica, 12, Font.BOLD, Color.GRAY);
        Paragraph subTitle = new Paragraph("BEVIS PÅ GENOMFÖRD UTBILDNING", subTitleFont);
        subTitle.setAlignment(Element.ALIGN_CENTER);
        subTitle.setSpacingAfter(40);
        document.add(subTitle);

        // "Detta intygar att"
        Font textFont = new Font(times, 18, Font.ITALIC, Color.BLACK);
        Paragraph intro = new Paragraph("Härmed intygas att", textFont);
        intro.setAlignment(Element.ALIGN_CENTER);
        intro.setSpacingAfter(20);
        document.add(intro);

        // STUDENTENS NAMN
        Font nameFont = new Font(timesBold, 36, Font.UNDERLINE, darkBlue);
        Paragraph studentName = new Paragraph(student.getFullName(), nameFont);
        studentName.setAlignment(Element.ALIGN_CENTER);
        studentName.setSpacingAfter(25);
        document.add(studentName);

        // "Har genomfört kursen"
        Paragraph midText = new Paragraph("Har framgångsrikt genomfört kursen", textFont);
        midText.setAlignment(Element.ALIGN_CENTER);
        midText.setSpacingAfter(15);
        document.add(midText);

        // KURSNAMN
        Font courseFont = new Font(timesBold, 26, Font.NORMAL, black);
        Paragraph courseName = new Paragraph(course.getName(), courseFont);
        courseName.setAlignment(Element.ALIGN_CENTER);
        document.add(courseName);

        // KURSKOD & BETYG
        Font detailsFont = new Font(helvetica, 10, Font.NORMAL, Color.GRAY);
        Paragraph details = new Paragraph("Kurskod: " + course.getCourseCode() + "  |  Betyg: GODKÄND", detailsFont);
        details.setAlignment(Element.ALIGN_CENTER);
        details.setSpacingAfter(60);
        document.add(details);

        // --- 5. SIGNATUR & DATUM ---
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(75);
        table.setWidths(new int[]{1, 1});

        // Vänster: Datum
        PdfPCell dateCell = new PdfPCell();
        dateCell.setBorder(Rectangle.NO_BORDER);
        dateCell.addElement(new Paragraph("Datum: " + LocalDate.now().format(DateTimeFormatter.ISO_DATE), new Font(times, 14, Font.NORMAL, black)));
        // Linje ovanför
        dateCell.addElement(new Paragraph("__________________________", new Font(times, 12, Font.NORMAL, Color.LIGHT_GRAY)));
        dateCell.addElement(new Paragraph("Utfärdat datum", new Font(helvetica, 8, Font.NORMAL, Color.GRAY)));
        table.addCell(dateCell);

        // Höger: Signatur
        PdfPCell signCell = new PdfPCell();
        signCell.setBorder(Rectangle.NO_BORDER);
        signCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

        Paragraph signName = new Paragraph(schoolName, new Font(timesBold, 16, Font.ITALIC, goldColor)); // "Signatur-look"
        signName.setAlignment(Element.ALIGN_RIGHT);
        signCell.addElement(signName);

        Paragraph signLine = new Paragraph("__________________________", new Font(times, 12, Font.NORMAL, Color.LIGHT_GRAY));
        signLine.setAlignment(Element.ALIGN_RIGHT);
        signCell.addElement(signLine);

        Paragraph signLabel = new Paragraph("Signerat av Rektor", new Font(helvetica, 8, Font.NORMAL, Color.GRAY));
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