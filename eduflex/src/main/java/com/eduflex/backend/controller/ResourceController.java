package com.eduflex.backend.controller;

import com.eduflex.backend.model.Resource;
import com.eduflex.backend.service.ResourceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "*")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping("/my")
    public List<Resource> getMyResources(@RequestParam Long userId) {
        return resourceService.getMyResources(userId);
    }

    @GetMapping("/community")
    public List<Resource> getCommunityResources() {
        return resourceService.getCommunityResources();
    }

    @GetMapping("/{id}")
    public Resource getResource(@PathVariable Long id) {
        return resourceService.getResource(id);
    }

    @PostMapping
    public Resource createResource(@RequestParam Long userId, @RequestBody Resource resource) {
        return resourceService.createResource(userId, resource);
    }

    @PutMapping("/{id}")
    public Resource updateResource(@PathVariable Long id, @RequestBody Resource resource) {
        return resourceService.updateResource(id, resource);
    }

    @DeleteMapping("/{id}")
    public void deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
    }
}
