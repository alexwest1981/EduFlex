package com.eduflex.backend.repository;

import com.eduflex.backend.model.NotificationCategory;
import com.eduflex.backend.model.NotificationChannel;
import com.eduflex.backend.model.NotificationPreference;
import com.eduflex.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, UUID> {
    List<NotificationPreference> findAllByUser(User user);

    Optional<NotificationPreference> findByUserAndCategoryAndChannel(User user, NotificationCategory category,
            NotificationChannel channel);
}
