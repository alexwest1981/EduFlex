package com.eduflex.backend.service;

import com.eduflex.backend.model.ApiKey;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.ApiKeyRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;

@Service
public class ApiKeyService {

    private final ApiKeyRepository apiKeyRepository;
    private final PasswordEncoder passwordEncoder; // Use the main SecurityConfig encoder

    public ApiKeyService(ApiKeyRepository apiKeyRepository, PasswordEncoder passwordEncoder) {
        this.apiKeyRepository = apiKeyRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<ApiKey> getMyKeys(User user) {
        return apiKeyRepository.findByUser(user);
    }

    @Transactional
    public String createKey(User user, String name) {
        // Generate raw key: eduflex_ + 32 random chars (base64url safe)
        String randomPart = generateRandomString(32);
        String rawKey = "eduflex_" + randomPart;

        ApiKey apiKey = new ApiKey();
        apiKey.setUser(user);
        apiKey.setName(name);
        apiKey.setPrefix(rawKey.substring(0, 16) + "..."); // Store prefix for identification
        apiKey.setKeyHash(passwordEncoder.encode(rawKey));

        apiKeyRepository.save(apiKey);

        return rawKey; // Return once to user
    }

    @Transactional
    public void revokeKey(Long id, User user) {
        // Ensure user owns the key
        ApiKey key = apiKeyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Key not found"));

        if (!key.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        apiKeyRepository.delete(key);
    }

    private String generateRandomString(int length) {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[length];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes).substring(0, length);
    }

    @Transactional(noRollbackFor = Exception.class) // validation shouldn't block
    public User validateKey(String rawKey) {
        // rawKey format: eduflex_PREFIX...
        // 1. Check format
        if (rawKey == null || !rawKey.startsWith("eduflex_")) {
            return null;
        }

        // 2. Extract prefix (first 16 chars after eduflex_) - actually we stored the
        // whole first 16 chars + "..."
        // In createKey: rawKey.substring(0, 16) + "..."
        // Raw key: "eduflex_" + 32 chars. Total length = 8 + 32 = 40.
        // stored prefix = rawKey.substring(0, 16) + "..." ---> "eduflex_ABC123.."

        if (rawKey.length() < 20)
            return null;

        String prefixLookup = rawKey.substring(0, 16) + "...";

        // 3. Find candidates
        List<ApiKey> candidates = apiKeyRepository.findByPrefix(prefixLookup);

        // 4. Check Hash
        for (ApiKey key : candidates) {
            if (passwordEncoder.matches(rawKey, key.getKeyHash())) {
                // Update usage
                key.setLastUsed(java.time.LocalDateTime.now());
                apiKeyRepository.save(key);
                return key.getUser();
            }
        }

        return null;
    }
}
