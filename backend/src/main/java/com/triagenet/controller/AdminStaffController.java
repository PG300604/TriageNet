package com.triagenet.controller;

import com.triagenet.config.CustomUserDetails;
import com.triagenet.dto.ShiftAuthDto;
import com.triagenet.entity.RoleName;
import com.triagenet.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/staff")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('HOSPITAL_ADMIN', 'DISTRICT_CMO', 'SUPER_ADMIN')")
public class AdminStaffController {

    private final AuthService authService;

    @GetMapping("/pending")
    public ResponseEntity<List<ShiftAuthDto.PendingStaffDto>> getPendingStaff(
            @AuthenticationPrincipal CustomUserDetails adminUser) {
        return ResponseEntity.ok(authService.getPendingStaff(adminUser));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Map<String, String>> approveStaff(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails adminUser) {
        RoleName assignedRole = null;
        if (body != null && body.containsKey("role") && !body.get("role").isBlank()) {
            try {
                assignedRole = RoleName.valueOf(body.get("role").trim());
            } catch (IllegalArgumentException ignored) {}
        }
        authService.approveStaff(id, assignedRole, adminUser);
        return ResponseEntity.ok(Map.of("message", "Staff account successfully verified and granted active status."));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Map<String, String>> rejectStaff(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails adminUser) {
        authService.rejectStaff(id, adminUser);
        return ResponseEntity.ok(Map.of("message", "Staff account registration rejected."));
    }
}
