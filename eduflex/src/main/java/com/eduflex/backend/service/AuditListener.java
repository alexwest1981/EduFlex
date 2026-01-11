package com.eduflex.backend.service;

import com.eduflex.backend.config.BeanUtil;
import com.eduflex.backend.model.AuditLog;
import com.eduflex.backend.repository.AuditLogRepository;
import jakarta.persistence.PostPersist;
import jakarta.persistence.PostRemove;
import jakarta.persistence.PostUpdate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.lang.reflect.Method;

public class AuditListener {

    @PostPersist
    public void afterCreate(Object entity) {
        logAction("CREATED", entity);
    }

    @PostUpdate
    public void afterUpdate(Object entity) {
        logAction("UPDATED", entity);
    }

    @PostRemove
    public void afterDelete(Object entity) {
        logAction("DELETED", entity);
    }

    private void logAction(String action, Object entity) {
        try {
            // Hämta inloggad användare
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = (auth != null && auth.isAuthenticated()) ? auth.getName() : "SYSTEM";

            // Hämta ID från entiteten (User.getId() eller Course.getId())
            String id = "UNKNOWN";
            try {
                Method getIdMethod = entity.getClass().getMethod("getId");
                Object idObj = getIdMethod.invoke(entity);
                if (idObj != null)
                    id = idObj.toString();
            } catch (Exception e) {
                // Ingen getId metod
            }

            // Skapa loggen
            AuditLog log = new AuditLog(action, entity.getClass().getSimpleName(), id, username);

            // Spara via Repository (hämtat via BeanUtil)
            AuditLogRepository repo = BeanUtil.getBean(AuditLogRepository.class);
            repo.save(log);

            System.out.println(
                    "📝 AUDIT: " + action + " " + entity.getClass().getSimpleName() + " #" + id + " by " + username);

        } catch (Exception e) {
            System.err.println("Failed to audit log: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
