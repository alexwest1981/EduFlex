package com.eduflex.backend.controller;

import com.eduflex.backend.model.Resource;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.util.SecurityUtils;
import com.eduflex.backend.service.ResourceService;
import com.eduflex.backend.service.CourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/global-library")
@CrossOrigin(origins = "*")
public class GlobalLibraryController {

    private final ResourceService resourceService;
    private final CourseService courseService;
    private final UserRepository userRepository;

    public GlobalLibraryController(ResourceService resourceService, CourseService courseService,
            UserRepository userRepository) {
        this.resourceService = resourceService;
        this.courseService = courseService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Resource> getGlobalResources() {
        return resourceService.getGlobalResources();
    }

    @PostMapping("/{id}/install")
    public ResponseEntity<Map<String, Object>> installResource(
            @PathVariable Long id,
            Authentication authentication) {

        User currentUser = SecurityUtils.getCurrentUser(userRepository);
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        Long localId = resourceService.installGlobalResource(id, currentUser.getId());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "localId", localId,
                "message", "Resource installed successfully"));
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<Map<String, Object>> publishToGlobalLibrary(
            @PathVariable Long id,
            Authentication authentication) {

        User currentUser = SecurityUtils.getCurrentUser(userRepository);
        if (currentUser == null || (!"ADMIN".equals(currentUser.getRole().getName())
                && !"RESELLER".equals(currentUser.getRole().getName()))) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "Only admins and resellers can publish to Global Library"));
        }

        Long globalId = resourceService.publishToGlobalLibrary(id);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "globalId", globalId,
                "message", "Resource published to Global Library successfully"));
    }

    @PostMapping("/courses/{id}/publish")
    public ResponseEntity<Map<String, Object>> publishCourseToGlobalLibrary(
            @PathVariable Long id,
            Authentication authentication) {

        User currentUser = SecurityUtils.getCurrentUser(userRepository);
        if (currentUser == null || (!"ADMIN".equals(currentUser.getRole().getName())
                && !"RESELLER".equals(currentUser.getRole().getName()))) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "Only admins and resellers can publish courses to Global Library"));
        }

        Long globalId = courseService.publishCourseToGlobalLibrary(id);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "globalId", globalId,
                "message", "Course published to Global Library successfully"));
    }
}
