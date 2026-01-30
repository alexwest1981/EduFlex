package com.eduflex.backend.service.reader;

import com.eduflex.backend.dto.BookChapterDto;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

public class EpubBookContent implements BookContent {

    private final String title;

    public EpubBookContent(InputStream inputStream) {
        // Stub: In a real implementation, use an EPUB library like epublib or epub4j
        this.title = "EPUB Document (Parsing not implemented)";
    }

    @Override
    public String getTitle() {
        return title;
    }

    @Override
    public String getAuthor() {
        return "Unknown Author";
    }

    @Override
    public List<BookChapterDto> getChapters() {
        List<BookChapterDto> chapters = new ArrayList<>();
        chapters.add(new BookChapterDto("Start", 1));
        return chapters;
    }

    @Override
    public int getPageCount() {
        return 0; // EPUBs are reflowable, page count is variable
    }

    @Override
    public InputStream getPageImage(int pageNumber) {
        return null; // EPUBs usually render as HTML in frontend
    }

    @Override
    public String getCoverImage() {
        return null;
    }

    @Override
    public void close() throws Exception {
        // Nothing to close in stub
    }
}
