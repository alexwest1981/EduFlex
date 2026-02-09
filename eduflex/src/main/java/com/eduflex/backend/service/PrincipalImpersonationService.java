package com.eduflex.backend.service;

import com.eduflex.backend.model.User;
import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PrincipalImpersonationService {

    // Simple in-memory storage for active impersonations (Principal Username -> Impersonated User ID)
    private final ConcurrentHashMap<String, Long> activeImpersonations = new ConcurrentHashMap<>();

    public void startImpersonation(String principalUsername, Long impersonatedUserId) {
        activeImpersonations.put(principalUsername, impersonatedUserId);
    }

    public void stopImpersonation(String principalUsername) {
        activeImpersonations.remove(principalUsername);
    }

    public Long getImpersonatedUserId(String principalUsername) {
        return activeImpersonations.get(principalUsername);
    }

    public boolean isImpersonating(String principalUsername) {
        return activeImpersonations.containsKey(principalUsername);
    }
}
