package com.eduflex.backend.service;

import com.eduflex.backend.dto.LtiScoreDTO;
import com.eduflex.backend.repository.LtiLaunchRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

class LtiAgsServiceTest {

    @Mock
    private LtiAdvantageService advantageService;

    @Mock
    private LtiLaunchRepository ltiLaunchRepository;

    @Mock
    private RestTemplate restTemplate;

    private LtiAgsService agsService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        agsService = new LtiAgsService(advantageService, ltiLaunchRepository, restTemplate);
    }

    @Test
    void testPostScore_Success() {
        // Arrange
        String platformIssuer = "http://canvas.instructure.com";
        String lineItemUrl = "http://canvas.instructure.com/api/lti/courses/1/line_items/2";
        LtiScoreDTO score = new LtiScoreDTO();
        score.setUserId("user123");
        score.setScoreGiven(95.0);
        score.setScoreMaximum(100.0);
        score.setActivityProgress("Completed");
        score.setGradingProgress("FullyGraded");

        when(advantageService.getAccessToken(eq(platformIssuer), anyString())).thenReturn("mock-token");

        when(restTemplate.postForEntity(
                anyString(),
                any(HttpEntity.class),
                eq(String.class))).thenReturn(new ResponseEntity<>("Score Posted", HttpStatus.OK));

        // Act
        boolean result = agsService.postScore(platformIssuer, lineItemUrl, score);

        // Assert
        assertTrue(result);
    }
}
