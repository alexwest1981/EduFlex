package com.eduflex.backend.service;

import com.eduflex.backend.model.*;
import com.eduflex.backend.repository.NotificationPreferenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationPreferenceService {

    private final NotificationPreferenceRepository repository;
    private final UserService userService;

    public List<NotificationPreference> getPreferencesForUser(Long userId) {
        User user = userService.getUserById(userId);
        return repository.findAllByUser(user);
    }

    @Transactional
    public void updatePreference(Long userId, NotificationCategory category, NotificationChannel channel,
            boolean enabled) {
        User user = userService.getUserById(userId);
        NotificationPreference preference = repository.findByUserAndCategoryAndChannel(user, category, channel)
                .orElse(NotificationPreference.builder()
                        .user(user)
                        .category(category)
                        .channel(channel)
                        .build());

        preference.setEnabled(enabled);
        repository.save(preference);
    }
}
