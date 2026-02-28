package com.eduflex.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_saved_ebooks", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "user_id", "ebook_id" })
})
@Getter
@Setter
@NoArgsConstructor
public class UserSavedEbook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ebook_id", nullable = false)
    private Ebook ebook;

    private LocalDateTime savedAt = LocalDateTime.now();

    public UserSavedEbook(User user, Ebook ebook) {
        this.user = user;
        this.ebook = ebook;
        this.savedAt = LocalDateTime.now();
    }
}
