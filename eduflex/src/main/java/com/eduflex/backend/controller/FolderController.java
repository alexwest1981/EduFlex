package com.eduflex.backend.controller;

import com.eduflex.backend.model.Folder;
import com.eduflex.backend.service.FolderService;
import com.eduflex.backend.service.DocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/folders")
@CrossOrigin(origins = "*")
public class FolderController {

    private final FolderService folderService;
    private final DocumentService documentService;

    public FolderController(FolderService folderService, DocumentService documentService) {
        this.folderService = folderService;
        this.documentService = documentService;
    }

    @PostMapping("/user/{userId}")
    public Folder create(@PathVariable Long userId, @RequestBody Map<String, Object> payload) {
        String name = (String) payload.get("name");
        Long parentId = payload.get("parentId") != null ? Long.valueOf(payload.get("parentId").toString()) : null;
        return folderService.createFolder(name, userId, parentId);
    }

    @GetMapping("/user/{userId}/root")
    public Map<String, Object> getRoot(@PathVariable Long userId) {
        Map<String, Object> result = new HashMap<>();
        result.put("folders", folderService.getRootFolders(userId));
        result.put("documents", documentService.getFolderDocuments(userId, null));
        return result;
    }

    @GetMapping("/{folderId}/content")
    public Map<String, Object> getFolderContent(@PathVariable Long folderId, @RequestParam Long userId) {
        Map<String, Object> result = new HashMap<>();
        result.put("folders", folderService.getSubFolders(folderId));
        result.put("documents", documentService.getFolderDocuments(userId, folderId));
        return result;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        folderService.deleteFolder(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/rename")
    public Folder rename(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return folderService.renameFolder(id, payload.get("name"));
    }
}
