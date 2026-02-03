package com.eduflex.backend.controller;

import com.eduflex.backend.model.FileShare;
import com.eduflex.backend.service.FileShareService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shares")
@CrossOrigin(origins = "*")
public class FileShareController {

    private final FileShareService fileShareService;

    public FileShareController(FileShareService fileShareService) {
        this.fileShareService = fileShareService;
    }

    @PostMapping("/file/{docId}")
    public FileShare createShare(@PathVariable Long docId,
            @RequestBody Map<String, Object> payload,
            @RequestParam Long sharedById) {
        FileShare.ShareTargetType type = FileShare.ShareTargetType.valueOf(payload.get("targetType").toString());
        Long targetId = Long.valueOf(payload.get("targetId").toString());
        FileShare.PermissionLevel permission = FileShare.PermissionLevel.valueOf(payload.get("permission").toString());

        return fileShareService.shareFile(docId, type, targetId, permission, sharedById);
    }

    @PostMapping("/file/{docId}/public")
    public FileShare createPublicLink(@PathVariable Long docId,
            @RequestParam Long sharedById,
            @RequestParam(required = false) String expiresAt) {
        LocalDateTime expiry = (expiresAt != null) ? LocalDateTime.parse(expiresAt) : null;
        return fileShareService.createPublicLink(docId, sharedById, expiry);
    }

    @GetMapping("/target/{type}/{id}")
    public List<FileShare> getShares(@PathVariable FileShare.ShareTargetType type, @PathVariable Long id) {
        return fileShareService.getSharesForTarget(type, id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> revoke(@PathVariable Long id) {
        fileShareService.revokeShare(id);
        return ResponseEntity.ok().build();
    }
}
