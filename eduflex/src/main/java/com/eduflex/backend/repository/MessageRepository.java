package com.eduflex.backend.repository;

import com.eduflex.backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    // Hämta inkorg (där jag är mottagare), sorterat nyast först
    List<Message> findByRecipientIdOrderByTimestampDesc(Long recipientId);

    // Hämta skickat (där jag är avsändare)
    List<Message> findBySenderIdOrderByTimestampDesc(Long senderId);

    // Räkna olästa meddelanden
    long countByRecipientIdAndIsReadFalse(Long recipientId);
}