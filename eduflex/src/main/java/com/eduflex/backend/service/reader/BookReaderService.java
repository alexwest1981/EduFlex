package com.eduflex.backend.service.reader;

import com.eduflex.backend.service.StorageService;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;

@Service
public class BookReaderService {

    private final StorageService storageService;

    public BookReaderService(StorageService storageService) {
        this.storageService = storageService;
    }

    public BookContent loadBook(String fileUrl) throws Exception {
        // fileUrl is like /api/storage/ID
        String storageId = fileUrl.replace("/api/storage/", "");
        InputStream inputStream = storageService.load(storageId);

        if (fileUrl.toLowerCase().endsWith(".pdf") || isPdf(inputStream)) {
            // Re-open stream if we read it to check signature
            inputStream = storageService.load(storageId);
            return new PdfBookContent(inputStream);
        } else if (fileUrl.toLowerCase().endsWith(".epub")) {
            return new EpubBookContent(inputStream);
        }

        throw new UnsupportedOperationException("Unsupported book format: " + fileUrl);
    }

    private boolean isPdf(InputStream is) {
        try {
            byte[] header = new byte[4];
            is.mark(4);
            int read = is.read(header);
            is.reset();
            return read == 4 && new String(header).equals("%PDF");
        } catch (IOException e) {
            return false;
        }
    }
}
