package com.eduflex.backend.repository;

import com.eduflex.backend.model.Resource;
import com.eduflex.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByOwner(User owner);

    List<Resource> findByVisibility(Resource.ResourceVisibility visibility);

    List<Resource> findByType(Resource.ResourceType type);
}
