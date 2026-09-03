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
import java.util.UUID;

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
    private final TotpService totpService;
    private final MnemonicRecoveryService mnemonicRecoveryService;
    private final com.triagenet.repository.ShiftSessionRepository shiftSessionRepository;
    private final com.triagenet.repository.HospitalRepository hospitalRepository;

    @PostConstruct
    @Transactional
    public void initRoles() {
        for (RoleName roleName : RoleName.values()) {
            if (roleRepository.findByName(roleName).isEmpty()) {
                roleRepository.save(Role.builder().name(roleName).build());
            }
        }

        if (staffUserRepository.count() == 0) {
            Role superAdminRole = roleRepository.findByName(RoleName.SUPER_ADMIN).orElse(null);
            if (superAdminRole != null) {
                staffUserRepository.save(StaffUser.builder()
                        .name("System Super Admin")
                        .staffId("JH-SYS-0001")
                        .email("superadmin@triagenet.gov.in")
                        .passwordHash(passwordEncoder.encode("Admin@123!"))
                        .role(superAdminRole)
                        .status(StaffUser.UserStatus.ACTIVE)
                        .build());
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
        String identifier = request.getEmail() != null ? request.getEmail().trim() : "";
        String clientIp = clientIpOf(httpRequest);

        if (loginAttemptService.isBlocked(identifier, clientIp)) {
            long remainingMins = loginAttemptService.getRemainingLockTimeMinutes(identifier, clientIp);
            securityAuditService.logEvent(SecurityEventType.AUTH_ACCOUNT_LOCKED, identifier, "/api/auth/login",
                    "Attempt blocked. Lock remaining: " + remainingMins + " mins");
            throw new LockedException("Account is temporarily locked due to consecutive failed login attempts. Please try again after " + remainingMins + " minutes.");
        }

        // Check user status before authentication
        StaffUser user = staffUserRepository.findByStaffIdOrEmail(identifier, identifier).orElse(null);
        if (user != null) {
            if (user.getStatus() == StaffUser.UserStatus.PENDING_VERIFICATION) {
                throw new LockedException("Account registration for Staff ID " + (user.getStaffId() != null ? user.getStaffId() : identifier) +
                        " has been submitted. It is currently pending in-person badge verification by your Medical Superintendent or District CMO.");
            } else if (user.getStatus() == StaffUser.UserStatus.SUSPENDED) {
                throw new LockedException("Staff account (" + (user.getStaffId() != null ? user.getStaffId() : identifier) + ") has been suspended by hospital administration.");
            } else if (user.getStatus() == StaffUser.UserStatus.REJECTED) {
                throw new LockedException("Staff registration for " + (user.getStaffId() != null ? user.getStaffId() : identifier) + " was rejected by hospital administration.");
            }
        }

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(identifier, request.getPassword())
            );
            loginAttemptService.loginSucceeded(identifier, clientIp);
        } catch (AuthenticationException e) {
            boolean isNowLocked = loginAttemptService.loginFailed(identifier, clientIp);
            securityAuditService.logEvent(SecurityEventType.AUTH_LOGIN_FAILURE, identifier, "/api/auth/login", e.getMessage());
            if (isNowLocked) {
                securityAuditService.logEvent(SecurityEventType.AUTH_ACCOUNT_LOCKED, identifier, "/api/auth/login",
                        "Account locked after reaching max failed login attempts");
            }
            throw e;
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        if (user == null) {
            user = staffUserRepository.findByStaffIdOrEmail(identifier, identifier)
                    .orElseThrow(() -> new com.triagenet.exception.ResourceNotFoundException("User not found: " + identifier));
        }

        if (user.isTotpEnabled()) {
            // Cryptographic 2FA required: issue 5-minute challenge token
            String challengeToken = jwtUtil.generate2faChallengeToken(user.getEmail());
            securityAuditService.logEvent(SecurityEventType.AUTH_LOGIN_SUCCESS, user.getEmail(), "/api/auth/login",
                    "Password verified; 2FA challenge issued for Staff ID: " + user.getStaffId());
            return LoginResponse.builder()
                    .twoFactorRequired(true)
                    .challengeToken(challengeToken)
                    .staffId(user.getStaffId())
                    .status(user.getStatus())
                    .email(user.getEmail())
                    .name(user.getName())
                    .build();
        }

        String token = jwtUtil.generateToken(userDetails);

        // SECURITY (V4): Generate cryptographically random refresh token and persist SHA-256 hash
        String refreshToken = jwtUtil.generateRefreshToken();
        RefreshToken rt = RefreshToken.builder()
                .user(user)
                .tokenHash(jwtUtil.hashToken(refreshToken))
                .expiresAt(LocalDateTime.now().plusSeconds(jwtUtil.getRefreshExpirationMs() / 1000))
                .build();
        refreshTokenRepository.save(rt);

        securityAuditService.logEvent(SecurityEventType.AUTH_LOGIN_SUCCESS, user.getEmail(), "/api/auth/login",
                "Role: " + user.getRole().getName() + ", StaffId: " + user.getStaffId());

        return LoginResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .type("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .staffId(user.getStaffId())
                .status(user.getStatus())
                .role(user.getRole().getName())
                .hospitalId(user.getHospitalId())
                .build();
    }

    @Transactional
    public UserDto register(RegisterRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim() : "";
        if (staffUserRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email is already registered: " + email);
        }

        String staffId = request.getStaffId() != null ? request.getStaffId().trim().toUpperCase() : "";
        if (staffId.isBlank()) {
            staffId = "JH-STF-" + (1000 + (int)(Math.random() * 9000));
            while (staffUserRepository.existsByStaffId(staffId)) {
                staffId = "JH-STF-" + (1000 + (int)(Math.random() * 9000));
            }
        } else if (staffUserRepository.existsByStaffId(staffId)) {
            throw new IllegalArgumentException("Official Staff ID is already registered: " + staffId);
        }

        // SECURITY (V1, critical): ignore any client-supplied role — public
        // registration must only ever create least-privileged HOSPITAL_STAFF
        // accounts. Privileged roles are granted exclusively through an
        // authenticated admin workflow, never via this endpoint.
        RoleName roleName = RoleName.HOSPITAL_STAFF;
        if (request.getRole() != null && request.getRole() != RoleName.HOSPITAL_STAFF) {
            securityAuditService.logEvent(SecurityEventType.ACCESS_DENIED, email, "/api/auth/register",
                    "Blocked attempt to self-assign elevated role: " + request.getRole());
        }
        Role role = roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(Role.builder().name(roleName).build()));

        // Pre-generate 2FA Secret and 12-word BIP-39 recovery mnemonic for onboarding wizard
        String totpSecret = totpService.generateSecret();
        String qrUri = totpService.generateQrUri(staffId, totpSecret);
        String mnemonic = mnemonicRecoveryService.generateMnemonic();
        List<String> backupCodes = mnemonicRecoveryService.generateBackupCodes();

        StaffUser user = StaffUser.builder()
                .name(request.getName())
                .staffId(staffId)
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .hospitalId(request.getHospitalId())
                .role(role)
                .totpSecret(totpSecret)
                .recoveryPhraseHash(mnemonicRecoveryService.hashMnemonic(mnemonic))
                .emergencyCodesHash(mnemonicRecoveryService.hashBackupCodes(backupCodes))
                .status(StaffUser.UserStatus.PENDING_VERIFICATION)
                .build();

        StaffUser savedUser = staffUserRepository.save(user);
        securityAuditService.logEvent(SecurityEventType.AUTH_REGISTER_SUCCESS, savedUser.getEmail(), "/api/auth/register",
                "Role: " + savedUser.getRole().getName() + ", StaffId: " + staffId + ", Status: PENDING_VERIFICATION");

        UserDto dto = UserDto.fromEntity(savedUser);
        dto.setTotpSecret(totpSecret);
        dto.setQrUri(qrUri);
        dto.setRecoveryMnemonic(mnemonic);
        dto.setBackupCodes(backupCodes);
        return dto;
    }

    public com.triagenet.dto.ShiftAuthDto.StaffStatusDto getStaffStatus(String staffId) {
        if (staffId == null || staffId.isBlank()) {
            throw new IllegalArgumentException("Staff ID must not be empty");
        }
        StaffUser user = staffUserRepository.findByStaffIdOrEmail(staffId.trim().toUpperCase(), staffId.trim())
                .orElseThrow(() -> new com.triagenet.exception.ResourceNotFoundException("Staff ID not found: " + staffId));

        String hospitalName = "Unassigned / General Pool";
        if (user.getHospitalId() != null) {
            hospitalName = hospitalRepository.findById(user.getHospitalId())
                    .map(com.triagenet.entity.Hospital::getName)
                    .orElse("Hospital #" + user.getHospitalId());
        }

        return com.triagenet.dto.ShiftAuthDto.StaffStatusDto.builder()
                .staffId(user.getStaffId())
                .name(user.getName())
                .status(user.getStatus().name())
                .hospitalName(hospitalName)
                .role(user.getRole() != null ? user.getRole().getName().name() : "HOSPITAL_STAFF")
                .registeredAt(user.getCreatedAt())
                .build();
    }

    public List<com.triagenet.dto.ShiftAuthDto.PendingStaffDto> getPendingStaff(CustomUserDetails adminUser) {
        boolean isSuperAdmin = adminUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));

        List<StaffUser> pendingList;
        if (isSuperAdmin) {
            pendingList = staffUserRepository.findByStatus(StaffUser.UserStatus.PENDING_VERIFICATION);
        } else if (adminUser.getHospitalId() != null) {
            pendingList = staffUserRepository.findByHospitalIdAndStatus(
                    adminUser.getHospitalId(),
                    StaffUser.UserStatus.PENDING_VERIFICATION
            );
        } else {
            pendingList = staffUserRepository.findByStatus(StaffUser.UserStatus.PENDING_VERIFICATION);
        }

        return pendingList.stream().map(u -> {
            String hospName = "Unassigned";
            if (u.getHospitalId() != null) {
                hospName = hospitalRepository.findById(u.getHospitalId())
                        .map(com.triagenet.entity.Hospital::getName)
                        .orElse("Hospital #" + u.getHospitalId());
            }
            return com.triagenet.dto.ShiftAuthDto.PendingStaffDto.builder()
                    .id(u.getId().toString())
                    .staffId(u.getStaffId())
                    .name(u.getName())
                    .email(u.getEmail())
                    .role(u.getRole() != null ? u.getRole().getName().name() : "HOSPITAL_STAFF")
                    .hospitalId(u.getHospitalId() != null ? u.getHospitalId().toString() : null)
                    .hospitalName(hospName)
                    .status(u.getStatus().name())
                    .createdAt(u.getCreatedAt())
                    .build();
        }).toList();
    }

    @Transactional
    public void approveStaff(UUID staffUserId, RoleName assignedRole, CustomUserDetails adminUser) {
        StaffUser user = staffUserRepository.findById(staffUserId)
                .orElseThrow(() -> new com.triagenet.exception.ResourceNotFoundException("Staff user not found with id: " + staffUserId));

        user.setStatus(StaffUser.UserStatus.ACTIVE);
        if (assignedRole != null) {
            Role role = roleRepository.findByName(assignedRole)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid role: " + assignedRole));
            user.setRole(role);
        }
        staffUserRepository.save(user);

        securityAuditService.logEvent(SecurityEventType.AUTH_STAFF_APPROVED, adminUser.getEmail(), "/api/admin/staff/approve",
                "Approved Staff ID: " + user.getStaffId() + ", Role: " + user.getRole().getName());
    }

    @Transactional
    public void rejectStaff(UUID staffUserId, CustomUserDetails adminUser) {
        StaffUser user = staffUserRepository.findById(staffUserId)
                .orElseThrow(() -> new com.triagenet.exception.ResourceNotFoundException("Staff user not found with id: " + staffUserId));

        user.setStatus(StaffUser.UserStatus.REJECTED);
        staffUserRepository.save(user);

        securityAuditService.logEvent(SecurityEventType.AUTH_STAFF_REJECTED, adminUser.getEmail(), "/api/admin/staff/reject",
                "Rejected Staff ID: " + user.getStaffId());
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

    // ==========================================
    // HYBRID CRYPTOGRAPHIC 2FA & CLINICAL SHIFTS
    // ==========================================

    @Transactional
    public com.triagenet.dto.ShiftAuthDto.TwoFactorSetupResponse setup2fa(UUID userId) {
        StaffUser user = staffUserRepository.findById(userId)
                .orElseThrow(() -> new com.triagenet.exception.ResourceNotFoundException("User not found"));

        String secret = totpService.generateSecret();
        String qrUri = totpService.generateQrUri(user.getEmail(), secret);
        String mnemonic = mnemonicRecoveryService.generateMnemonic();
        List<String> backupCodes = mnemonicRecoveryService.generateBackupCodes();

        user.setTotpSecret(secret);
        user.setRecoveryPhraseHash(mnemonicRecoveryService.hashMnemonic(mnemonic));

        List<String> hashedCodes = backupCodes.stream()
                .map(mnemonicRecoveryService::hashBackupCode)
                .toList();
        user.setEmergencyCodesHash(String.join(",", hashedCodes));
        staffUserRepository.save(user);

        return com.triagenet.dto.ShiftAuthDto.TwoFactorSetupResponse.builder()
                .secret(secret)
                .qrUri(qrUri)
                .recoveryMnemonic(mnemonic)
                .backupCodes(backupCodes)
                .build();
    }

    @Transactional
    public void confirm2faSetup(UUID userId, com.triagenet.dto.ShiftAuthDto.TwoFactorConfirmRequest request) {
        StaffUser user = staffUserRepository.findById(userId)
                .orElseThrow(() -> new com.triagenet.exception.ResourceNotFoundException("User not found"));

        if (user.getTotpSecret() == null) {
            throw new IllegalStateException("2FA has not been initiated. Please run setup first.");
        }

        if (!totpService.validateCode(user.getTotpSecret(), request.getCode())) {
            throw new IllegalArgumentException("Invalid 6-digit code. Please check your authenticator app.");
        }

        user.setTotpEnabled(true);
        staffUserRepository.save(user);

        securityAuditService.logEvent(SecurityEventType.AUTH_LOGIN_SUCCESS, user.getEmail(),
                "/api/auth/2fa/confirm-setup", "2FA successfully activated on account");
    }

    @Transactional
    public LoginResponse verify2fa(com.triagenet.dto.ShiftAuthDto.TwoFactorVerifyRequest request, jakarta.servlet.http.HttpServletRequest httpRequest) {
        String email = jwtUtil.validate2faChallengeToken(request.getChallengeToken());
        if (email == null) {
            throw new org.springframework.security.authentication.BadCredentialsException("Invalid or expired 2FA challenge token. Please enter credentials again.");
        }

        StaffUser user = staffUserRepository.findByEmail(email)
                .orElseThrow(() -> new com.triagenet.exception.ResourceNotFoundException("User not found with email: " + email));

        String code = request.getCode().trim();
        boolean isValid = totpService.validateCode(user.getTotpSecret(), code);

        // Check single-use emergency backup code if TOTP failed
        if (!isValid && user.getEmergencyCodesHash() != null) {
            String codeHash = mnemonicRecoveryService.hashBackupCode(code);
            String storedCodes = user.getEmergencyCodesHash();
            if (storedCodes.contains(codeHash)) {
                // Burn the emergency backup code
                storedCodes = storedCodes.replace(codeHash, "").replace(",,", ",").replaceAll("^,|,$", "");
                user.setEmergencyCodesHash(storedCodes);
                staffUserRepository.save(user);
                isValid = true;
                securityAuditService.logEvent(SecurityEventType.AUTH_LOGIN_SUCCESS, email, "/api/auth/2fa/verify",
                        "Single-use emergency backup code utilized");
            }
        }

        if (!isValid) {
            securityAuditService.logEvent(SecurityEventType.AUTH_LOGIN_FAILURE, email, "/api/auth/2fa/verify",
                    "Invalid 2FA code entered");
            throw new org.springframework.security.authentication.BadCredentialsException("Invalid 6-digit authenticator code or emergency backup code");
        }

        // Establish Clinical Shift Session (8h or 12h)
        int duration = request.getShiftDurationHours() == 12 ? 12 : 8;
        String pinHash = passwordEncoder.encode(request.getShiftPin() != null ? request.getShiftPin() : "1234");
        String fingerprint = httpRequest != null ? httpRequest.getHeader("User-Agent") : "Clinical Terminal";

        // Deactivate previous shifts for this user
        shiftSessionRepository.findByUserIdAndActiveTrue(user.getId()).forEach(s -> {
            s.setActive(false);
            s.setEndedAt(LocalDateTime.now());
            shiftSessionRepository.save(s);
        });

        com.triagenet.entity.ShiftSession session = com.triagenet.entity.ShiftSession.builder()
                .user(user)
                .shiftPinHash(pinHash)
                .durationHours(duration)
                .workstationFingerprint(fingerprint)
                .startedAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusHours(duration))
                .isLocked(false)
                .active(true)
                .build();
        shiftSessionRepository.save(session);

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String token = jwtUtil.generateToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken();

        RefreshToken rt = RefreshToken.builder()
                .user(user)
                .tokenHash(jwtUtil.hashToken(refreshToken))
                .expiresAt(LocalDateTime.now().plusSeconds(jwtUtil.getRefreshExpirationMs() / 1000))
                .build();
        refreshTokenRepository.save(rt);

        securityAuditService.logEvent(SecurityEventType.AUTH_LOGIN_SUCCESS, email, "/api/auth/2fa/verify",
                "2FA verified. Shift session active for " + duration + " hours.");

        return LoginResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .type("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .hospitalId(user.getHospitalId())
                .shiftActive(true)
                .shiftDurationHours(duration)
                .isScreenLocked(false)
                .build();
    }

    @Transactional
    public LoginResponse unlockShift(UUID userId, com.triagenet.dto.ShiftAuthDto.ShiftUnlockRequest request) {
        StaffUser user = staffUserRepository.findById(userId)
                .orElseThrow(() -> new com.triagenet.exception.ResourceNotFoundException("User not found"));

        com.triagenet.entity.ShiftSession session = shiftSessionRepository.findFirstByUserIdAndActiveTrueOrderByStartedAtDesc(userId)
                .orElseThrow(() -> new IllegalStateException("No active clinical shift session found. Please start a new shift."));

        if (session.isExpired()) {
            session.setActive(false);
            session.setEndedAt(LocalDateTime.now());
            shiftSessionRepository.save(session);
            throw new IllegalStateException("Clinical duty shift has expired. Please sign in with full credentials.");
        }

        if (!passwordEncoder.matches(request.getPin(), session.getShiftPinHash())) {
            securityAuditService.logEvent(SecurityEventType.AUTH_LOGIN_FAILURE, user.getEmail(),
                    "/api/auth/shift/unlock", "Invalid Shift PIN entered");
            throw new org.springframework.security.authentication.BadCredentialsException("Invalid 4-digit Shift PIN");
        }

        session.setLocked(false);
        shiftSessionRepository.save(session);

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String token = jwtUtil.generateToken(userDetails);

        return LoginResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .hospitalId(user.getHospitalId())
                .shiftActive(true)
                .shiftDurationHours(session.getDurationHours())
                .isScreenLocked(false)
                .build();
    }

    @Transactional
    public void lockShift(UUID userId) {
        shiftSessionRepository.findFirstByUserIdAndActiveTrueOrderByStartedAtDesc(userId).ifPresent(s -> {
            s.setLocked(true);
            shiftSessionRepository.save(s);
        });
    }

    @Transactional
    public void endShift(UUID userId) {
        StaffUser user = staffUserRepository.findById(userId).orElse(null);
        if (user != null) {
            shiftSessionRepository.findByUserIdAndActiveTrue(userId).forEach(s -> {
                s.setActive(false);
                s.setEndedAt(LocalDateTime.now());
                shiftSessionRepository.save(s);
            });
            refreshTokenRepository.revokeAllForUser(user, LocalDateTime.now());
            securityAuditService.logEvent(SecurityEventType.AUTH_LOGIN_SUCCESS, user.getEmail(),
                    "/api/auth/shift/end", "Clinical duty shift terminated; all tokens revoked.");
        }
    }

    public com.triagenet.dto.ShiftAuthDto.ShiftStatusResponse getShiftStatus(UUID userId) {
        com.triagenet.entity.ShiftSession session = shiftSessionRepository.findFirstByUserIdAndActiveTrueOrderByStartedAtDesc(userId)
                .orElse(null);

        if (session == null || !session.isActive() || session.isExpired()) {
            return com.triagenet.dto.ShiftAuthDto.ShiftStatusResponse.builder()
                    .shiftActive(false)
                    .isLocked(false)
                    .build();
        }

        long remainingMinutes = java.time.Duration.between(LocalDateTime.now(), session.getExpiresAt()).toMinutes();
        return com.triagenet.dto.ShiftAuthDto.ShiftStatusResponse.builder()
                .shiftActive(true)
                .isLocked(session.isLocked())
                .durationHours(session.getDurationHours())
                .startedAt(session.getStartedAt())
                .expiresAt(session.getExpiresAt())
                .remainingMinutes(Math.max(0, remainingMinutes))
                .build();
    }

    @Transactional
    public void recoverWithMnemonic(com.triagenet.dto.ShiftAuthDto.MnemonicRecoveryRequest request) {
        StaffUser user = staffUserRepository.findByEmail(request.getEmail().trim())
                .orElseThrow(() -> new com.triagenet.exception.ResourceNotFoundException("Account not found with email: " + request.getEmail()));

        if (user.getRecoveryPhraseHash() == null) {
            throw new IllegalStateException("No recovery phrase was configured for this account. Contact your District CMO for emergency escrow.");
        }

        if (!mnemonicRecoveryService.verifyMnemonic(request.getMnemonic(), user.getRecoveryPhraseHash())) {
            securityAuditService.logEvent(SecurityEventType.AUTH_LOGIN_FAILURE, user.getEmail(),
                    "/api/auth/recovery/mnemonic", "Invalid 12-word mnemonic phrase submitted");
            throw new org.springframework.security.authentication.BadCredentialsException("Invalid 12-word cryptographic recovery phrase");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setTotpEnabled(false);
        user.setTotpSecret(null);
        staffUserRepository.save(user);

        refreshTokenRepository.revokeAllForUser(user, LocalDateTime.now());

        securityAuditService.logEvent(SecurityEventType.AUTH_LOGIN_SUCCESS, user.getEmail(),
                "/api/auth/recovery/mnemonic", "Account successfully recovered via 12-word mnemonic phrase");
    }

    @Transactional
    public void recoverWithBackupCode(com.triagenet.dto.ShiftAuthDto.BackupCodeRecoveryRequest request) {
        StaffUser user = staffUserRepository.findByEmail(request.getEmail().trim())
                .orElseThrow(() -> new com.triagenet.exception.ResourceNotFoundException("Account not found with email: " + request.getEmail()));

        if (user.getEmergencyCodesHash() == null) {
            throw new IllegalStateException("No backup codes exist for this account.");
        }

        String codeHash = mnemonicRecoveryService.hashBackupCode(request.getBackupCode());
        if (!user.getEmergencyCodesHash().contains(codeHash)) {
            securityAuditService.logEvent(SecurityEventType.AUTH_LOGIN_FAILURE, user.getEmail(),
                    "/api/auth/recovery/backup-code", "Invalid emergency backup code");
            throw new org.springframework.security.authentication.BadCredentialsException("Invalid emergency backup code");
        }

        // Burn the code
        String updated = user.getEmergencyCodesHash().replace(codeHash, "").replace(",,", ",").replaceAll("^,|,$", "");
        user.setEmergencyCodesHash(updated);
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        staffUserRepository.save(user);

        refreshTokenRepository.revokeAllForUser(user, LocalDateTime.now());

        securityAuditService.logEvent(SecurityEventType.AUTH_LOGIN_SUCCESS, user.getEmail(),
                "/api/auth/recovery/backup-code", "Account successfully recovered via emergency backup code");
    }

    @Transactional
    public String approveCmoEscrow(CustomUserDetails approver, com.triagenet.dto.ShiftAuthDto.CmoEscrowApprovalRequest request) {
        StaffUser target = staffUserRepository.findByEmail(request.getTargetStaffEmail().trim())
                .orElseThrow(() -> new com.triagenet.exception.ResourceNotFoundException("Staff user not found: " + request.getTargetStaffEmail()));

        CustomUserDetails targetDetails = new CustomUserDetails(target);
        String emergencyToken = jwtUtil.generateToken(targetDetails);

        securityAuditService.logEvent(SecurityEventType.AUTH_LOGIN_SUCCESS, target.getEmail(),
                "/api/auth/recovery/cmo-escrow", "Emergency shift bypass issued by " + approver.getUsername() + ": " + request.getEscrowReason());

        return emergencyToken;
    }
}
