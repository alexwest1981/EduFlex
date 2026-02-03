package com.eduflex.backend.service;

import com.eduflex.backend.model.Document;
import com.eduflex.backend.model.FileShare;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.DocumentRepository;
import com.eduflex.backend.repository.FileShareRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class FileShareService {

    private final FileShareRepository fileShareRepository;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    public FileShareService(FileShareRepository fileShareRepository,
            DocumentRepository documentRepository,
            UserRepository userRepository) {
        this.fileShareRepository = fileShareRepository;
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public FileShare shareFile(Long docId, FileShare.ShareTargetType type, Long targetId,
            FileShare.PermissionLevel permission, Long sharedById) {
        Document doc = documentRepository.findById(docId).orElseThrow();
        User sharedBy = userRepository.findById(sharedById).orElseThrow();

        // Optional: Implement rate limiting to prevent spamming

        FileShare share = new FileShare();
        share.setDocument(doc);
        share.setTargetType(type);
        share.setTargetId(targetId);
        share.setPermission(permission);
        share.setSharedBy(sharedBy);

        return fileShareRepository.save(share);
    }

    @Transactional
    public FileShare createPublicLink(Long docId, Long sharedById, LocalDateTime expiresAt) {
        Document doc = documentRepository.findById(docId).orElseThrow();
        User sharedBy = userRepository.findById(sharedById).orElseThrow();

        FileShare share = new FileShare();
        share.setDocument(doc);
        share.setTargetType(FileShare.ShareTargetType.LINK);
        share.setPermission(FileShare.PermissionLevel.VIEW);
        share.setSharedBy(sharedBy);
        share.setLinkToken(UUID.randomUUID().toString());
        share.setExpiresAt(expiresAt);

        return fileShareRepository.save(share);
    }

    public List<FileShare> getSharesForTarget(FileShare.ShareTargetType type, Long targetId) {
        return fileShareRepository.findByTargetTypeAndTargetId(type, targetId);
    }

    @Transactional
    public void revokeShare(Long shareId) {
        fileShareRepository.deleteById(shareId);
    }
}
