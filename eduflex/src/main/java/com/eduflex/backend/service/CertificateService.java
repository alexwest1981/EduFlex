package com.eduflex.backend.service;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.User;
import com.eduflex.backend.model.SystemSetting;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.repository.SystemSettingRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfWriter;
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

        // Hämta skolans namn dynamiskt, fallback till "EduFlex"
        String schoolName = settingRepository.findById("school_name")
                .map(SystemSetting::getValue)
                .orElse("EduFlex Learning System");

        // 1. Skapa dokument (A4 Landskap)
        Document document = new Document(PageSize.A4.rotate());
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter writer = PdfWriter.getInstance(document, out);

        document.open();

        // --- FÄRGER & FONTER ---
        Color primaryColor = new Color(37, 99, 235); // Blue-600 (Samma som nya loggan)
        Color darkColor = new Color(30, 41, 59);     // Slate-800

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 36, primaryColor);
        Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA, 16, Color.GRAY);
        Font nameFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 32, darkColor);
        Font courseFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, darkColor);
        Font textFont = FontFactory.getFont(FontFactory.HELVETICA, 14, Color.BLACK);
        Font schoolFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, primaryColor);

        // 2. RAM & DEKORATION
        PdfContentByte canvas = writer.getDirectContent();
        canvas.setColorStroke(primaryColor);
        canvas.setLineWidth(4);
        // Yttre ram
        canvas.rectangle(20, 20, document.getPageSize().getWidth() - 40, document.getPageSize().getHeight() - 40);
        canvas.stroke();

        // Tunn inre ram
        canvas.setLineWidth(1);
        canvas.setColorStroke(Color.LIGHT_GRAY);
        canvas.rectangle(30, 30, document.getPageSize().getWidth() - 60, document.getPageSize().getHeight() - 60);
        canvas.stroke();

        // 3. LOGOTYP
        try {
            // Se till att lägga 'logo.png' i mappen 'src/main/resources/'
            Image logo = Image.getInstance(new ClassPathResource("logo.png").getURL());
            logo.scaleToFit(80, 80);
            // Centrera loggan i toppen
            logo.setAbsolutePosition((document.getPageSize().getWidth() - logo.getScaledWidth()) / 2, 480);
            document.add(logo);
        } catch (Exception e) {
            System.out.println("Kunde inte ladda logo.png, kör utan.");
        }

        // 4. TEXTINNEHÅLL (Centrerat)

        // Lite space för att inte krocka med loggan
        Paragraph spacer = new Paragraph(" ");
        spacer.setSpacingAfter(60);
        document.add(spacer);

        Paragraph header = new Paragraph("KURSINTYG", titleFont);
        header.setAlignment(Element.ALIGN_CENTER);
        header.setSpacingAfter(30);
        document.add(header);

        Paragraph intro = new Paragraph("Detta intygar härmed att", subTitleFont);
        intro.setAlignment(Element.ALIGN_CENTER);
        intro.setSpacingAfter(10);
        document.add(intro);

        Paragraph studentName = new Paragraph(student.getFullName(), nameFont);
        studentName.setAlignment(Element.ALIGN_CENTER);
        studentName.setSpacingAfter(5);
        document.add(studentName);

        // En dekorativ linje under namnet
        PdfContentByte lineCanvas = writer.getDirectContent();
        lineCanvas.setColorStroke(Color.GRAY);
        lineCanvas.setLineWidth(0.5f);
        lineCanvas.moveTo(250, 330); // Ungefärlig position, justera vid behov
        lineCanvas.lineTo(document.getPageSize().getWidth() - 250, 330);
        lineCanvas.stroke();

        Paragraph middleText = new Paragraph("\nHar framgångsrikt genomfört kursen", subTitleFont);
        middleText.setAlignment(Element.ALIGN_CENTER);
        middleText.setSpacingAfter(15);
        document.add(middleText);

        Paragraph courseTitle = new Paragraph(course.getName(), courseFont);
        courseTitle.setAlignment(Element.ALIGN_CENTER);
        document.add(courseTitle);

        Paragraph courseCode = new Paragraph("Kurskod: " + course.getCourseCode(), textFont);
        courseCode.setAlignment(Element.ALIGN_CENTER);
        courseCode.setSpacingAfter(50);
        document.add(courseCode);

        // 5. SIGNATUR & DATUM (Botten)
        // Vi använder en tabell för att snyggt separera Datum (Vänster) och Signatur (Höger)
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(80);
        table.setWidths(new int[]{1, 1});

        PdfPCell dateCell = new PdfPCell();
        dateCell.setBorder(Rectangle.NO_BORDER);
        dateCell.addElement(new Paragraph("Datum: " + LocalDate.now().format(DateTimeFormatter.ISO_DATE), textFont));
        dateCell.setHorizontalAlignment(Element.ALIGN_LEFT);
        table.addCell(dateCell);

        PdfPCell signCell = new PdfPCell();
        signCell.setBorder(Rectangle.NO_BORDER);
        // Här visar vi det dynamiska skolnamnet
        signCell.addElement(new Paragraph(schoolName, schoolFont));
        signCell.addElement(new Paragraph("Signerat elektroniskt", new Font(FontFactory.HELVETICA, 10, Color.GRAY)));
        signCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(signCell);

        document.add(table);

        document.close();
        return out.toByteArray();
    }
}