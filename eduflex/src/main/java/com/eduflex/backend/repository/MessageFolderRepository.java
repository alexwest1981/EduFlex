package com.eduflex.backend.repository;

import com.eduflex.backend.model.MessageFolder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageFolderRepository extends JpaRepository<MessageFolder, Long> {
    List<MessageFolder> findByUserId(Long userId);
}
