package com.eduflex.backend.repository;

import com.eduflex.backend.model.CourseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseOrderRepository extends JpaRepository<CourseOrder, Long> {

    List<CourseOrder> findByCustomer_IdOrderByCreatedAtDesc(Long customerId);

    Optional<CourseOrder> findByStripeSessionId(String stripeSessionId);

    List<CourseOrder> findByStatusOrderByCreatedAtDesc(CourseOrder.OrderStatus status);

    List<CourseOrder> findAllByOrderByCreatedAtDesc();
}
