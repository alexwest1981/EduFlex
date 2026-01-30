package com.eduflex.backend.service.reader;

import com.eduflex.backend.dto.BookChapterDto;
import java.io.InputStream;
import java.util.List;

public interface BookContent extends AutoCloseable {
    String getTitle();

    String getAuthor();

    List<BookChapterDto> getChapters();

    int getPageCount();

    InputStream getPageImage(int pageNumber);

    String getCoverImage();

    @Override
    void close() throws Exception;
}
