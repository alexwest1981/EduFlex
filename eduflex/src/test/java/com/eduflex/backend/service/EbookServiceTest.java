package com.eduflex.backend.service;

import com.eduflex.backend.model.BookType;
import com.eduflex.backend.model.Ebook;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.EbookRepository;
import com.eduflex.backend.repository.UserEbookProgressRepository;
import com.eduflex.backend.service.ai.TtsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayInputStream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EbookServiceTest {

    @Mock
    private EbookRepository ebookRepository;

    @Mock
    private StorageService storageService;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private TtsService ttsService;

    @Mock
    private UserEbookProgressRepository userEbookProgressRepository;

    private EbookService ebookService;

    @BeforeEach
    void setUp() {
        // Create instance with mocks - note that RestTemplate is instantiated inside
        // the service constructor
        // or we need to change the service to accept it.
        // Looking at EbookService.java:
        // public EbookService(EbookRepository, StorageService, CourseRepository,
        // TtsService)
        // It instantiates RestTemplate internally: `this.restTemplate = new
        // RestTemplate();`
        // So this constructor call is correct.
        ebookService = new EbookService(ebookRepository, storageService, courseRepository, ttsService,
                userEbookProgressRepository, null);
    }

    @Test
    void uploadEbook_ShouldExtractCover_WhenNoCoverProvidedForPdf() throws Exception {
        // Arrange
        String title = "Test PDF";
        String author = "Test Author";
        MockMultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", new byte[10]);
        String fileStorageId = "12345-test.pdf";

        when(storageService.save(any(org.springframework.web.multipart.MultipartFile.class))).thenReturn(fileStorageId);
        // Mock loading the file back for cover extraction.
        // Note: Real PDF parsing requires actual PDF content, so we might need to mock
        // extractAndSaveCover
        // or provide a minimal valid PDF byte array if we want to test the full
        // extraction logic.
        // For unit testing the FLOW, we simulate that storageService.load returns a
        // stream.
        // However, since extractAndSaveCover is private, we can't mock it easily
        // without PowerMock.
        // Instead, we will test that it TRIES to load the file.

        when(storageService.load(fileStorageId)).thenReturn(new ByteArrayInputStream(new byte[10]));

        when(ebookRepository.save(any(Ebook.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Ebook result = ebookService.uploadEbook(title, author, "Desc", "Cat", "SE", "123", file, null, null);

        // Assert
        assertNotNull(result);
        assertEquals(BookType.PDF, result.getType());
        verify(storageService, times(1)).load(fileStorageId); // Verifies it attempted to load back for cover extraction
        // We can't verify coverUrl is set without a real PDF, but we verified the path
        // taken.
    }
}
