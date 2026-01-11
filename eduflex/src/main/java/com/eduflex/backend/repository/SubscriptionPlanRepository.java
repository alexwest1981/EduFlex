package com.eduflex.backend.repository;

import com.eduflex.backend.model.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {

    Optional<SubscriptionPlan> findByName(String name);

    List<SubscriptionPlan> findByActiveTrue();

    Optional<SubscriptionPlan> findByIsDefaultTrue();

    List<SubscriptionPlan> findAllByOrderBySortOrderAsc();
}
