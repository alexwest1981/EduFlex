package com.eduflex.backend.repository;

import com.eduflex.backend.model.WebPushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WebPushSubscriptionRepository extends JpaRepository<WebPushSubscription, Long> {
    List<WebPushSubscription> findByUserId(Long userId);

    Optional<WebPushSubscription> findByEndpoint(String endpoint);

    void deleteByEndpoint(String endpoint);
}
