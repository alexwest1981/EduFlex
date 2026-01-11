package com.eduflex.backend.service;

import com.eduflex.backend.model.SubscriptionPlan;
import com.eduflex.backend.repository.SubscriptionPlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class SubscriptionPlanService {

    private final SubscriptionPlanRepository planRepository;

    public SubscriptionPlanService(SubscriptionPlanRepository planRepository) {
        this.planRepository = planRepository;
    }

    public List<SubscriptionPlan> getAllPlans() {
        return planRepository.findAllByOrderBySortOrderAsc();
    }

    public List<SubscriptionPlan> getActivePlans() {
        return planRepository.findByActiveTrue();
    }

    public Optional<SubscriptionPlan> getPlanById(Long id) {
        return planRepository.findById(id);
    }

    public Optional<SubscriptionPlan> getPlanByName(String name) {
        return planRepository.findByName(name);
    }

    public Optional<SubscriptionPlan> getDefaultPlan() {
        return planRepository.findByIsDefaultTrue();
    }

    @Transactional
    public SubscriptionPlan createPlan(SubscriptionPlan plan) {
        // If this plan is set as default, unset other defaults
        if (plan.getIsDefault()) {
            planRepository.findByIsDefaultTrue().ifPresent(existingDefault -> {
                existingDefault.setIsDefault(false);
                planRepository.save(existingDefault);
            });
        }
        return planRepository.save(plan);
    }

    @Transactional
    public SubscriptionPlan updatePlan(Long id, SubscriptionPlan updatedPlan) {
        return planRepository.findById(id).map(plan -> {
            plan.setName(updatedPlan.getName());
            plan.setDisplayName(updatedPlan.getDisplayName());
            plan.setDescription(updatedPlan.getDescription());
            plan.setPrice(updatedPlan.getPrice());
            plan.setCurrency(updatedPlan.getCurrency());
            plan.setBillingInterval(updatedPlan.getBillingInterval());
            plan.setMaxUsers(updatedPlan.getMaxUsers());
            plan.setMaxCourses(updatedPlan.getMaxCourses());
            plan.setMaxStorage(updatedPlan.getMaxStorage());
            plan.setFeatures(updatedPlan.getFeatures());
            plan.setActive(updatedPlan.getActive());
            plan.setSortOrder(updatedPlan.getSortOrder());

            // Handle default flag
            if (updatedPlan.getIsDefault() && !plan.getIsDefault()) {
                planRepository.findByIsDefaultTrue().ifPresent(existingDefault -> {
                    existingDefault.setIsDefault(false);
                    planRepository.save(existingDefault);
                });
            }
            plan.setIsDefault(updatedPlan.getIsDefault());

            return planRepository.save(plan);
        }).orElseThrow(() -> new RuntimeException("Plan not found with id: " + id));
    }

    @Transactional
    public void deletePlan(Long id) {
        planRepository.deleteById(id);
    }

    @Transactional
    public SubscriptionPlan togglePlanStatus(Long id) {
        return planRepository.findById(id).map(plan -> {
            plan.setActive(!plan.getActive());
            return planRepository.save(plan);
        }).orElseThrow(() -> new RuntimeException("Plan not found with id: " + id));
    }
}
