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
    public static final int MAX_CACHE_SIZE = 10000;

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

    private void evictExpiredEntries() {
        if (attemptsCache.size() > MAX_CACHE_SIZE) {
            Instant now = Instant.now();
            attemptsCache.entrySet().removeIf(entry -> {
                AttemptData data = entry.getValue();
                if (data.lockExpirationTime != null) {
                    return now.isAfter(data.lockExpirationTime);
                }
                return now.isAfter(data.lastAttemptTime.plusMillis(LOCK_TIME_DURATION_MILLIS));
            });

            if (attemptsCache.size() > MAX_CACHE_SIZE) {
                java.util.Iterator<String> iterator = attemptsCache.keySet().iterator();
                while (iterator.hasNext() && attemptsCache.size() > MAX_CACHE_SIZE) {
                    iterator.next();
                    iterator.remove();
                }
            }
        }
    }

    public void loginSucceeded(String key) {
        if (key != null) {
            attemptsCache.remove(key.toLowerCase().trim());
        }
    }

    public boolean loginFailed(String key) {
        if (key == null) return false;
        String normalizedKey = key.toLowerCase().trim();
        evictExpiredEntries();

        final boolean[] transitionedToLocked = new boolean[]{false};

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
                if (existing.lockExpirationTime == null) {
                    transitionedToLocked[0] = true;
                    log.warn("SECURITY ALERT: Account [{}] locked due to {} consecutive failed login attempts until {}",
                            normalizedKey, newAttempts, updated.lockExpirationTime);
                }
            }
            return updated;
        });

        return transitionedToLocked[0];
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
