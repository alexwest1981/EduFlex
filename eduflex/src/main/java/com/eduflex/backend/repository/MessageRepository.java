package com.eduflex.backend.repository;

import com.eduflex.backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    // Hämta inkorg (där jag är mottagare och meddelandet inte ligger i en mapp),
    // sorterat nyast först
    List<Message> findByRecipientIdAndFolderIsNullOrderByTimestampDesc(Long recipientId);

    List<Message> findByRecipientIdOrderByTimestampDesc(Long recipientId);

    // Hämta skickat (där jag är avsändare)
    List<Message> findBySenderIdOrderByTimestampDesc(Long senderId);

    // Räkna olästa meddelanden
    long countByRecipientIdAndIsReadFalse(Long recipientId);

    // Hämta specifikt mappinnehåll
    List<Message> findByRecipientIdAndFolder_SlugOrderByTimestampDesc(Long recipientId, String slug);

    // Hämta hela konversationer (threading)
    List<Message> findByParentIdOrderByTimestampAsc(Long parentId);

    // Bulk: markera flera som lästa
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.id IN :ids AND m.recipient.id = :userId")
    int bulkMarkAsRead(@Param("ids") List<Long> ids, @Param("userId") Long userId);

    // Bulk: markera ALLA som lästa (inkorg = folder is null)
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.recipient.id = :userId AND m.isRead = false AND m.folder IS NULL")
    int markAllAsReadInbox(@Param("userId") Long userId);

    // Bulk: markera alla som lästa i specifik mapp
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.recipient.id = :userId AND m.isRead = false AND m.folder.slug = :slug")
    int markAllAsReadInFolder(@Param("userId") Long userId, @Param("slug") String slug);

    // Bulk: ta bort (säkert — verifierar att användaren äger meddelandet)
    @Modifying
    @Query("DELETE FROM Message m WHERE m.id IN :ids AND m.recipient.id = :userId")
    int bulkDeleteByRecipient(@Param("ids") List<Long> ids, @Param("userId") Long userId);
}