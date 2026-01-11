package com.eduflex.backend.repository;

import com.eduflex.backend.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    // Hämta chatt mellan två användare (både skickade och mottagna)
    List<ChatMessage> findBySenderIdAndRecipientIdOrSenderIdAndRecipientIdOrderByTimestampAsc(
            Long senderId1, Long recipientId1, Long senderId2, Long recipientId2);

    // Paginerad historik (Nyast först för effektiv laddning)
    Page<ChatMessage> findBySenderIdAndRecipientIdOrSenderIdAndRecipientIdOrderByTimestampDesc(
            Long senderId1, Long recipientId1, Long senderId2, Long recipientId2, Pageable pageable);

    // Hämta olästa meddelanden för en mottagare
    List<ChatMessage> findByRecipientIdAndIsReadFalse(Long recipientId);
}