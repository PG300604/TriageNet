package com.triagenet.service;

import com.triagenet.config.CustomUserDetails;
import com.triagenet.dto.LoginRequest;
import com.triagenet.dto.LoginResponse;
import com.triagenet.dto.RegisterRequest;
import com.triagenet.dto.UserDto;
import com.triagenet.entity.Role;
import com.triagenet.entity.RoleName;
import com.triagenet.entity.StaffUser;
import com.triagenet.repository.RoleRepository;
import com.triagenet.repository.StaffUserRepository;
import com.triagenet.service.SecurityAuditService.SecurityEventType;
import com.triagenet.util.JwtUtil;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final StaffUserRepository staffUserRepository;
    private final RoleRepository roleRepository;
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

    @Transactional
    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim() : "";

        if (loginAttemptService.isBlocked(email)) {
            long remainingMins = loginAttemptService.getRemainingLockTimeMinutes(email);
            securityAuditService.logEvent(SecurityEventType.AUTH_ACCOUNT_LOCKED, email, "/api/auth/login",
                    "Attempt blocked. Lock remaining: " + remainingMins + " mins");
            throw new LockedException("Account is temporarily locked due to 5 consecutive failed login attempts. Please try again after " + remainingMins + " minutes.");
        }

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );
            loginAttemptService.loginSucceeded(email);
        } catch (AuthenticationException e) {
            loginAttemptService.loginFailed(email);
            securityAuditService.logEvent(SecurityEventType.AUTH_LOGIN_FAILURE, email, "/api/auth/login", e.getMessage());
            throw e;
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String token = jwtUtil.generateToken(userDetails);

        StaffUser user = staffUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        securityAuditService.logEvent(SecurityEventType.AUTH_LOGIN_SUCCESS, email, "/api/auth/login",
                "Role: " + user.getRole().getName());

        return LoginResponse.builder()
                .token(token)
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

        RoleName roleName = request.getRole() != null ? request.getRole() : RoleName.HOSPITAL_STAFF;
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
                .orElseThrow(() -> new RuntimeException("User not found"));
        return UserDto.fromEntity(user);
    }
}
