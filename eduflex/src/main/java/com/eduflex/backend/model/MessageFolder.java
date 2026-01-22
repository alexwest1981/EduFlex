package com.eduflex.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "message_folders")
public class MessageFolder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    // Optional: slug for system folders (e.g., 'trash', 'archive')
    private String slug;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public MessageFolder() {
    }

    public MessageFolder(String name, User user, String slug) {
        this.name = name;
        this.user = user;
        this.slug = slug;
    }

    // Getters & Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
