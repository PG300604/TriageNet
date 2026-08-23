package com.triagenet.service;

import com.triagenet.entity.LoginAttempt;
import com.triagenet.repository.LoginAttemptRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoginAttemptService {

    public static final int MAX_ATTEMPTS = 5;
    public static final long LOCK_TIME_DURATION_MILLIS = 15 * 60 * 1000; // 15 minutes
    public static final int MAX_CACHE_SIZE = 10000;

    private static class AttemptData {
        int attempts;
        Instant lastAttemptTime;
        Instant lockExpirationTime;

        AttemptData(int attempts, Instant lastAttemptTime, Instant lockExpirationTime) {
            this.attempts = attempts;
            this.lastAttemptTime = lastAttemptTime;
            this.lockExpirationTime = lockExpirationTime;
        }
    }

    private final LoginAttemptRepository loginAttemptRepository;
    private final Map<String, AttemptData> attemptsCache = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        try {
            Instant now = Instant.now();
            loginAttemptRepository.deleteExpiredLocks(now);
            List<LoginAttempt> activeLocks = loginAttemptRepository.findByLockExpiresAtAfter(now);
            for (LoginAttempt lock : activeLocks) {
                if (lock.getEmail() != null) {
                    attemptsCache.put(
                        lock.getEmail().toLowerCase().trim(),
                        new AttemptData(lock.getAttemptCount(), lock.getLastAttemptAt(), lock.getLockExpiresAt())
                    );
                }
            }
            log.info("Initialized LoginAttemptService with {} active persistent account lockouts from database.", activeLocks.size());
        } catch (Exception e) {
            log.warn("Failed to pre-load login attempts from database on startup: {}", e.getMessage());
        }
    }

    private void ensureCapacityFor(String normalizedKey) {
        if (!attemptsCache.containsKey(normalizedKey) && attemptsCache.size() >= MAX_CACHE_SIZE) {
            Instant now = Instant.now();

            // Phase 1: Evict expired records (expired locks or stale failed attempts)
            attemptsCache.entrySet().removeIf(entry -> {
                AttemptData data = entry.getValue();
                if (data.lockExpirationTime != null) {
                    return now.isAfter(data.lockExpirationTime);
                }
                return now.isAfter(data.lastAttemptTime.plusMillis(LOCK_TIME_DURATION_MILLIS));
            });

            // Phase 2: If still at/above capacity, evict un-locked failed attempt records first (preserving active lockouts)
            if (attemptsCache.size() >= MAX_CACHE_SIZE) {
                java.util.Iterator<Map.Entry<String, AttemptData>> iterator = attemptsCache.entrySet().iterator();
                while (iterator.hasNext() && attemptsCache.size() >= MAX_CACHE_SIZE) {
                    Map.Entry<String, AttemptData> entry = iterator.next();
                    AttemptData data = entry.getValue();
                    if (data.lockExpirationTime == null || now.isAfter(data.lockExpirationTime)) {
                        iterator.remove();
                    }
                }
            }

            // Phase 3: Fallback if cache is saturated with active locks, evict oldest entries
            if (attemptsCache.size() >= MAX_CACHE_SIZE) {
                java.util.Iterator<String> iterator = attemptsCache.keySet().iterator();
                while (iterator.hasNext() && attemptsCache.size() >= MAX_CACHE_SIZE) {
                    iterator.next();
                    iterator.remove();
                }
            }
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void loginSucceeded(String key) {
        if (key != null) {
            String normalizedKey = key.toLowerCase().trim();
            attemptsCache.remove(normalizedKey);
            try {
                loginAttemptRepository.deleteByEmailIgnoreCase(normalizedKey);
            } catch (Exception e) {
                log.warn("Failed to delete login attempts for user [{}] from database: {}", normalizedKey, e.getMessage());
            }
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public boolean loginFailed(String key) {
        if (key == null) return false;
        String normalizedKey = key.toLowerCase().trim();
        ensureCapacityFor(normalizedKey);

        final boolean[] transitionedToLocked = new boolean[]{false};

        AttemptData resultData = attemptsCache.compute(normalizedKey, (k, existing) -> {
            Instant now = Instant.now();
            if (existing == null) {
                return new AttemptData(1, now, null);
            }

            // If lock expired, reset
            if (existing.lockExpirationTime != null && now.isAfter(existing.lockExpirationTime)) {
                return new AttemptData(1, now, null);
            }

            int newAttempts = existing.attempts + 1;
            Instant lockExpiration = null;

            if (newAttempts >= MAX_ATTEMPTS) {
                lockExpiration = now.plusMillis(LOCK_TIME_DURATION_MILLIS);
                if (existing.lockExpirationTime == null) {
                    transitionedToLocked[0] = true;
                    log.warn("SECURITY ALERT: Account [{}] locked due to {} consecutive failed login attempts until {}",
                            normalizedKey, newAttempts, lockExpiration);
                }
            }
            return new AttemptData(newAttempts, now, lockExpiration);
        });

        // Persist to database
        try {
            Optional<LoginAttempt> opt = loginAttemptRepository.findByEmailIgnoreCase(normalizedKey);
            LoginAttempt entity = opt.orElseGet(() -> LoginAttempt.builder().email(normalizedKey).build());
            entity.setAttemptCount(resultData.attempts);
            entity.setLastAttemptAt(resultData.lastAttemptTime);
            entity.setLockExpiresAt(resultData.lockExpirationTime);
            loginAttemptRepository.save(entity);
        } catch (Exception e) {
            log.warn("Failed to persist login attempt to database for user [{}]: {}", normalizedKey, e.getMessage());
        }

        return transitionedToLocked[0];
    }

    public boolean isBlocked(String key) {
        if (key == null) return false;
        String normalizedKey = key.toLowerCase().trim();
        AttemptData data = attemptsCache.get(normalizedKey);

        // Check memory cache first
        if (data != null && data.lockExpirationTime != null) {
            if (Instant.now().isAfter(data.lockExpirationTime)) {
                attemptsCache.remove(normalizedKey);
                try {
                    loginAttemptRepository.deleteByEmailIgnoreCase(normalizedKey);
                } catch (Exception ignored) {}
                return false;
            }
            return true;
        }

        // Cache miss fallback to database (e.g., across application restarts)
        try {
            Optional<LoginAttempt> opt = loginAttemptRepository.findByEmailIgnoreCase(normalizedKey);
            if (opt.isPresent()) {
                LoginAttempt entity = opt.get();
                if (entity.getLockExpiresAt() != null) {
                    if (Instant.now().isAfter(entity.getLockExpiresAt())) {
                        loginAttemptRepository.delete(entity);
                        return false;
                    }
                    // Populate memory cache
                    attemptsCache.put(
                        normalizedKey,
                        new AttemptData(entity.getAttemptCount(), entity.getLastAttemptAt(), entity.getLockExpiresAt())
                    );
                    return true;
                }
            }
        } catch (Exception e) {
            log.warn("Error querying database for lockout status of user [{}]: {}", normalizedKey, e.getMessage());
        }

        return false;
    }

    public long getRemainingLockTimeMinutes(String key) {
        if (key == null) return 0;
        String normalizedKey = key.toLowerCase().trim();
        AttemptData data = attemptsCache.get(normalizedKey);

        Instant expiration = null;
        if (data != null && data.lockExpirationTime != null) {
            expiration = data.lockExpirationTime;
        } else {
            try {
                Optional<LoginAttempt> opt = loginAttemptRepository.findByEmailIgnoreCase(normalizedKey);
                if (opt.isPresent() && opt.get().getLockExpiresAt() != null) {
                    expiration = opt.get().getLockExpiresAt();
                }
            } catch (Exception ignored) {}
        }

        if (expiration == null) return 0;

        long remainingMillis = expiration.toEpochMilli() - Instant.now().toEpochMilli();
        return Math.max(1, (remainingMillis / (60 * 1000)) + 1);
    }
}
