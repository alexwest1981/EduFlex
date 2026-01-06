package com.eduflex.backend.service;

import com.eduflex.backend.dto.MessageDTO;
import com.eduflex.backend.model.Message;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.MessageRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public MessageService(MessageRepository messageRepository, UserRepository userRepository) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    public MessageDTO sendMessage(Long senderId, Long recipientId, String subject, String content) {
        User sender = userRepository.findById(senderId).orElseThrow(() -> new RuntimeException("Sender not found"));
        User recipient = userRepository.findById(recipientId).orElseThrow(() -> new RuntimeException("Recipient not found"));

        Message msg = new Message();
        msg.setSender(sender);
        msg.setRecipient(recipient);
        msg.setSubject(subject);
        msg.setContent(content);

        Message savedMsg = messageRepository.save(msg);
        return convertToDTO(savedMsg);
    }

    public List<MessageDTO> getInbox(Long userId) {
        return messageRepository.findByRecipientIdOrderByTimestampDesc(userId)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<MessageDTO> getSent(Long userId) {
        return messageRepository.findBySenderIdOrderByTimestampDesc(userId)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public void markAsRead(Long messageId) {
        messageRepository.findById(messageId).ifPresent(msg -> {
            msg.setRead(true);
            messageRepository.save(msg);
        });
    }

    public long getUnreadCount(Long userId) {
        return messageRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    private MessageDTO convertToDTO(Message msg) {
        return new MessageDTO(
                msg.getId(),
                msg.getSender().getId(),
                msg.getSender().getFullName(),
                msg.getRecipient().getId(),
                msg.getRecipient().getFullName(),
                msg.getSubject(),
                msg.getContent(),
                msg.getTimestamp(),
                msg.isRead()
        );
    }
}