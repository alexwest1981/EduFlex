package com.eduflex.backend.service;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.CourseResult;
import com.eduflex.backend.model.Document;
import com.eduflex.backend.model.PdfTemplate;
import com.eduflex.backend.model.SystemSetting;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.*;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.QRCodeWriter;
import com.lowagie.text.Chunk;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

/**
 * Service for automatically generating and storing documents when students complete courses.
 * Generates PDFs with embedded QR codes for authenticity verification.
 */
@Service
public class AutoDocumentService {
    
    private static final Logger logger = LoggerFactory.getLogger(AutoDocumentService.class);
    private static final String VERIFICATION_BASE_URL = "https://www.eduflexlms.se/verify/";
    
    private final DocumentService documentService;
    private final DocumentRepository documentRepository;
    private final StorageService storageService;
    private final CertificateService certificateService;
    private final CourseResultRepository courseResultRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final SystemSettingRepository settingRepository;
    private final PdfTemplateService pdfTemplateService;

    public AutoDocumentService(DocumentService documentService,
                               DocumentRepository documentRepository,
                               StorageService storageService,
                               CertificateService certificateService,
                               CourseResultRepository courseResultRepository,
                               CourseRepository courseRepository,
                               UserRepository userRepository,
                               SystemSettingRepository settingRepository,
                               PdfTemplateService pdfTemplateService) {
        this.documentService = documentService;
        this.documentRepository = documentRepository;
        this.storageService = storageService;
        this.certificateService = certificateService;
        this.courseResultRepository = courseResultRepository;
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
    
    /**
     * Automatically generates and stores a course completion certificate for a student.
     * Called when CourseResult status changes to PASSED.
     * 
     * @param result The CourseResult that was marked as PASSED
     * @return The created Document entity, or null if already exists
     */
    public Document generateCourseCertificate(CourseResult result) {
        try {
            // Check if certificate already exists to prevent duplicates
            List<Document> existing = documentRepository.findByOwnerIdAndOfficialTrue(result.getStudent().getId());
            boolean alreadyExists = existing.stream()
                    .anyMatch(doc -> doc.getSourceType() != null && 
                             doc.getSourceType().equals("COURSE_CERTIFICATE") &&
                             doc.getSourceId() != null &&
                             doc.getSourceId().equals(result.getId()));
            
            if (alreadyExists) {
                logger.info("Certificate already exists for CourseResult ID: {}", result.getId());
                return null;
            }
            
            Course course = result.getCourse();
            User student = result.getStudent();
            
            // Generate unique verification code
            String verificationCode = UUID.randomUUID().toString();
            
            // Generate certificate PDF using existing CertificateService
            byte[] pdfBytes = certificateService.generateCertificate(course.getId(), student.getId());
            
            // Add QR code to PDF (respecting template settings)
            PdfTemplate certTmpl = pdfTemplateService.getActiveTemplate("CERTIFICATE").orElse(null);
            boolean showQr = certTmpl == null || certTmpl.getShowQrCode() == null || certTmpl.getShowQrCode();
            String qrPos = certTmpl != null && certTmpl.getQrPosition() != null ? certTmpl.getQrPosition() : "BOTTOM_RIGHT";
            byte[] pdfWithQR = showQr ? addQRCodeToPDF(pdfBytes, verificationCode, qrPos) : pdfBytes;
            
            // Upload to MinIO
            String fileName = String.format("Kursintyg - %s - %s - %s.pdf",
                    course.getName(),
                    student.getFullName(),
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
            
            ByteArrayInputStream inputStream = new ByteArrayInputStream(pdfWithQR);
            String storageId = storageService.save(inputStream, "application/pdf", fileName);
            
            // Create Document entity
            Document document = new Document();
            document.setFileName(fileName);
            document.setFileType("application/pdf");
            document.setFileUrl(storageId);
            document.setSize((long) pdfWithQR.length);
            document.setOwner(student);
            document.setCategory("CERTIFICATE"); // Will appear in "Intyg" tab
            document.setOfficial(true); // Cannot be deleted by student
            document.setAutoGenerated(true);
            document.setSourceType("COURSE_CERTIFICATE");
            document.setSourceId(result.getId());
            document.setVerificationCode(verificationCode);
            document.setUploadedAt(LocalDateTime.now());
            
            Document saved = documentRepository.save(document);
            logger.info("Auto-generated certificate for student {} - course {}", 
                    student.getFullName(), course.getName());
            
            return saved;
            
        } catch (Exception e) {
            logger.error("Failed to generate course certificate for CourseResult ID: {}", 
                    result.getId(), e);
            return null;
        }
    }
    
    /**
     * Generates a consolidated grade report PDF for a student containing all their course results.
     * Generated on-demand via API endpoint.
     * 
     * @param studentId ID of the student
     * @return PDF bytes of the grade report
     */
    public byte[] generateConsolidatedGradeReport(Long studentId) throws DocumentException, IOException {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<CourseResult> results = courseResultRepository.findByStudentId(studentId);

        if (results.isEmpty()) {
            throw new RuntimeException("No course results found for student");
        }

        String schoolName = settingRepository.findBySettingKey("school_name")
                .map(SystemSetting::getSettingValue)
                .orElse("EduFlex Academy");

        // Load template settings
        PdfTemplate tmpl = pdfTemplateService.getActiveTemplate("GRADE_REPORT").orElse(null);

        if (tmpl != null && tmpl.getSchoolNameOverride() != null && !tmpl.getSchoolNameOverride().isBlank()) {
            schoolName = tmpl.getSchoolNameOverride();
        }

        Color headerColor = parseHexColor(tmpl != null ? tmpl.getSecondaryColor() : null, new Color(30, 41, 59));
        Color titleColor = parseHexColor(tmpl != null ? tmpl.getSecondaryColor() : null, new Color(30, 41, 59));

        String titleStr = tmpl != null && tmpl.getTitleText() != null ? tmpl.getTitleText() : "SAMLADE BETYG";

        // Create PDF document (A4 Portrait)
        com.lowagie.text.Document document = new com.lowagie.text.Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter writer = PdfWriter.getInstance(document, out);
        document.open();

        // --- HEADER ---
        Font titleFont = new Font(Font.HELVETICA, 24, Font.BOLD, titleColor);
        Paragraph title = new Paragraph(titleStr, titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(10);
        document.add(title);

        Font subTitleFont = new Font(Font.HELVETICA, 12, Font.NORMAL, Color.GRAY);
        Paragraph subTitle = new Paragraph(schoolName, subTitleFont);
        subTitle.setAlignment(Element.ALIGN_CENTER);
        subTitle.setSpacingAfter(30);
        document.add(subTitle);

        // Student Info
        Font labelFont = new Font(Font.HELVETICA, 10, Font.BOLD);
        Font valueFont = new Font(Font.HELVETICA, 10, Font.NORMAL);

        Paragraph studentInfo = new Paragraph();
        studentInfo.add(new Chunk("Elev: ", labelFont));
        studentInfo.add(new Chunk(student.getFullName() + "\n", valueFont));
        studentInfo.add(new Chunk("Personnummer: ", labelFont));
        studentInfo.add(new Chunk((student.getUsername() != null ? student.getUsername() : "N/A") + "\n", valueFont));
        studentInfo.add(new Chunk("Utfärdat: ", labelFont));
        studentInfo.add(new Chunk(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")), valueFont));
        studentInfo.setSpacingAfter(20);
        document.add(studentInfo);

        // --- TABLE OF GRADES ---
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{3, 2, 2, 2});

        // Header row
        Font headerFont = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);

        addTableCell(table, "Kurs", headerFont, headerColor);
        addTableCell(table, "Kurskod", headerFont, headerColor);
        addTableCell(table, "Status", headerFont, headerColor);
        addTableCell(table, "Datum", headerFont, headerColor);
        
        // Data rows
        Font dataFont = new Font(Font.HELVETICA, 9, Font.NORMAL);
        for (CourseResult result : results) {
            Course course = result.getCourse();
            
            PdfPCell cell1 = new PdfPCell(new Phrase(course.getName(), dataFont));
            cell1.setPadding(5);
            table.addCell(cell1);
            
            PdfPCell cell2 = new PdfPCell(new Phrase(course.getCourseCode(), dataFont));
            cell2.setPadding(5);
            table.addCell(cell2);
            
            String status = result.getStatus().toString();
            Color statusColor = result.getStatus() == CourseResult.Status.PASSED ? 
                    new Color(34, 197, 94) : new Color(239, 68, 68);
            Font statusFont = new Font(Font.HELVETICA, 9, Font.BOLD, statusColor);
            PdfPCell cell3 = new PdfPCell(new Phrase(status, statusFont));
            cell3.setPadding(5);
            table.addCell(cell3);
            
            String date = result.getGradedAt() != null ? 
                    result.getGradedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) : "-";
            PdfPCell cell4 = new PdfPCell(new Phrase(date, dataFont));
            cell4.setPadding(5);
            table.addCell(cell4);
        }
        
        document.add(table);
        
        // --- FOOTER ---
        Paragraph footer = new Paragraph();
        footer.setSpacingBefore(30);
        footer.add(new Chunk("Detta dokument är automatiskt genererat och saknar signatur.\n", 
                new Font(Font.HELVETICA, 8, Font.ITALIC, Color.GRAY)));
        footer.add(new Chunk("För officiella intyg, se individuella kurscertifikat.", 
                new Font(Font.HELVETICA, 8, Font.ITALIC, Color.GRAY)));
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);
        
        document.close();
        return out.toByteArray();
    }
    
    /**
     * Adds a QR code to the bottom-right corner of an existing PDF.
     * 
     * @param pdfBytes Original PDF bytes
     * @param verificationCode Unique verification code for the QR code
     * @return Modified PDF bytes with QR code
     */
    private byte[] addQRCodeToPDF(byte[] pdfBytes, String verificationCode, String position)
            throws IOException, DocumentException, WriterException {

        // Generate QR code image
        String qrContent = VERIFICATION_BASE_URL + verificationCode;
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(qrContent, BarcodeFormat.QR_CODE, 150, 150);
        BufferedImage qrImage = MatrixToImageWriter.toBufferedImage(bitMatrix);

        // Read existing PDF
        PdfReader reader = new PdfReader(pdfBytes);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfStamper stamper = new PdfStamper(reader, out);

        // Add QR code to first page
        PdfContentByte canvas = stamper.getOverContent(1);
        Image qrPdfImage = Image.getInstance(qrImage, null);

        float qrSize = 100;
        float margin = 25;
        float pageWidth = reader.getPageSize(1).getWidth();
        float pageHeight = reader.getPageSize(1).getHeight();

        float x, y;
        switch (position != null ? position : "BOTTOM_RIGHT") {
            case "BOTTOM_LEFT":
                x = margin;
                y = margin;
                break;
            case "TOP_RIGHT":
                x = pageWidth - qrSize - margin;
                y = pageHeight - qrSize - margin;
                break;
            case "TOP_LEFT":
                x = margin;
                y = pageHeight - qrSize - margin;
                break;
            default: // BOTTOM_RIGHT
                x = pageWidth - qrSize - margin;
                y = margin;
                break;
        }

        qrPdfImage.scaleToFit(qrSize, qrSize);
        qrPdfImage.setAbsolutePosition(x, y);

        try {
            canvas.addImage(qrPdfImage);
        } catch (DocumentException e) {
            logger.error("Failed to add QR code to PDF", e);
        }

        stamper.close();
        reader.close();

        return out.toByteArray();
    }
    
    /**
     * Helper method to add styled cells to PDF table
     */
    private void addTableCell(PdfPTable table, String text, Font font, Color bgColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bgColor);
        cell.setPadding(8);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }
}
