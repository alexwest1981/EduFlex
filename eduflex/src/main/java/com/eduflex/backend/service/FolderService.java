package com.eduflex.backend.service;

import com.eduflex.backend.model.Folder;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.FolderRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FolderService {

    private final FolderRepository folderRepository;
    private final UserRepository userRepository;

    public FolderService(FolderRepository folderRepository, UserRepository userRepository) {
        this.folderRepository = folderRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Folder createFolder(String name, Long ownerId, Long parentId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Folder parent = (parentId != null)
                ? folderRepository.findById(parentId).orElse(null)
                : null;

        Folder folder = new Folder(name, parent, owner);
        return folderRepository.save(folder);
    }

    public List<Folder> getRootFolders(Long ownerId) {
        return folderRepository.findByOwnerIdAndParentFolderIsNull(ownerId);
    }

    public List<Folder> getSubFolders(Long parentId) {
        return folderRepository.findByParentFolderId(parentId);
    }

    @Transactional
    public void deleteFolder(Long folderId) {
        folderRepository.deleteById(folderId);
    }

    @Transactional
    public Folder renameFolder(Long folderId, String newName) {
        Folder folder = folderRepository.findById(folderId).orElseThrow();
        folder.setName(newName);
        return folderRepository.save(folder);
    }
}
