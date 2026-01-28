package com.eduflex.backend.event;

import java.io.Serializable;

public class DocumentUploadedEvent implements Serializable {
    private Long documentId;
    private String fileName;
    private String fileUrl;
    private String contentType;
    private Long fileSize;
    private Long ownerId;

    public DocumentUploadedEvent() {
    }

    public DocumentUploadedEvent(Long documentId, String fileName, String fileUrl, String contentType, Long fileSize,
            Long ownerId) {
        this.documentId = documentId;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.ownerId = ownerId;
    }

    public Long getDocumentId() {
        return documentId;
    }

    public String getFileName() {
        return fileName;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public String getContentType() {
        return contentType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }
}
