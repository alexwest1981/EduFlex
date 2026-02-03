package com.eduflex.backend.service;

import com.eduflex.backend.model.Resource;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.ResourceRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;

    public ResourceService(ResourceRepository resourceRepository, UserRepository userRepository) {
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
    }

    public List<Resource> getMyResources(Long userId) {
        User owner = userRepository.findById(userId).orElseThrow();
        return resourceRepository.findByOwner(owner);
    }

    public List<Resource> getCommunityResources() {
        return resourceRepository.findByVisibility(Resource.ResourceVisibility.PUBLIC);
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
}
