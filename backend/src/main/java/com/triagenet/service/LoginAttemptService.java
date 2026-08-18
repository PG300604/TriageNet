package com.triagenet.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class LoginAttemptService {

    public static final int MAX_ATTEMPTS = 5;
    public static final long LOCK_TIME_DURATION_MILLIS = 15 * 60 * 1000; // 15 minutes

    private static class AttemptData {
        int attempts;
        Instant lastAttemptTime;
        Instant lockExpirationTime;

        AttemptData(int attempts, Instant lastAttemptTime) {
            this.attempts = attempts;
            this.lastAttemptTime = lastAttemptTime;
            this.lockExpirationTime = null;
        }
    }

    private final Map<String, AttemptData> attemptsCache = new ConcurrentHashMap<>();

    public void loginSucceeded(String key) {
        if (key != null) {
            attemptsCache.remove(key.toLowerCase().trim());
        }
    }

    public void loginFailed(String key) {
        if (key == null) return;
        String normalizedKey = key.toLowerCase().trim();

        attemptsCache.compute(normalizedKey, (k, existing) -> {
            Instant now = Instant.now();
            if (existing == null) {
                return new AttemptData(1, now);
            }

            // If lock expired, reset
            if (existing.lockExpirationTime != null && now.isAfter(existing.lockExpirationTime)) {
                return new AttemptData(1, now);
            }

            int newAttempts = existing.attempts + 1;
            AttemptData updated = new AttemptData(newAttempts, now);

            if (newAttempts >= MAX_ATTEMPTS) {
                updated.lockExpirationTime = now.plusMillis(LOCK_TIME_DURATION_MILLIS);
                log.warn("SECURITY ALERT: Account [{}] locked due to {} consecutive failed login attempts until {}",
                        normalizedKey, newAttempts, updated.lockExpirationTime);
            }
            return updated;
        });
    }

    public boolean isBlocked(String key) {
        if (key == null) return false;
        String normalizedKey = key.toLowerCase().trim();
        AttemptData data = attemptsCache.get(normalizedKey);

        if (data == null || data.lockExpirationTime == null) {
            return false;
        }

        if (Instant.now().isAfter(data.lockExpirationTime)) {
            attemptsCache.remove(normalizedKey);
            return false;
        }

        return true;
    }

    public long getRemainingLockTimeMinutes(String key) {
        if (key == null) return 0;
        String normalizedKey = key.toLowerCase().trim();
        AttemptData data = attemptsCache.get(normalizedKey);
        if (data == null || data.lockExpirationTime == null) return 0;

        long remainingMillis = data.lockExpirationTime.toEpochMilli() - Instant.now().toEpochMilli();
        return Math.max(1, (remainingMillis / (60 * 1000)) + 1);
    }
}
