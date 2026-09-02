package com.triagenet.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

/**
 * SECURITY (V9): CSRF Guard Filter for Cookie-Based Authentication.
 * State-changing operations (POST, PUT, DELETE, PATCH) authenticated via HttpOnly cookies
 * MUST supply a custom header (X-Requested-With or X-CSRF-TOKEN) to prevent cross-origin form attacks.
 * Requests using Bearer tokens in Authorization header or public endpoints are exempt.
 */
@Component
public class CsrfGuardFilter extends OncePerRequestFilter {

    private static final Set<String> MUTATING_METHODS = Set.of("POST", "PUT", "DELETE", "PATCH");
    private static final Set<String> EXEMPT_PREFIXES = Set.of(
            "/api/auth",
            "/api/patients/score-vitals",
            "/api/routing/optimal",
            "/h2-console"
    );

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String method = request.getMethod();

        if (MUTATING_METHODS.contains(method)) {
            String path = request.getRequestURI();
            boolean isExempt = EXEMPT_PREFIXES.stream().anyMatch(path::startsWith);

            if (!isExempt) {
                // Check if authenticated via cookie
                boolean hasAuthCookie = false;
                if (request.getCookies() != null) {
                    for (Cookie c : request.getCookies()) {
                        if ("triagenet_jwt".equals(c.getName()) || "triagenet_refresh".equals(c.getName())) {
                            hasAuthCookie = true;
                            break;
                        }
                    }
                }

                // If cookie-authenticated and no Authorization: Bearer header is present,
                // enforce presence of custom header X-Requested-With or X-CSRF-TOKEN
                String authHeader = request.getHeader("Authorization");
                boolean hasBearer = authHeader != null && authHeader.startsWith("Bearer ");

                if (hasAuthCookie && !hasBearer) {
                    String requestedWith = request.getHeader("X-Requested-With");
                    String csrfHeader = request.getHeader("X-CSRF-TOKEN");
                    if (requestedWith == null && csrfHeader == null) {
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        response.setContentType("application/json");
                        response.getWriter().write("{\"status\":403,\"error\":\"Forbidden\",\"message\":\"CSRF guard: Mutating requests using cookie authentication must provide X-Requested-With or X-CSRF-TOKEN header.\"}");
                        return;
                    }
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
