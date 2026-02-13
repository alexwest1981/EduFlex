package com.eduflex.backend.model;

import com.eduflex.backend.util.EncryptedStringConverter;
import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "wellbeing_support_messages")
public class WellbeingSupportMessage implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private WellbeingSupportRequest request;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(columnDefinition = "TEXT", nullable = false)
    @Convert(converter = EncryptedStringConverter.class)
    private String content;

    private LocalDateTime createdAt = LocalDateTime.now();

    public WellbeingSupportMessage() {
    }

    public WellbeingSupportMessage(WellbeingSupportRequest request, User sender, String content) {
        this.request = request;
        this.sender = sender;
        this.content = content;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public WellbeingSupportRequest getRequest() {
        return request;
    }

    public void setRequest(WellbeingSupportRequest request) {
        this.request = request;
    }

    public User getSender() {
        return sender;
    }

    public void setSender(User sender) {
        this.sender = sender;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
