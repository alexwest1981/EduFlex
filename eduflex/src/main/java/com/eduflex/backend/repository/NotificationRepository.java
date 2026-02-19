package com.eduflex.backend.repository;
public interface NotificationRepository extends org.springframework.data.jpa.repository.JpaRepository<com.eduflex.backend.model.Notification, Long> {
    java.util.List<com.eduflex.backend.model.Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserIdAndReadFalse(Long userId);
    java.util.List<com.eduflex.backend.model.Notification> findByUserIdAndReadFalse(Long userId);
}
