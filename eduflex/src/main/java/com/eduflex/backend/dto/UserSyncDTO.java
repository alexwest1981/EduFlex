package com.eduflex.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSyncDTO {
    private String externalId; // Employee ID from HR system
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String ssn;
    private String role; // e.g. STUDENT, TEACHER
    private boolean active;
    private String department;
}
