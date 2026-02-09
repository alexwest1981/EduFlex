package com.eduflex.backend.service;

import com.eduflex.backend.dto.AttachmentDTO;
import com.eduflex.backend.dto.MessageDTO;
import com.eduflex.backend.model.Message;
import com.eduflex.backend.model.MessageAttachment;
import com.eduflex.backend.model.MessageFolder;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.MessageFolderRepository;
import com.eduflex.backend.repository.MessageFolderRepository;
import com.eduflex.backend.repository.MessageRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.eduflex.backend.service.StorageService;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final com.eduflex.backend.repository.MessageFolderRepository messageFolderRepository;
    private final StorageService storageService;

    public MessageService(MessageRepository messageRepository, UserRepository userRepository,
            com.eduflex.backend.repository.MessageFolderRepository messageFolderRepository,
            StorageService storageService) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.messageFolderRepository = messageFolderRepository;
        this.storageService = storageService;
    }

    public MessageDTO sendMessage(Long senderId, Long recipientId, String subject, String content, String folderSlug) {
        return sendMessage(senderId, recipientId, subject, content, folderSlug, null, null);
    }

    public MessageDTO sendMessage(Long senderId, Long recipientId, String subject, String content, String folderSlug,
            Long parentId, List<MultipartFile> files) {
        User sender = senderId != null
                ? userRepository.findById(senderId).orElseThrow(() -> new RuntimeException("Sender not found"))
                : null;
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new RuntimeException("Recipient not found"));

        Message msg = new Message();
        msg.setSender(sender);
        msg.setRecipient(recipient);
        msg.setSubject(subject);
        msg.setContent(content);
        msg.setParentId(parentId);

        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String storageId = storageService.save(file);
                    String url = "/api/storage/" + storageId;
                    msg.addAttachment(
                            new MessageAttachment(file.getOriginalFilename(), file.getContentType(), url, msg));
                }
            }
        }

        if (folderSlug != null) {
            com.eduflex.backend.model.MessageFolder folder = getOrCreateFolder(recipient, folderSlug, folderSlug);
            msg.setFolder(folder);
        }

        Message savedMsg = messageRepository.save(msg);
        return convertToDTO(savedMsg);
    }

    private com.eduflex.backend.model.MessageFolder getOrCreateFolder(User user, String name, String slug) {
        return messageFolderRepository.findByUserId(user.getId()).stream()
                .filter(f -> slug.equals(f.getSlug()))
                .findFirst()
                .orElseGet(() -> messageFolderRepository
                        .save(new com.eduflex.backend.model.MessageFolder(name, user, slug)));
    }

    public List<com.eduflex.backend.model.MessageFolder> getFolders(Long userId) {
        return messageFolderRepository.findByUserId(userId);
    }

    public com.eduflex.backend.model.MessageFolder createFolder(Long userId, String name) {
        User user = userRepository.findById(userId).orElseThrow();
        String slug = name.toLowerCase().replace(" ", "-");
        return messageFolderRepository.save(new com.eduflex.backend.model.MessageFolder(name, user, slug));
    }

    public void moveMessageToFolder(Long messageId, Long folderId) {
        Message msg = messageRepository.findById(messageId).orElseThrow();
        com.eduflex.backend.model.MessageFolder folder = folderId != null
                ? messageFolderRepository.findById(folderId).orElseThrow()
                : null;
        msg.setFolder(folder);
        messageRepository.save(msg);
    }

    public List<MessageDTO> getInbox(Long userId) {
        return messageRepository.findByRecipientIdAndFolderIsNullOrderByTimestampDesc(userId)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<MessageDTO> getFolderMessages(Long userId, String folderSlug) {
        return messageRepository.findByRecipientIdAndFolder_SlugOrderByTimestampDesc(userId, folderSlug)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<MessageDTO> getSent(Long userId) {
        return messageRepository.findBySenderIdOrderByTimestampDesc(userId)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<MessageDTO> getThread(Long messageId) {
        Message msg = messageRepository.findById(messageId).orElseThrow();
        Long threadId = msg.getParentId() != null ? msg.getParentId() : msg.getId();

        List<Message> thread = new ArrayList<>();
        // Hämta föräldern
        messageRepository.findById(threadId).ifPresent(thread::add);
        // Hämta alla barn
        thread.addAll(messageRepository.findByParentIdOrderByTimestampAsc(threadId));

        return thread.stream().map(this::convertToDTO).collect(Collectors.toList());
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

    public void sendErrorReportToAdmins(com.eduflex.backend.dto.ErrorReport report) {
        List<User> admins = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && "ADMIN".equalsIgnoreCase(u.getRole().getName()))
                .collect(Collectors.toList());

        for (User admin : admins) {
            sendMessage(admin.getId(), admin.getId(),
                    "SYSTEMFEL: " + (report.getUrl() != null ? report.getUrl() : "Okänd URL"),
                    "Källa: " + report.getUrl() + "\nMeddelande: " + report.getMessage() + "\nStack: "
                            + report.getStack(),
                    "fel-loggar");
        }
    }

    // --- BROADCASTS (Rektorspaket) ---
    public void broadcastToClassGroup(Long senderId, Long classGroupId, String subject, String content) {
        List<User> students = userRepository.findAll().stream()
                .filter(u -> u.getClassGroup() != null && u.getClassGroup().getId().equals(classGroupId))
                .collect(Collectors.toList());

        for (User student : students) {
            sendMessage(senderId, student.getId(), subject, content, "inkorg");
        }
    }

    public void broadcastToProgram(Long senderId, Long programId, String subject, String content) {
        List<User> students = userRepository.findAll().stream()
                .filter(u -> u.getClassGroup() != null && 
                             u.getClassGroup().getProgram() != null && 
                             u.getClassGroup().getProgram().getId().equals(programId))
                .collect(Collectors.toList());

        for (User student : students) {
            sendMessage(senderId, student.getId(), subject, content, "inkorg");
        }
    }

    private MessageDTO convertToDTO(Message msg) {
        return new MessageDTO(
                msg.getId(),
                msg.getSender() != null ? msg.getSender().getId() : null,
                msg.getSender() != null ? msg.getSender().getFullName() : "SYSTEM",
                msg.getRecipient().getId(),
                msg.getRecipient().getFullName(),
                msg.getSubject(),
                msg.getContent(),
                msg.getTimestamp(),
                msg.isRead(),
                msg.getFolder() != null ? msg.getFolder().getId() : null,
                msg.getFolder() != null ? msg.getFolder().getName() : null,
                msg.getParentId(),
                msg.getAttachments().stream()
                        .map(a -> new AttachmentDTO(a.getId(), a.getFileName(), a.getFileType(), a.getFileUrl()))
                        .collect(Collectors.toList()));
    }
}