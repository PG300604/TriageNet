package com.triagenet.controller;

import com.triagenet.config.CustomUserDetails;
import com.triagenet.dto.LoginRequest;
import com.triagenet.dto.LoginResponse;
import com.triagenet.dto.RegisterRequest;
import com.triagenet.dto.UserDto;
import com.triagenet.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final Environment environment;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            jakarta.servlet.http.HttpServletRequest httpRequest,
            HttpServletResponse response) {
        LoginResponse loginResponse = authService.login(request, httpRequest);
        boolean isProd = environment != null && environment.acceptsProfiles(Profiles.of("prod", "production"));

        // Short-lived access token cookie (15 minutes)
        ResponseCookie accessCookie = ResponseCookie.from("triagenet_jwt", loginResponse.getToken())
                .httpOnly(true)
                .secure(isProd)
                .path("/")
                .maxAge(900) // 15 minutes
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());

        // Long-lived refresh token cookie (7 days)
        if (loginResponse.getRefreshToken() != null) {
            ResponseCookie refreshCookie = ResponseCookie.from("triagenet_refresh", loginResponse.getRefreshToken())
                    .httpOnly(true)
                    .secure(isProd)
                    .path("/api/auth")
                    .maxAge(604800) // 7 days
                    .sameSite("Lax")
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
        }

        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(
            jakarta.servlet.http.HttpServletRequest httpRequest,
            HttpServletResponse response,
            @RequestBody(required = false) Map<String, String> body) {
        String refreshToken = null;
        if (httpRequest.getCookies() != null) {
            for (jakarta.servlet.http.Cookie c : httpRequest.getCookies()) {
                if ("triagenet_refresh".equals(c.getName())) {
                    refreshToken = c.getValue();
                    break;
                }
            }
        }
        if (refreshToken == null && body != null) {
            refreshToken = body.get("refreshToken");
        }

        LoginResponse loginResponse = authService.refreshToken(refreshToken, httpRequest);
        boolean isProd = environment != null && environment.acceptsProfiles(Profiles.of("prod", "production"));

        ResponseCookie accessCookie = ResponseCookie.from("triagenet_jwt", loginResponse.getToken())
                .httpOnly(true)
                .secure(isProd)
                .path("/")
                .maxAge(900)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());

        if (loginResponse.getRefreshToken() != null) {
            ResponseCookie refreshCookie = ResponseCookie.from("triagenet_refresh", loginResponse.getRefreshToken())
                    .httpOnly(true)
                    .secure(isProd)
                    .path("/api/auth")
                    .maxAge(604800)
                    .sameSite("Lax")
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
        }

        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            jakarta.servlet.http.HttpServletRequest httpRequest,
            HttpServletResponse response,
            @RequestBody(required = false) Map<String, String> body) {
        String refreshToken = null;
        if (httpRequest.getCookies() != null) {
            for (jakarta.servlet.http.Cookie c : httpRequest.getCookies()) {
                if ("triagenet_refresh".equals(c.getName())) {
                    refreshToken = c.getValue();
                    break;
                }
            }
        }
        if (refreshToken == null && body != null) {
            refreshToken = body.get("refreshToken");
        }

        authService.logout(refreshToken);
        boolean isProd = environment != null && environment.acceptsProfiles(Profiles.of("prod", "production"));

        ResponseCookie accessCookie = ResponseCookie.from("triagenet_jwt", "")
                .httpOnly(true)
                .secure(isProd)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        ResponseCookie refreshCookie = ResponseCookie.from("triagenet_refresh", "")
                .httpOnly(true)
                .secure(isProd)
                .path("/api/auth")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(authService.getCurrentUser(userDetails));
    }

    // ==========================================
    // HYBRID CRYPTOGRAPHIC 2FA & CLINICAL SHIFTS
    // ==========================================

    @PostMapping("/2fa/setup")
    public ResponseEntity<com.triagenet.dto.ShiftAuthDto.TwoFactorSetupResponse> setup2fa(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(authService.setup2fa(userDetails.getId()));
    }

    @PostMapping("/2fa/confirm-setup")
    public ResponseEntity<Map<String, String>> confirm2faSetup(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody com.triagenet.dto.ShiftAuthDto.TwoFactorConfirmRequest request) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        authService.confirm2faSetup(userDetails.getId(), request);
        return ResponseEntity.ok(Map.of("message", "2FA successfully activated on account"));
    }

    @PostMapping("/2fa/verify")
    public ResponseEntity<LoginResponse> verify2fa(
            @Valid @RequestBody com.triagenet.dto.ShiftAuthDto.TwoFactorVerifyRequest request,
            jakarta.servlet.http.HttpServletRequest httpRequest,
            HttpServletResponse response) {
        LoginResponse loginResponse = authService.verify2fa(request, httpRequest);
        boolean isProd = environment != null && environment.acceptsProfiles(Profiles.of("prod", "production"));

        ResponseCookie accessCookie = ResponseCookie.from("triagenet_jwt", loginResponse.getToken())
                .httpOnly(true)
                .secure(isProd)
                .path("/")
                .maxAge(900)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());

        if (loginResponse.getRefreshToken() != null) {
            ResponseCookie refreshCookie = ResponseCookie.from("triagenet_refresh", loginResponse.getRefreshToken())
                    .httpOnly(true)
                    .secure(isProd)
                    .path("/api/auth")
                    .maxAge(604800)
                    .sameSite("Lax")
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
        }

        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/shift/unlock")
    public ResponseEntity<LoginResponse> unlockShift(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody com.triagenet.dto.ShiftAuthDto.ShiftUnlockRequest request,
            HttpServletResponse response) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        LoginResponse loginResponse = authService.unlockShift(userDetails.getId(), request);
        boolean isProd = environment != null && environment.acceptsProfiles(Profiles.of("prod", "production"));

        ResponseCookie accessCookie = ResponseCookie.from("triagenet_jwt", loginResponse.getToken())
                .httpOnly(true)
                .secure(isProd)
                .path("/")
                .maxAge(900)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());

        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/shift/lock")
    public ResponseEntity<Map<String, String>> lockShift(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        authService.lockShift(userDetails.getId());
        return ResponseEntity.ok(Map.of("message", "Workstation screen locked"));
    }

    @PostMapping("/shift/end")
    public ResponseEntity<Map<String, String>> endShift(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletResponse response) {
        if (userDetails != null) {
            authService.endShift(userDetails.getId());
        }
        boolean isProd = environment != null && environment.acceptsProfiles(Profiles.of("prod", "production"));

        ResponseCookie accessCookie = ResponseCookie.from("triagenet_jwt", "")
                .httpOnly(true)
                .secure(isProd)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        ResponseCookie refreshCookie = ResponseCookie.from("triagenet_refresh", "")
                .httpOnly(true)
                .secure(isProd)
                .path("/api/auth")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        return ResponseEntity.ok(Map.of("message", "Duty shift ended and session securely wiped"));
    }

    @GetMapping("/shift/status")
    public ResponseEntity<com.triagenet.dto.ShiftAuthDto.ShiftStatusResponse> getShiftStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(authService.getShiftStatus(userDetails.getId()));
    }

    @PostMapping("/recovery/mnemonic")
    public ResponseEntity<Map<String, String>> recoverWithMnemonic(
            @Valid @RequestBody com.triagenet.dto.ShiftAuthDto.MnemonicRecoveryRequest request) {
        authService.recoverWithMnemonic(request);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully via recovery mnemonic. You may now log in."));
    }

    @PostMapping("/recovery/backup-code")
    public ResponseEntity<Map<String, String>> recoverWithBackupCode(
            @Valid @RequestBody com.triagenet.dto.ShiftAuthDto.BackupCodeRecoveryRequest request) {
        authService.recoverWithBackupCode(request);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully via emergency backup code."));
    }

    @PostMapping("/recovery/cmo-escrow")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('DISTRICT_CMO', 'SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<Map<String, String>> approveCmoEscrow(
            @AuthenticationPrincipal CustomUserDetails approver,
            @Valid @RequestBody com.triagenet.dto.ShiftAuthDto.CmoEscrowApprovalRequest request) {
        String emergencyToken = authService.approveCmoEscrow(approver, request);
        return ResponseEntity.ok(Map.of(
                "message", "Emergency 15-minute shift bypass token issued",
                "emergencyToken", emergencyToken
        ));
    }

    @GetMapping("/status/{staffId}")
    public ResponseEntity<com.triagenet.dto.ShiftAuthDto.StaffStatusDto> getStaffStatus(
            @PathVariable String staffId) {
        return ResponseEntity.ok(authService.getStaffStatus(staffId));
    }
}
