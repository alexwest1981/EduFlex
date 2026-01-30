package com.eduflex.backend.dto;

import java.util.List;

public record BookMetadataDto(
        String title,
        String author,
        int pageCount,
        List<BookChapterDto> chapters,
        String coverImage) {
}
