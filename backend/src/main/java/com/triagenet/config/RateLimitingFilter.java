package com.triagenet.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * High-performance in-memory Token Bucket / Sliding Window Rate Limiting Filter.
 * Protects TriageNet against automated scraping, brute-force requests, and denial-of-service.
 */
@Component
@Order(1)
@Slf4j
public class RateLimitingFilter extends OncePerRequestFilter {

    @Autowired(required = false)
    private Environment environment;

    private static final int MAX_REQUESTS_PER_MINUTE = 150;
    private static final long WINDOW_MS = 60_000L;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if (environment != null && environment.matchesProfiles("test")) {
            return true;
        }
        return false;
    }

    private static class RateTracker {
        long windowStartMs;
        AtomicInteger requestCount;

        RateTracker(long startMs) {
            this.windowStartMs = startMs;
            this.requestCount = new AtomicInteger(1);
        }
    }

    private final Map<String, RateTracker> ipTrackers = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Bypass static assets, Swagger UI, OpenAPI documentation, and healthchecks
        if (path.startsWith("/v3/api-docs") || path.startsWith("/swagger-ui") ||
            path.equals("/healthz") || path.startsWith("/_next") || path.endsWith(".ico")) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = extractClientIp(request);
        long now = System.currentTimeMillis();

        RateTracker tracker = ipTrackers.compute(clientIp, (key, existing) -> {
            if (existing == null || (now - existing.windowStartMs) > WINDOW_MS) {
                return new RateTracker(now);
            } else {
                existing.requestCount.incrementAndGet();
                return existing;
            }
        });

        int currentCount = tracker.requestCount.get();

        if (currentCount > MAX_REQUESTS_PER_MINUTE) {
            long retryAfterSeconds = Math.max(1, (WINDOW_MS - (now - tracker.windowStartMs)) / 1000);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
            response.setHeader("X-RateLimit-Limit", String.valueOf(MAX_REQUESTS_PER_MINUTE));
            response.setHeader("X-RateLimit-Remaining", "0");

            response.getWriter().write(String.format(
                    "{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"Clinical telemetry rate limit exceeded. Retry after %d seconds.\"}",
                    retryAfterSeconds
            ));
            log.warn("Rate limit exceeded for IP: {} on path: {}", clientIp, path);
            return;
        }

        int remaining = Math.max(0, MAX_REQUESTS_PER_MINUTE - currentCount);
        response.setHeader("X-RateLimit-Limit", String.valueOf(MAX_REQUESTS_PER_MINUTE));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(remaining));

        filterChain.doFilter(request, response);
    }

    private String extractClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "127.0.0.1";
    }
}
