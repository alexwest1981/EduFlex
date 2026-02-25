package com.eduflex.backend.service;

import com.eduflex.backend.model.IndividualStudyPlan;
import com.eduflex.backend.model.IspPlannedCourse;
import com.eduflex.backend.model.User;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class IspPdfService {

    private final IspService ispService;

    public byte[] generateIspPdf(Long id, User requestingUser) {
        IndividualStudyPlan plan = ispService.getPlanById(id, requestingUser);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            // Font definitions
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            // Title
            Paragraph title = new Paragraph("Individuell Studieplan (ISP)", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Basic Info
            document.add(new Paragraph(
                    "Student: " + plan.getStudent().getFirstName() + " " + plan.getStudent().getLastName(),
                    headerFont));
            document.add(new Paragraph("Status: " + plan.getStatus(), normalFont));
            document.add(new Paragraph("Version: " + plan.getVersion(), normalFont));
            document.add(new Paragraph(
                    "Datum: " + plan.getUpdatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")), normalFont));
            document.add(new Paragraph(
                    "Studievägledare: " + plan.getCounselor().getFirstName() + " " + plan.getCounselor().getLastName(),
                    normalFont));
            document.add(Chunk.NEWLINE);

            // Sections
            addSection(document, "Syfte / Mål med studierna", plan.getSyfte(), headerFont, normalFont);
            addSection(document, "Utbildningsbakgrund", plan.getBakgrund(), headerFont, normalFont);
            addSection(document, "Mål för examen", plan.getMal(), headerFont, normalFont);
            addSection(document, "Stödbehov", plan.getStodbehoV(), headerFont, normalFont);
            addSection(document, "Validering / Tidigare meriter", plan.getValidering(), headerFont, normalFont);
            addSection(document, "Anteckningar (SYV)", plan.getCounselorNotes(), headerFont, normalFont);

            document.add(new Paragraph("Planerade kurser", headerFont));
            document.add(Chunk.NEWLINE);

            for (IspPlannedCourse course : plan.getPlannedCourses()) {
                String line = String.format("- %s (%s): %d poäng, %s, %d%%",
                        course.getCourseName(),
                        course.getCourseCode() != null ? course.getCourseCode() : "N/A",
                        course.getPoints(),
                        course.getLevel(),
                        course.getStudyPacePct());
                document.add(new Paragraph(line, normalFont));
            }

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Error generating ISP PDF", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "PDF generering misslyckades");
        }
    }

    private void addSection(Document doc, String title, String content, Font h, Font n) throws DocumentException {
        if (content != null && !content.trim().isEmpty()) {
            doc.add(new Paragraph(title, h));
            doc.add(new Paragraph(content, n));
            doc.add(Chunk.NEWLINE);
        }
    }
}
