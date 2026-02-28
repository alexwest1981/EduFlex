package com.eduflex.backend.controller;

import com.eduflex.backend.model.Resource;
import com.eduflex.backend.service.ResourceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/global-library")
@CrossOrigin(origins = "*")
public class GlobalLibraryController {

    private final ResourceService resourceService;

    public GlobalLibraryController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    public List<Resource> getGlobalResources() {
        return resourceService.getGlobalResources();
    }
}
