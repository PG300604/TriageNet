package com.triagenet.service;

import com.triagenet.config.CustomUserDetails;
import com.triagenet.dto.LoginRequest;
import com.triagenet.dto.LoginResponse;
import com.triagenet.dto.RegisterRequest;
import com.triagenet.dto.UserDto;
import com.triagenet.entity.RefreshToken;
import com.triagenet.entity.Role;
import com.triagenet.entity.RoleName;
import com.triagenet.entity.StaffUser;
import com.triagenet.repository.RefreshTokenRepository;
import com.triagenet.repository.RoleRepository;
import com.triagenet.repository.StaffUserRepository;
import com.triagenet.service.SecurityAuditService.SecurityEventType;
import com.triagenet.util.JwtUtil;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final StaffUserRepository staffUserRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final LoginAttemptService loginAttemptService;
    private final SecurityAuditService securityAuditService;

    @PostConstruct
    @Transactional
    public void initRoles() {
        for (RoleName roleName : RoleName.values()) {
            if (roleRepository.findByName(roleName).isEmpty()) {
                roleRepository.save(Role.builder().name(roleName).build());
            }
        }
    }

    @org.springframework.beans.factory.annotation.Value("${security.trusted-proxies:127.0.0.1,::1,0:0:0:0:0:0:0:1,localhost}")
    private List<String> trustedProxies = List.of("127.0.0.1", "::1", "0:0:0:0:0:0:0:1", "localhost");

    public boolean isTrustedProxy(String remoteAddr) {
        if (remoteAddr == null || remoteAddr.isBlank()) return false;
        String trimmed = remoteAddr.trim();
        if (trustedProxies != null && (trustedProxies.contains(trimmed) || trustedProxies.contains("*"))) {
            return true;
        }
        return trimmed.equals("127.0.0.1") || trimmed.equals("0:0:0:0:0:0:0:1") || trimmed.equals("::1")
                || trimmed.startsWith("10.") || trimmed.startsWith("192.168.")
                || (trimmed.startsWith("172.") && is172Private(trimmed));
    }

    private boolean is172Private(String ip) {
        try {
            String[] parts = ip.split("\\.");
            if (parts.length >= 2) {
                int second = Integer.parseInt(parts[1]);
                return second >= 16 && second <= 31;
            }
        } catch (Exception ignored) {}
        return false;
    }

    /**
     * Extracts client IP. Uses X-Forwarded-For ONLY when request.getRemoteAddr()
     * belongs to the trusted proxy allowlist; otherwise returns getRemoteAddr().
     */
    public String clientIpOf(jakarta.servlet.http.HttpServletRequest request) {
        if (request == null) return null;
        String remoteAddr = request.getRemoteAddr();
        if (remoteAddr != null && isTrustedProxy(remoteAddr)) {
            String xff = request.getHeader("X-Forwarded-For");
            if (xff != null && !xff.isBlank()) {
                return xff.split(",")[0].trim();
            }
        }
        return remoteAddr;
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        return login(request, null);
    }

    @Transactional
    public LoginResponse login(LoginRequest request, jakarta.servlet.http.HttpServletRequest httpRequest) {
        String email = request.getEmail() != null ? request.getEmail().trim() : "";
        String clientIp = clientIpOf(httpRequest);

        if (loginAttemptService.isBlocked(email, clientIp)) {
            long remainingMins = loginAttemptService.getRemainingLockTimeMinutes(email, clientIp);
            securityAuditService.logEvent(SecurityEventType.AUTH_ACCOUNT_LOCKED, email, "/api/auth/login",
                    "Attempt blocked. Lock remaining: " + remainingMins + " mins");
            throw new LockedException("Account is temporarily locked due to consecutive failed login attempts. Please try again after " + remainingMins + " minutes.");
        }

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );
            loginAttemptService.loginSucceeded(email, clientIp);
        } catch (AuthenticationException e) {
            boolean isNowLocked = loginAttemptService.loginFailed(email, clientIp);
            securityAuditService.logEvent(SecurityEventType.AUTH_LOGIN_FAILURE, email, "/api/auth/login", e.getMessage());
            if (isNowLocked) {
                securityAuditService.logEvent(SecurityEventType.AUTH_ACCOUNT_LOCKED, email, "/api/auth/login",
                        "Account locked after reaching max failed login attempts");
            }
            throw e;
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String token = jwtUtil.generateToken(userDetails);

        StaffUser user = staffUserRepository.findByEmail(email)
                .orElseThrow(() -> new com.triagenet.exception.ResourceNotFoundException("User not found with email: " + email));

        // SECURITY (V4): Generate cryptographically random refresh token and persist SHA-256 hash
        String refreshToken = jwtUtil.generateRefreshToken();
        RefreshToken rt = RefreshToken.builder()
                .user(user)
                .tokenHash(jwtUtil.hashToken(refreshToken))
                .expiresAt(LocalDateTime.now().plusSeconds(jwtUtil.getRefreshExpirationMs() / 1000))
                .build();
        refreshTokenRepository.save(rt);

        securityAuditService.logEvent(SecurityEventType.AUTH_LOGIN_SUCCESS, email, "/api/auth/login",
                "Role: " + user.getRole().getName());

        return LoginResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .type("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .hospitalId(user.getHospitalId())
                .build();
    }

    @Transactional
    public UserDto register(RegisterRequest request) {
        if (staffUserRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered: " + request.getEmail());
        }

        // SECURITY (V1, critical): ignore any client-supplied role — public
        // registration must only ever create least-privileged HOSPITAL_STAFF
        // accounts. Privileged roles are granted exclusively through an
        // authenticated admin workflow, never via this endpoint.
        RoleName roleName = RoleName.HOSPITAL_STAFF;
        if (request.getRole() != null && request.getRole() != RoleName.HOSPITAL_STAFF) {
            securityAuditService.logEvent(SecurityEventType.ACCESS_DENIED, request.getEmail(), "/api/auth/register",
                    "Blocked attempt to self-assign elevated role: " + request.getRole());
        }
        Role role = roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(Role.builder().name(roleName).build()));

        StaffUser user = StaffUser.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .hospitalId(request.getHospitalId())
                .role(role)
                .build();

        StaffUser savedUser = staffUserRepository.save(user);
        securityAuditService.logEvent(SecurityEventType.AUTH_REGISTER_SUCCESS, savedUser.getEmail(), "/api/auth/register",
                "Role: " + savedUser.getRole().getName());

        return UserDto.fromEntity(savedUser);
    }

    public UserDto getCurrentUser(CustomUserDetails userDetails) {
        StaffUser user = staffUserRepository.findById(userDetails.getId())
                .orElseThrow(() -> new com.triagenet.exception.ResourceNotFoundException("User not found with id: " + userDetails.getId()));
        return UserDto.fromEntity(user);
    }

    /**
     * SECURITY (V4): Rotate refresh token and issue new short-lived access token.
     * Enforces rotation: the used refresh token is immediately revoked.
     * If a revoked token is reused, all active tokens for that user are revoked (replay attack defense).
     */
    @Transactional
    public LoginResponse refreshToken(String rawRefreshToken, jakarta.servlet.http.HttpServletRequest httpRequest) {
        String clientIp = clientIpOf(httpRequest);
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new org.springframework.security.authentication.BadCredentialsException("Refresh token is required");
        }

        String hash = jwtUtil.hashToken(rawRefreshToken);
        RefreshToken rt = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new org.springframework.security.authentication.BadCredentialsException("Invalid refresh token"));

        if (rt.isRevoked()) {
            // Replay attack detected: revoke all refresh tokens for this user
            refreshTokenRepository.revokeAllForUser(rt.getUser(), LocalDateTime.now());
            securityAuditService.logEvent(SecurityEventType.AUTH_LOGIN_FAILURE, rt.getUser().getEmail(),
                    "/api/auth/refresh", "Revoked refresh token reuse detected! All user tokens revoked.");
            throw new org.springframework.security.authentication.BadCredentialsException("Revoked refresh token reused");
        }

        if (rt.isExpired()) {
            throw new org.springframework.security.authentication.BadCredentialsException("Refresh token has expired");
        }

        // Revoke the current refresh token (rotation)
        rt.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(rt);

        // Generate new token pair
        StaffUser user = rt.getUser();
        CustomUserDetails userDetails = new CustomUserDetails(user);
        String newAccessToken = jwtUtil.generateToken(userDetails);
        String newRefreshToken = jwtUtil.generateRefreshToken();

        RefreshToken newRt = RefreshToken.builder()
                .user(user)
                .tokenHash(jwtUtil.hashToken(newRefreshToken))
                .expiresAt(LocalDateTime.now().plusSeconds(jwtUtil.getRefreshExpirationMs() / 1000))
                .build();
        refreshTokenRepository.save(newRt);

        securityAuditService.logEvent(SecurityEventType.AUTH_LOGIN_SUCCESS, user.getEmail(),
                "/api/auth/refresh", "Token successfully rotated");

        return LoginResponse.builder()
                .token(newAccessToken)
                .refreshToken(newRefreshToken)
                .type("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .hospitalId(user.getHospitalId())
                .build();
    }

    /**
     * SECURITY (V4): Explicit logout revoking the refresh token.
     */
    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken != null && !rawRefreshToken.isBlank()) {
            String hash = jwtUtil.hashToken(rawRefreshToken);
            refreshTokenRepository.findByTokenHash(hash).ifPresent(rt -> {
                rt.setRevokedAt(LocalDateTime.now());
                refreshTokenRepository.save(rt);
            });
        }
    }
}
