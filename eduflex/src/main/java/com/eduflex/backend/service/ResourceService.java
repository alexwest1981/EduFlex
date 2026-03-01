package com.eduflex.backend.service;

import com.eduflex.backend.model.Resource;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.ResourceRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.eduflex.backend.config.tenant.TenantContext;

import java.util.List;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;

    public ResourceService(ResourceRepository resourceRepository, UserRepository userRepository) {
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
    }

    public List<Resource> getMyResources(Long userId, String type) {
        User owner = userRepository.findById(userId).orElseThrow();
        if (type != null && !type.isBlank()) {
            try {
                Resource.ResourceType resourceType = Resource.ResourceType.valueOf(type.toUpperCase());
                return resourceRepository.findByOwnerAndType(owner, resourceType);
            } catch (IllegalArgumentException e) {
                // Invalid type, ignore or verify? For now, fallback to all or empty?
                // Let's just return empty lists for safety if type is invalid but intended
                return List.of();
            }
        }
        return resourceRepository.findByOwner(owner);
    }

    public List<Resource> getCommunityResources() {
        return resourceRepository.findByVisibility(Resource.ResourceVisibility.PUBLIC);
    }

    public List<Resource> getGlobalResources() {
        String originalTenant = TenantContext.getCurrentTenant();
        try {
            TenantContext.setCurrentTenant("public");
            return resourceRepository.findByVisibility(Resource.ResourceVisibility.GLOBAL_LIBRARY);
        } finally {
            TenantContext.setCurrentTenant(originalTenant);
        }
    }

    @Transactional
    public Resource createResource(Long userId, Resource resource) {
        User owner = userRepository.findById(userId).orElseThrow();
        resource.setOwner(owner);
        return resourceRepository.save(resource);
    }

    @Transactional
    public Resource updateResource(Long id, Resource resourceData) {
        Resource existing = resourceRepository.findById(id).orElseThrow();
        existing.setName(resourceData.getName());
        existing.setDescription(resourceData.getDescription());
        existing.setContent(resourceData.getContent());
        existing.setType(resourceData.getType());
        existing.setVisibility(resourceData.getVisibility());
        existing.setTags(resourceData.getTags());
        return resourceRepository.save(existing);
    }

    public Resource getResource(Long id) {
        return resourceRepository.findById(id).orElseThrow();
    }

    @Transactional
    public void deleteResource(Long id) {
        resourceRepository.deleteById(id);
    }

    @Transactional
    public Resource updateVisibility(Long id, Resource.ResourceVisibility visibility) {
        Resource resource = resourceRepository.findById(id).orElseThrow();
        resource.setVisibility(visibility);
        return resourceRepository.save(resource);
    }

    @Transactional
    public Long publishToGlobalLibrary(Long resourceId) {
        Resource localResource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        String originalTenant = TenantContext.getCurrentTenant();
        try {
            TenantContext.setCurrentTenant("public");

            Resource globalCopy = new Resource();
            globalCopy.setName(localResource.getName());
            globalCopy.setDescription(localResource.getDescription());
            globalCopy.setContent(localResource.getContent());
            globalCopy.setType(localResource.getType());
            globalCopy.setVisibility(Resource.ResourceVisibility.GLOBAL_LIBRARY);

            String tags = localResource.getTags();
            globalCopy.setTags("System Verified" + (tags != null && !tags.isBlank() ? ", " + tags : ""));
            globalCopy.setOwner(localResource.getOwner());

            Resource saved = resourceRepository.save(globalCopy);
            return saved.getId();
        } finally {
            TenantContext.setCurrentTenant(originalTenant);
        }
    }

    @Transactional
    public Long installGlobalResource(Long resourceId, Long currentUserId) {
        String originalTenant = TenantContext.getCurrentTenant();
        Resource globalResource;
        try {
            TenantContext.setCurrentTenant("public");
            globalResource = resourceRepository.findById(resourceId)
                    .orElseThrow(() -> new RuntimeException("Global resource not found: " + resourceId));

            if (globalResource.getVisibility() != Resource.ResourceVisibility.GLOBAL_LIBRARY) {
                throw new RuntimeException("Can only install resources with GLOBAL_LIBRARY visibility");
            }
        } finally {
            TenantContext.setCurrentTenant(originalTenant);
        }

        User currentUser = userRepository.findById(currentUserId).orElseThrow();

        // Create a copy in the current schema
        Resource localCopy = new Resource();
        localCopy.setName(globalResource.getName());
        localCopy.setDescription(globalResource.getDescription());
        localCopy.setContent(globalResource.getContent());
        localCopy.setType(globalResource.getType());
        localCopy.setVisibility(Resource.ResourceVisibility.PRIVATE);

        String tags = globalResource.getTags();
        localCopy.setTags("Imported" + (tags != null && !tags.isBlank() ? ", " + tags : ""));
        localCopy.setOwner(currentUser);

        Resource saved = resourceRepository.save(localCopy);
        return saved.getId();
    }
}
