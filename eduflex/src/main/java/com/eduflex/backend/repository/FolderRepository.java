package com.eduflex.backend.repository;

import com.eduflex.backend.model.Folder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FolderRepository extends JpaRepository<Folder, Long> {
    List<Folder> findByOwnerIdAndParentFolderIsNull(Long ownerId);

    List<Folder> findByParentFolderId(Long parentId);
}
