package com.eduflex.backend.service.reader;

import com.eduflex.backend.dto.BookChapterDto;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDDocumentInformation;
import org.apache.pdfbox.pdmodel.interactive.documentnavigation.destination.PDPageDestination;
import org.apache.pdfbox.pdmodel.interactive.documentnavigation.outline.PDOutlineItem;
import org.apache.pdfbox.pdmodel.interactive.documentnavigation.outline.PDOutlineNode;
import org.apache.pdfbox.rendering.PDFRenderer;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

public class PdfBookContent implements BookContent {

    private final PDDocument document;
    private final PDFRenderer renderer;

    public PdfBookContent(InputStream inputStream) throws IOException {
        // PDFBox 2.0 uses PDDocument.load
        this.document = PDDocument.load(inputStream);
        this.renderer = new PDFRenderer(document);
    }

    @Override
    public String getTitle() {
        PDDocumentInformation info = document.getDocumentInformation();
        return (info != null && info.getTitle() != null) ? info.getTitle() : "Untitled PDF";
    }

    @Override
    public String getAuthor() {
        PDDocumentInformation info = document.getDocumentInformation();
        return (info != null && info.getAuthor() != null) ? info.getAuthor() : "Unknown Author";
    }

    @Override
    public List<BookChapterDto> getChapters() {
        List<BookChapterDto> chapters = new ArrayList<>();
        try {
            PDOutlineNode outline = document.getDocumentCatalog().getDocumentOutline();
            if (outline != null) {
                extractChapters(outline, chapters);
            }
        } catch (IOException e) {
            // Log error or fallback
        }

        if (chapters.isEmpty()) {
            chapters.add(new BookChapterDto("Cover", 1));
        }
        return chapters;
    }

    private void extractChapters(PDOutlineNode node, List<BookChapterDto> chapters) throws IOException {
        PDOutlineItem current = node.getFirstChild();
        while (current != null) {
            int pageNum = 1;
            if (current.getDestination() instanceof PDPageDestination dest) {
                pageNum = dest.retrievePageNumber() + 1;
            }
            chapters.add(new BookChapterDto(current.getTitle(), pageNum));

            // Recursive for nested chapters if needed, but keeping it flat for now as per
            // DTO
            if (current.hasChildren()) {
                extractChapters(current, chapters);
            }
            current = current.getNextSibling();
        }
    }

    @Override
    public int getPageCount() {
        return document.getNumberOfPages();
    }

    @Override
    public InputStream getPageImage(int pageNumber) {
        try {
            // pageNumber is 1-based from UI, PDFBox is 0-based
            BufferedImage image = renderer.renderImageWithDPI(pageNumber - 1, 150);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "png", baos);
            return new ByteArrayInputStream(baos.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to render PDF page", e);
        }
    }

    @Override
    public String getCoverImage() {
        try {
            BufferedImage image = renderer.renderImageWithDPI(0, 72); // Lower DPI for thumbnail
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "png", baos);
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(baos.toByteArray());
        } catch (IOException e) {
            return null;
        }
    }

    @Override
    public void close() throws Exception {
        if (document != null) {
            document.close();
        }
    }
}
