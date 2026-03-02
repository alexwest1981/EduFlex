package com.eduflex.backend.service.ai;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.CourseMaterial;
import com.eduflex.backend.repository.CourseMaterialRepository;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.service.MinioStorageService;
import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class LessonExportService {

    private static final Logger logger = LoggerFactory.getLogger(LessonExportService.class);

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseMaterialRepository materialRepository;

    @Autowired
    private MinioStorageService storageService;

    @Autowired
    private GeminiService geminiService;

    public void exportToPdf(Long courseId, Long lessonId) throws IOException {
        CourseMaterial lesson = materialRepository.findById(lessonId).orElseThrow();
        Course course = courseRepository.findById(courseId).orElseThrow();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();
        PdfWriter.getInstance(document, out);
        document.open();
        document.add(new Paragraph(lesson.getTitle()));
        document.add(new Paragraph("\n"));
        // Clean HTML for basic PDF presentation
        String content = lesson.getContent().replaceAll("<[^>]*>", "");
        document.add(new Paragraph(content));
        document.close();

        saveMaterial(course, lesson, "pdf", out.toByteArray(), CourseMaterial.MaterialType.FILE);
    }

    public void exportToWord(Long courseId, Long lessonId) throws IOException {
        CourseMaterial lesson = materialRepository.findById(lessonId).orElseThrow();
        Course course = courseRepository.findById(courseId).orElseThrow();

        XWPFDocument document = new XWPFDocument();
        XWPFParagraph title = document.createParagraph();
        XWPFRun titleRun = title.createRun();
        titleRun.setText(lesson.getTitle());
        titleRun.setBold(true);
        titleRun.setFontSize(20);

        XWPFParagraph body = document.createParagraph();
        XWPFRun bodyRun = body.createRun();
        String content = lesson.getContent().replaceAll("<[^>]*>", "");
        bodyRun.setText(content);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        document.write(out);
        document.close();

        saveMaterial(course, lesson, "docx", out.toByteArray(), CourseMaterial.MaterialType.FILE);
    }

    public void exportToExcel(Long courseId, Long lessonId) throws IOException {
        CourseMaterial lesson = materialRepository.findById(lessonId).orElseThrow();
        Course course = courseRepository.findById(courseId).orElseThrow();

        // Use AI to extract key points or vocabulary for Excel
        String prompt = "Extrahera viktiga begrepp och deras förklaringar från följande lektionstext till en punktlista. Returnera endast listan.\n\n"
                + lesson.getContent();
        String aiResponse = geminiService.generateResponse(prompt);

        XSSFWorkbook workbook = new XSSFWorkbook();
        XSSFSheet sheet = workbook.createSheet("Lektionssammanfattning");

        String[] lines = aiResponse.split("\n");
        int rowNum = 0;
        for (String line : lines) {
            if (line.trim().isEmpty())
                continue;
            XSSFRow row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(line.trim());
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();

        saveMaterial(course, lesson, "xlsx", out.toByteArray(), CourseMaterial.MaterialType.FILE);
    }

    public void exportToEpub(Long courseId, Long lessonId) throws IOException {
        CourseMaterial lesson = materialRepository.findById(lessonId).orElseThrow();
        Course course = courseRepository.findById(courseId).orElseThrow();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(out)) {
            // Mimetype file (must be first and uncompressed)
            ZipEntry mimetype = new ZipEntry("mimetype");
            mimetype.setMethod(ZipEntry.STORED);
            byte[] mimetypeBytes = "application/epub+zip".getBytes();
            mimetype.setSize(mimetypeBytes.length);
            mimetype.setCrc(calculateCrc(mimetypeBytes));
            zos.putNextEntry(mimetype);
            zos.write(mimetypeBytes);
            zos.closeEntry();

            // Minimal container.xml
            zos.putNextEntry(new ZipEntry("META-INF/container.xml"));
            zos.write(("<?xml version=\"1.0\"?>\n" +
                    "<container version=\"1.0\" xmlns=\"urn:oasis:names:tc:opendocument:xmlns:container\">\n" +
                    "  <rootfiles>\n" +
                    "    <rootfile full-path=\"content.opf\" media-type=\"application/oebps-package+xml\"/>\n" +
                    "  </rootfiles>\n" +
                    "</container>").getBytes());
            zos.closeEntry();

            // Minimal content.opf
            zos.putNextEntry(new ZipEntry("content.opf"));
            zos.write(("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                    "<package xmlns=\"http://www.idpf.org/2007/opf\" unique-identifier=\"uid\" version=\"3.0\">\n" +
                    "  <metadata xmlns:dc=\"http://purl.org/dc/elements/1.1/\">\n" +
                    "    <dc:title>" + lesson.getTitle() + "</dc:title>\n" +
                    "    <dc:identifier id=\"uid\">" + UUID.randomUUID().toString() + "</dc:identifier>\n" +
                    "    <dc:language>sv</dc:language>\n" +
                    "  </metadata>\n" +
                    "  <manifest>\n" +
                    "    <item id=\"content\" href=\"content.xhtml\" media-type=\"application/xhtml+xml\"/>\n" +
                    "  </manifest>\n" +
                    "  <spine>\n" +
                    "    <itemref idref=\"content\"/>\n" +
                    "  </spine>\n" +
                    "</package>").getBytes());
            zos.closeEntry();

            // content.xhtml
            zos.putNextEntry(new ZipEntry("content.xhtml"));
            zos.write(("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                    "<html xmlns=\"http://www.w3.org/1999/xhtml\">\n" +
                    "  <head><title>" + lesson.getTitle() + "</title></head>\n" +
                    "  <body>\n" +
                    "    <h1>" + lesson.getTitle() + "</h1>\n" +
                    "    <div>" + lesson.getContent() + "</div>\n" +
                    "  </body>\n" +
                    "</html>").getBytes());
            zos.closeEntry();
        }

        saveMaterial(course, lesson, "epub", out.toByteArray(), CourseMaterial.MaterialType.EPUB);
    }

    private long calculateCrc(byte[] bytes) {
        java.util.zip.CRC32 crc = new java.util.zip.CRC32();
        crc.update(bytes);
        return crc.getValue();
    }

    private void saveMaterial(Course course, CourseMaterial lesson, String extension, byte[] data,
            CourseMaterial.MaterialType type) throws IOException {
        String fileName = "Export_" + lesson.getTitle().replaceAll("[^a-zA-Z0-9]", "_") + "_"
                + System.currentTimeMillis() + "." + extension;
        // storageService.save returns the storage ID (customId if provided)
        String storageId = storageService.save(new ByteArrayInputStream(data), "application/octet-stream", fileName,
                fileName);

        CourseMaterial material = new CourseMaterial();
        material.setCourse(course);
        material.setTitle(lesson.getTitle() + " (" + extension.toUpperCase() + ")");
        material.setFileUrl(storageId);
        material.setType(type);
        material.setAvailableFrom(LocalDateTime.now());

        materialRepository.save(material);
        logger.info("Saved exported {} material for lesson {}", extension, lesson.getId());
    }
}
