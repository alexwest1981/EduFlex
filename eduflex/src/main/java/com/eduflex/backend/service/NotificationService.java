package com.eduflex.backend.service;

import com.eduflex.backend.model.Notification;
import com.eduflex.backend.repository.NotificationRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final SmsService smsService;
    private final WebPushService webPushService;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            EmailService emailService,
            SmsService smsService,
            WebPushService webPushService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.smsService = smsService;
        this.webPushService = webPushService;
    }

    /**
     * Create a new notification for a user with optional external channels
     */
    @Transactional
    public Notification createNotification(
            Long userId,
            String message,
            String type,
            Long relatedEntityId,
            String relatedEntityType,
            String actionUrl,
            boolean sendEmail,
            boolean sendSms,
            boolean sendPush) {

        // 1. Create Internal Notification
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRelatedEntityId(relatedEntityId);
        notification.setRelatedEntityType(relatedEntityType);
        notification.setActionUrl(actionUrl);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);

        Notification saved = notificationRepository.save(notification);

        // 2. Handle External Channels
        if (sendEmail || sendSms || sendPush) {
            userRepository.findById(userId).ifPresent(user -> {
                if (sendEmail && user.getEmail() != null) {
                    emailService.sendSimpleEmail(user.getEmail(), "EduFlex Notis: " + type, message);
                }

                if (sendSms && user.getPhone() != null) {
                    smsService.sendSms(user.getPhone(), "[EduFlex] " + message);
                }

                if (sendPush) {
                    webPushService.sendPushNotification(userId, "EduFlex Notis", message, actionUrl);
                }
            });
        }

        return saved;
    }

    /**
     * Legacy method for backward compatibility
     */
    @Transactional
    public Notification createNotification(
            Long userId,
            String message,
            String type,
            Long relatedEntityId,
            String relatedEntityType,
            String actionUrl) {
        return createNotification(userId, message, type, relatedEntityId, relatedEntityType, actionUrl, false, false,
                false);
    }

    /**
     * Get unread notification count for a user
     */
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    /**
     * Mark all notifications as read for a user
     */
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndReadFalse(userId);
        unreadNotifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    /**
     * Get all notifications for a user (ordered by creation date, newest first)
     */
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Mark a single notification as read
     */
    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }
}
