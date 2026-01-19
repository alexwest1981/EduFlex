package com.eduflex.backend.dto;

import lombok.Data;

@Data
public class ContactRequest {
    private String name;
    private String email;
    private String organization;
    private String phone;
    private String message;
}
