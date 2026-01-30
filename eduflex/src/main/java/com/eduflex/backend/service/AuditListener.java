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

            // Hämta ID från entiteten
            String id = "UNKNOWN";
            try {
                Method getIdMethod = entity.getClass().getMethod("getId");
                Object idObj = getIdMethod.invoke(entity);
                if (idObj != null)
                    id = idObj.toString();
            } catch (Exception e) {
                // Ingen getId metod
            }

            // Deep-Diff: Serialisera entiteten till JSON (exkludera lösenord etc)
            String changeData = null;
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = com.eduflex.backend.config.BeanUtil
                        .getBean(com.fasterxml.jackson.databind.ObjectMapper.class);
                if (mapper == null)
                    mapper = new com.fasterxml.jackson.databind.ObjectMapper();

                // Skapa en kopia eller filtrera manuellt för att undvika cirkulära beroenden
                // och känslig data
                // För MVP serialiserar vi hela objektet men använder @JsonIgnore regler som
                // redan finns i modellen
                changeData = mapper.writeValueAsString(entity);
            } catch (Exception e) {
                changeData = "{\"error\": \"Could not serialize entity: " + e.getMessage() + "\"}";
            }

            // Skapa loggen
            AuditLog log = new AuditLog(action, entity.getClass().getSimpleName(), id, username, changeData);

            // Spara via Repository
            AuditLogRepository repo = BeanUtil.getBean(AuditLogRepository.class);
            repo.save(log);

            System.out.println(
                    "📝 AUDIT: " + action + " " + entity.getClass().getSimpleName() + " #" + id + " by " + username);

        } catch (Exception e) {
            System.err.println("Failed to audit log: " + e.getMessage());
        }
    }
}
