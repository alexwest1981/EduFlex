package com.eduflex.backend.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DocumentUploadedEvent implements Serializable {
    private Long documentId;
    private String fileName;
    private String fileUrl;
    private String contentType;
    private Long fileSize;
    private Long ownerId;
}
