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

/**
 * Tracks failed login attempts and enforces temporary lockouts.
 *
 * SECURITY (V5 + A2):
 * - Lockouts are tracked on TWO dimensions (email + client IP).
 * - Per-email account lockouts are persisted to PostgreSQL (LoginAttemptRepository).
 * - Client IP rate-limiting throttles distributed brute-force spraying.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LoginAttemptService {

    public static final int MAX_ATTEMPTS = 5;
    /** Per-email lock duration. */
    public static final long EMAIL_LOCK_MILLIS = 15 * 60 * 1000; // 15 minutes
    /** Per-IP lock duration: long enough to make spraying impractical. */
    public static final long IP_LOCK_MILLIS = 15 * 60 * 1000;   // 15 minutes
    public static final int MAX_CACHE_SIZE = 20000;
    /** Failed attempts tolerated per IP before the IP itself is locked. */
    public static final int MAX_IP_ATTEMPTS = 30;

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
                        emailKey(lock.getEmail()),
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
                return now.isAfter(data.lastAttemptTime.plusMillis(IP_LOCK_MILLIS));
            });

            // Phase 2: If still at/above capacity, evict un-locked failed attempt records first
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

    private String emailKey(String email) {
        return "email:" + email.toLowerCase().trim();
    }

    private String ipKey(String ip) {
        return "ip:" + (ip == null ? "unknown" : ip.trim());
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void loginSucceeded(String email) {
        loginSucceeded(email, null);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void loginSucceeded(String email, String clientIp) {
        if (email != null) {
            String norm = email.toLowerCase().trim();
            attemptsCache.remove(emailKey(norm));
            attemptsCache.remove(norm);
            try {
                loginAttemptRepository.deleteByEmailIgnoreCase(norm);
            } catch (Exception e) {
                log.warn("Failed to delete login attempts for user [{}] from database: {}", norm, e.getMessage());
            }
        }
        // SECURITY (A2): Do not remove IP throttle on successful login.
        // IP-level rate limiting enforces a fixed window to prevent distributed
        // brute-force attacks that spray attempts across many accounts from the
        // same IP. Clearing the IP bucket would allow attackers to bypass this
        // protection by succeeding on one account and continuing attacks on others.
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public boolean loginFailed(String email) {
        return loginFailed(email, null);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public boolean loginFailed(String email, String clientIp) {
        boolean emailLocked = false;
        boolean ipLocked = false;
        if (email != null) {
            String normEmail = email.toLowerCase().trim();
            AttemptData result = recordFailure(emailKey(normEmail), MAX_ATTEMPTS, EMAIL_LOCK_MILLIS, "email=" + normEmail);
            if (result != null && result.lockExpirationTime != null) {
                emailLocked = true;
            }
            // Persist email lockout state to PostgreSQL
            try {
                Optional<LoginAttempt> opt = loginAttemptRepository.findByEmailIgnoreCase(normEmail);
                LoginAttempt entity = opt.orElseGet(() -> LoginAttempt.builder().email(normEmail).build());
                entity.setAttemptCount(result != null ? result.attempts : 1);
                entity.setLastAttemptAt(result != null ? result.lastAttemptTime : Instant.now());
                entity.setLockExpiresAt(result != null ? result.lockExpirationTime : null);
                loginAttemptRepository.save(entity);
            } catch (Exception e) {
                log.warn("Failed to persist login attempt to database for user [{}]: {}", normEmail, e.getMessage());
            }
        }
        if (clientIp != null) {
            AttemptData ipResult = recordFailure(ipKey(clientIp), MAX_IP_ATTEMPTS, IP_LOCK_MILLIS, "ip=" + clientIp);
            if (ipResult != null && ipResult.lockExpirationTime != null) {
                ipLocked = true;
            }
        }
        return emailLocked || ipLocked;
    }

    private AttemptData recordFailure(String normalizedKey, int maxAttempts, long lockMillis, String label) {
        ensureCapacityFor(normalizedKey);

        return attemptsCache.compute(normalizedKey, (k, existing) -> {
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

            if (newAttempts >= maxAttempts) {
                lockExpiration = now.plusMillis(lockMillis);
                if (existing.lockExpirationTime == null) {
                    log.warn("SECURITY ALERT: [{}] locked due to {} consecutive failed login attempts until {}",
                            label, newAttempts, lockExpiration);
                }
            }
            return new AttemptData(newAttempts, now, lockExpiration);
        });
    }

    public boolean isBlocked(String email) {
        return isBlocked(email, null);
    }

    public boolean isBlocked(String email, String clientIp) {
        if (email != null && (checkBlockedKey(emailKey(email)) || checkBlockedKey(email.toLowerCase().trim()))) {
            return true;
        }
        if (clientIp != null && checkBlockedKey(ipKey(clientIp))) {
            return true;
        }

        // Cache miss fallback to database for email (e.g. across application restarts)
        if (email != null) {
            String norm = email.toLowerCase().trim();
            try {
                Optional<LoginAttempt> opt = loginAttemptRepository.findByEmailIgnoreCase(norm);
                if (opt.isPresent()) {
                    LoginAttempt entity = opt.get();
                    if (entity.getLockExpiresAt() != null) {
                        if (Instant.now().isAfter(entity.getLockExpiresAt())) {
                            loginAttemptRepository.delete(entity);
                            return false;
                        }
                        // Populate memory cache
                        attemptsCache.put(
                            emailKey(norm),
                            new AttemptData(entity.getAttemptCount(), entity.getLastAttemptAt(), entity.getLockExpiresAt())
                        );
                        return true;
                    }
                }
            } catch (Exception e) {
                log.warn("Error querying database for lockout status of user [{}]: {}", norm, e.getMessage());
            }
        }

        return false;
    }

    private boolean checkBlockedKey(String key) {
        AttemptData data = attemptsCache.get(key);
        if (data == null || data.lockExpirationTime == null) {
            return false;
        }
        if (Instant.now().isAfter(data.lockExpirationTime)) {
            attemptsCache.remove(key);
            return false;
        }
        return true;
    }

    public long getRemainingLockTimeMinutes(String email) {
        return getRemainingLockTimeMinutes(email, null);
    }

    public long getRemainingLockTimeMinutes(String email, String clientIp) {
        Instant expEmail = getExpirationFor(email != null ? emailKey(email) : null);
        if (expEmail == null && email != null) {
            expEmail = getExpirationFor(email.toLowerCase().trim());
        }
        Instant expIp = getExpirationFor(clientIp != null ? ipKey(clientIp) : null);

        Instant maxExp = expEmail;
        if (maxExp == null || (expIp != null && expIp.isAfter(maxExp))) {
            maxExp = expIp;
        }

        // DB fallback for email
        if (maxExp == null && email != null) {
            try {
                Optional<LoginAttempt> opt = loginAttemptRepository.findByEmailIgnoreCase(email.toLowerCase().trim());
                if (opt.isPresent() && opt.get().getLockExpiresAt() != null) {
                    maxExp = opt.get().getLockExpiresAt();
                }
            } catch (Exception ignored) {}
        }

        if (maxExp == null) return 0;
        long remainingMillis = maxExp.toEpochMilli() - Instant.now().toEpochMilli();
        return Math.max(1, (remainingMillis / (60 * 1000)) + 1);
    }

    private Instant getExpirationFor(String key) {
        if (key == null) return null;
        AttemptData data = attemptsCache.get(key);
        return data != null ? data.lockExpirationTime : null;
    }
}
