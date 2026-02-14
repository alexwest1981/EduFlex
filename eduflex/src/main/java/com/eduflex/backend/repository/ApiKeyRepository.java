package com.eduflex.backend.repository;

import com.eduflex.backend.model.ApiKey;
import com.eduflex.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKey, Long> {
    List<ApiKey> findByUser(User user);

    // We can't query by hash directly as we need to match via BCrypt.
    // Optimization: Store the prefix and query by that first.
    List<ApiKey> findByPrefix(String prefix);
}
