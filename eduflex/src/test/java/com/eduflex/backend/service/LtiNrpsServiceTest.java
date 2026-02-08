package com.eduflex.backend.service;

import com.eduflex.backend.dto.LtiMembershipResponse;
import com.eduflex.backend.dto.LtiMembershipResponse.LtiMember;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

class LtiNrpsServiceTest {

    @Mock
    private LtiAdvantageService advantageService;

    @Mock
    private RestTemplate restTemplate;

    private LtiNrpsService nrpsService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        nrpsService = new LtiNrpsService(advantageService, restTemplate);
    }

    @Test
    void testGetMemberships_Success() {
        // Arrange
        String platformIssuer = "http://canvas.instructure.com";
        String membershipsUrl = "http://canvas.instructure.com/api/lti/courses/1/names_and_roles";
        String accessToken = "mock-access-token";

        when(advantageService.getAccessToken(eq(platformIssuer), anyString())).thenReturn(accessToken);

        LtiMembershipResponse mockResponse = new LtiMembershipResponse();
        LtiMember member = new LtiMember();
        member.setEmail("student@example.com");
        member.setName("Test Student");
        member.setRoles(Collections.singletonList("http://purl.imsglobal.org/vocab/lis/v2/membership#Learner"));
        mockResponse.setMembers(Collections.singletonList(member));

        when(restTemplate.exchange(
                eq(membershipsUrl),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(LtiMembershipResponse.class))).thenReturn(new ResponseEntity<>(mockResponse, HttpStatus.OK));

        // Act
        LtiMembershipResponse result = nrpsService.getMemberships(platformIssuer, membershipsUrl);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getMembers().size());
        assertEquals("student@example.com", result.getMembers().get(0).getEmail());
        assertEquals("Test Student", result.getMembers().get(0).getName());
    }
}
