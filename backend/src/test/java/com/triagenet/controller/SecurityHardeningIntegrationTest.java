package com.triagenet.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.triagenet.dto.LoginRequest;
import com.triagenet.dto.RegisterRequest;
import com.triagenet.entity.Role;
import com.triagenet.entity.RoleName;
import com.triagenet.entity.StaffUser;
import com.triagenet.repository.RoleRepository;
import com.triagenet.repository.StaffUserRepository;
import com.triagenet.service.LoginAttemptService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class SecurityHardeningIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private StaffUserRepository staffUserRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private LoginAttemptService loginAttemptService;

    private static final String TEST_USER_EMAIL = "doctor.hardening@triagenet.jh.gov.in";
    private static final String TEST_USER_PASS = "SecureAdminPass123!";

    @BeforeEach
    public void setup() {
        loginAttemptService.loginSucceeded(TEST_USER_EMAIL);

        if (!staffUserRepository.existsByEmail(TEST_USER_EMAIL)) {
            Role role = roleRepository.findByName(RoleName.HOSPITAL_ADMIN)
                    .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.HOSPITAL_ADMIN).build()));

            StaffUser user = StaffUser.builder()
                    .name("Dr. Hardened Admin")
                    .email(TEST_USER_EMAIL)
                    .passwordHash(passwordEncoder.encode(TEST_USER_PASS))
                    .role(role)
                    .build();
            staffUserRepository.save(user);
        }
    }

    @Test
    @DisplayName("Brute Force Lockout - Should return 423 LOCKED after 5 consecutive failed login attempts")
    public void testBruteForceAccountLockout() throws Exception {
        LoginRequest badRequest = LoginRequest.builder()
                .email(TEST_USER_EMAIL)
                .password("WrongPassword123!")
                .build();

        // 4 failed attempts should return 401 Unauthorized
        for (int i = 1; i <= 4; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(badRequest)))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.error", is("Unauthorized")));
        }

        // 5th failed attempt should trigger lockout
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badRequest)))
                .andExpect(status().isUnauthorized());

        // 6th attempt should now be blocked and return 423 LOCKED
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badRequest)))
                .andExpect(status().isLocked())
                .andExpect(jsonPath("$.error", is("Account Locked")))
                .andExpect(jsonPath("$.message", containsString("temporarily locked")));

        // Reset lock for subsequent tests
        loginAttemptService.loginSucceeded(TEST_USER_EMAIL);
    }

    @Test
    @DisplayName("Successful Login - Should return valid JWT and reset failed login counter")
    public void testSuccessfulLoginResetsCounter() throws Exception {
        LoginRequest badRequest = LoginRequest.builder()
                .email(TEST_USER_EMAIL)
                .password("WrongPass123!")
                .build();

        // 4 failed attempts before login
        for (int i = 1; i <= 4; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(badRequest)))
                    .andExpect(status().isUnauthorized());
        }

        // Valid login request
        LoginRequest validRequest = LoginRequest.builder()
                .email(TEST_USER_EMAIL)
                .password(TEST_USER_PASS)
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.type", is("Bearer")))
                .andExpect(jsonPath("$.email", is(TEST_USER_EMAIL)));

        // 4 failed attempts after valid login (should still be 401 Unauthorized, not 423 Locked)
        for (int i = 1; i <= 4; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(badRequest)))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.error", is("Unauthorized")));
        }

        // Clean up
        loginAttemptService.loginSucceeded(TEST_USER_EMAIL);
    }

    @Test
    @DisplayName("Password Validation - Registration with password < 8 characters should return 400 Validation Failed")
    public void testShortPasswordRejected() throws Exception {
        RegisterRequest shortPassRequest = RegisterRequest.builder()
                .name("Nurse Test")
                .email("nurse.short@triagenet.jh.gov.in")
                .password("short")
                .role(RoleName.TRIAGE_NURSE)
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(shortPassRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", is("Validation Failed")))
                .andExpect(jsonPath("$.fieldErrors.password", containsString("at least 8 characters")));
    }

    @Test
    @DisplayName("RBAC Protection - Triage Nurse role cannot call POST /api/hospitals/seed (403 Forbidden)")
    @WithMockUser(username = "nurse@triagenet.gov.in", roles = {"TRIAGE_NURSE"})
    public void testNurseCannotSeedHospitals() throws Exception {
        mockMvc.perform(post("/api/hospitals/seed"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error", is("Forbidden")));
    }

    @Test
    @DisplayName("RBAC Protection - Super Admin role CAN call POST /api/hospitals/seed (200 OK)")
    @WithMockUser(username = "admin@triagenet.gov.in", roles = {"SUPER_ADMIN"})
    public void testSuperAdminCanSeedHospitals() throws Exception {
        mockMvc.perform(post("/api/hospitals/seed"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("RBAC Protection - Hospital staff cannot access GET /api/resources (403 Forbidden)")
    @WithMockUser(username = "staff@triagenet.gov.in", roles = {"HOSPITAL_STAFF"})
    public void testHospitalStaffCannotGetAllResources() throws Exception {
        mockMvc.perform(get("/api/resources"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error", is("Forbidden")));
    }

    @Test
    @DisplayName("RBAC Protection - Hospital staff cannot access GET /api/routing/matrix/Ranchi (403 Forbidden)")
    @WithMockUser(username = "staff@triagenet.gov.in", roles = {"HOSPITAL_STAFF"})
    public void testHospitalStaffCannotGetDistrictMatrix() throws Exception {
        mockMvc.perform(get("/api/routing/matrix/Ranchi"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error", is("Forbidden")));
    }

    @Test
    @DisplayName("RBAC Protection - Hospital staff cannot step simulation time (403 Forbidden)")
    @WithMockUser(username = "staff@triagenet.gov.in", roles = {"HOSPITAL_STAFF"})
    public void testHospitalStaffCannotStepSimulationTime() throws Exception {
        mockMvc.perform(post("/api/triage-queue/" + UUID.randomUUID() + "/step-time?minutes=5.0"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("RBAC Protection - Hospital staff cannot access referral recommendations (403 Forbidden)")
    @WithMockUser(username = "staff@triagenet.gov.in", roles = {"HOSPITAL_STAFF"})
    public void testHospitalStaffCannotGetReferralRecommendation() throws Exception {
        mockMvc.perform(get("/api/triage-queue/referral-recommendation"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("RBAC Protection - Hospital staff cannot execute referrals (403 Forbidden)")
    @WithMockUser(username = "staff@triagenet.gov.in", roles = {"HOSPITAL_STAFF"})
    public void testHospitalStaffCannotExecuteReferral() throws Exception {
        mockMvc.perform(post("/api/triage-queue/execute-referral?patientId=" + UUID.randomUUID() + "&toHospitalId=" + UUID.randomUUID()))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("RBAC Protection - Resource transfer requires appropriate admin role (403 Forbidden)")
    @WithMockUser(username = "guest@triagenet.gov.in", roles = {"HOSPITAL_STAFF"})
    public void testHospitalStaffCannotTransferSupplies() throws Exception {
        ResourceController.TransferSupplyRequest req = ResourceController.TransferSupplyRequest.builder()
                .fromHospitalId(UUID.randomUUID())
                .toHospitalId(UUID.randomUUID())
                .resourceType("VENTILATOR")
                .quantity(2)
                .build();

        mockMvc.perform(post("/api/resources/transfer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Lockout Preservation - Active account lockout must survive eviction of un-locked failed attempt records")
    public void testLockedAccountPreservedDuringEviction() throws Exception {
        String targetLockedUser = "dr.lockout.preserve@triagenet.gov.in";

        // Trigger 5 failed attempts to lock target user
        for (int i = 0; i < 5; i++) {
            loginAttemptService.loginFailed(targetLockedUser);
        }
        org.junit.jupiter.api.Assertions.assertTrue(loginAttemptService.isBlocked(targetLockedUser));

        // Generate un-locked failed attempts from other users
        for (int i = 0; i < 10; i++) {
            loginAttemptService.loginFailed("random.user." + i + "@triagenet.gov.in");
        }

        // Verify target locked account is still blocked and protected
        org.junit.jupiter.api.Assertions.assertTrue(loginAttemptService.isBlocked(targetLockedUser));
        loginAttemptService.loginSucceeded(targetLockedUser);
    }
}
