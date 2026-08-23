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

import jakarta.servlet.http.Cookie;
import org.springframework.http.HttpHeaders;
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

    @Autowired
    private com.triagenet.repository.LoginAttemptRepository loginAttemptRepository;

    private static final String TEST_USER_EMAIL = "doctor.hardening@triagenet.jh.gov.in";
    private static final String TEST_USER_PASS = "SecureAdminPass123!";

    @BeforeEach
    public void setup() {
        loginAttemptService.loginSucceeded(TEST_USER_EMAIL, "127.0.0.1");

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
    @DisplayName("Brute Force Lockout - Should return 423 LOCKED after 5 consecutive failed login attempts & persist to DB")
    public void testBruteForceAccountLockout() throws Exception {
        LoginRequest badRequest = LoginRequest.builder()
                .email(TEST_USER_EMAIL)
                .password("WrongPass123!")
                .build();

        // 4 failed attempts should return 401 UNAUTHORIZED
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

        // Verify Database Persistence
        var persistedLock = loginAttemptRepository.findByEmailIgnoreCase(TEST_USER_EMAIL);
        org.junit.jupiter.api.Assertions.assertTrue(persistedLock.isPresent(), "Lockout record must be persisted in database");
        org.junit.jupiter.api.Assertions.assertTrue(persistedLock.get().getAttemptCount() >= 5);
        org.junit.jupiter.api.Assertions.assertNotNull(persistedLock.get().getLockExpiresAt());

        // Reset lock for subsequent tests
        loginAttemptService.loginSucceeded(TEST_USER_EMAIL, "127.0.0.1");
    }

    @Test
    @DisplayName("Database Lockout Recovery - isBlocked should recover lockout state directly from database on cache miss")
    public void testDatabaseLockoutRecovery() throws Exception {
        String testEmail = "db.lockout@triagenet.jh.gov.in";
        loginAttemptService.loginSucceeded(testEmail);

        // Record 5 failed attempts
        for (int i = 0; i < 5; i++) {
            loginAttemptService.loginFailed(testEmail);
        }

        org.junit.jupiter.api.Assertions.assertTrue(loginAttemptService.isBlocked(testEmail));

        // Re-initialize service (simulating application restart)
        loginAttemptService.init();

        // Lockout must persist across restart
        org.junit.jupiter.api.Assertions.assertTrue(loginAttemptService.isBlocked(testEmail),
                "Lockout must persist across service restart via database repository");

        // Successful login clears DB record
        loginAttemptService.loginSucceeded(testEmail);
        org.junit.jupiter.api.Assertions.assertFalse(loginAttemptRepository.findByEmailIgnoreCase(testEmail).isPresent());
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
        loginAttemptService.loginSucceeded(TEST_USER_EMAIL, "127.0.0.1");
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
                .andExpect(jsonPath("$.error", is("Validation Failed")));
    }

    @Test
    @DisplayName("Password Complexity - Registration without uppercase letter should return 400 Validation Failed")
    public void testPasswordMissingUppercaseRejected() throws Exception {
        RegisterRequest req = RegisterRequest.builder()
                .name("Nurse Test")
                .email("nurse.noupper@triagenet.jh.gov.in")
                .password("lowercase123!")
                .role(RoleName.TRIAGE_NURSE)
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", is("Validation Failed")))
                .andExpect(jsonPath("$.fieldErrors.password", containsString("one uppercase letter")));
    }

    @Test
    @DisplayName("Password Complexity - Registration without lowercase letter should return 400 Validation Failed")
    public void testPasswordMissingLowercaseRejected() throws Exception {
        RegisterRequest req = RegisterRequest.builder()
                .name("Nurse Test")
                .email("nurse.nolower@triagenet.jh.gov.in")
                .password("UPPERCASE123!")
                .role(RoleName.TRIAGE_NURSE)
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", is("Validation Failed")))
                .andExpect(jsonPath("$.fieldErrors.password", containsString("one lowercase letter")));
    }

    @Test
    @DisplayName("Password Complexity - Registration without digit should return 400 Validation Failed")
    public void testPasswordMissingDigitRejected() throws Exception {
        RegisterRequest req = RegisterRequest.builder()
                .name("Nurse Test")
                .email("nurse.nodigit@triagenet.jh.gov.in")
                .password("SecurePassword!")
                .role(RoleName.TRIAGE_NURSE)
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", is("Validation Failed")))
                .andExpect(jsonPath("$.fieldErrors.password", containsString("one digit")));
    }

    @Test
    @DisplayName("Password Complexity - Registration without special character should return 400 Validation Failed")
    public void testPasswordMissingSpecialCharRejected() throws Exception {
        RegisterRequest req = RegisterRequest.builder()
                .name("Nurse Test")
                .email("nurse.nospecial@triagenet.jh.gov.in")
                .password("SecurePassword123")
                .role(RoleName.TRIAGE_NURSE)
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", is("Validation Failed")))
                .andExpect(jsonPath("$.fieldErrors.password", containsString("one special character")));
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
            loginAttemptService.loginFailed(targetLockedUser, null);
        }
        org.junit.jupiter.api.Assertions.assertTrue(loginAttemptService.isBlocked(targetLockedUser, null));

        // Generate un-locked failed attempts from other users
        for (int i = 0; i < 10; i++) {
            loginAttemptService.loginFailed("random.user." + i + "@triagenet.gov.in", "198.51.100." + i);
        }

        // Verify target locked account is still blocked and protected
        org.junit.jupiter.api.Assertions.assertTrue(loginAttemptService.isBlocked(targetLockedUser, null));
        loginAttemptService.loginSucceeded(targetLockedUser, "127.0.0.1");
    }

    @Test
    @DisplayName("Cookie Auth - Login should set HttpOnly SameSite=Lax JWT cookie")
    public void testLoginSetsHttpOnlySameSiteCookie() throws Exception {
        LoginRequest validRequest = LoginRequest.builder()
                .email(TEST_USER_EMAIL)
                .password(TEST_USER_PASS)
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.SET_COOKIE, allOf(
                        containsString("triagenet_jwt="),
                        containsString("HttpOnly"),
                        containsString("Path=/"),
                        containsString("SameSite=Lax")
                )));
    }

    @Test
    @DisplayName("Cookie Auth - Logout should clear triagenet_jwt cookie with Max-Age=0")
    public void testLogoutClearsCookie() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Logged out successfully")))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, allOf(
                        containsString("triagenet_jwt="),
                        containsString("Max-Age=0")
                )));
    }

    @Test
    @DisplayName("Cookie Auth - Request with valid triagenet_jwt Cookie authenticates successfully without Authorization header")
    public void testCookieBasedAuthenticationToProtectedEndpoint() throws Exception {
        LoginRequest validRequest = LoginRequest.builder()
                .email(TEST_USER_EMAIL)
                .password(TEST_USER_PASS)
                .build();

        String responseStr = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        com.fasterxml.jackson.databind.JsonNode root = objectMapper.readTree(responseStr);
        String jwtToken = root.get("token").asText();

        // Perform GET /api/auth/me passing ONLY cookie (no Authorization header)
        mockMvc.perform(get("/api/auth/me")
                        .cookie(new Cookie("triagenet_jwt", jwtToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is(TEST_USER_EMAIL)))
                .andExpect(jsonPath("$.name", is("Dr. Hardened Admin")));
    }
}
