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
        loginAttemptService.loginSucceeded(TEST_USER_EMAIL);
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

    @Test
    @DisplayName("Cache-Control - Authenticated patient endpoint response must include Cache-Control no-store headers")
    public void testAuthenticatedPatientResponseIncludesCacheControlNoStore() throws Exception {
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

        // Perform GET /api/patients with valid authentication
        mockMvc.perform(get("/api/patients")
                        .cookie(new Cookie("triagenet_jwt", jwtToken)))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, allOf(
                        containsString("no-cache"),
                        containsString("no-store"),
                        containsString("max-age=0"),
                        containsString("must-revalidate")
                )))
                .andExpect(header().string(HttpHeaders.PRAGMA, is("no-cache")))
                .andExpect(header().string(HttpHeaders.EXPIRES, is("0")));
    }

    @Autowired
    private com.triagenet.service.AuthService authService;

    @Test
    @DisplayName("Trusted Proxy - clientIpOf extracts X-Forwarded-For only for trusted proxy remoteAddr")
    public void testTrustedProxyIpExtraction() {
        org.springframework.mock.web.MockHttpServletRequest trustedRequest = new org.springframework.mock.web.MockHttpServletRequest();
        trustedRequest.setRemoteAddr("127.0.0.1");
        trustedRequest.addHeader("X-Forwarded-For", "203.0.113.195, 10.0.0.1");

        String extractedIp = authService.clientIpOf(trustedRequest);
        org.junit.jupiter.api.Assertions.assertEquals("203.0.113.195", extractedIp,
                "Must extract real client IP from X-Forwarded-For when request originates from trusted proxy");

        org.springframework.mock.web.MockHttpServletRequest untrustedRequest = new org.springframework.mock.web.MockHttpServletRequest();
        untrustedRequest.setRemoteAddr("198.51.100.22");
        untrustedRequest.addHeader("X-Forwarded-For", "1.2.3.4");

        String untrustedExtractedIp = authService.clientIpOf(untrustedRequest);
        org.junit.jupiter.api.Assertions.assertEquals("198.51.100.22", untrustedExtractedIp,
                "Must ignore forged X-Forwarded-For header when request originates from untrusted remote address");
    }

    @Autowired
    private com.triagenet.service.PatientService patientService;

    @Autowired
    private com.triagenet.repository.HospitalRepository hospitalRepository;

    @Autowired
    private com.triagenet.repository.PatientRepository patientRepository;

    @Test
    @DisplayName("Discharge Flow - Atomic bed reassignment and deterministic waiting patient promotion")
    public void testAtomicDischargeAndWaitingPatientPromotion() {
        com.triagenet.entity.Hospital hospital = hospitalRepository.save(com.triagenet.entity.Hospital.builder()
                .name("Atomic Test Hospital")
                .districtName("Ranchi")
                .facilityTier("DH")
                .region("Central")
                .lat(23.3441)
                .lng(85.3096)
                .totalBeds(10)
                .usedBeds(10)
                .totalVentilators(5)
                .usedVentilators(2)
                .totalSpecialists(8)
                .usedSpecialists(4)
                .build());

        com.triagenet.entity.Patient assignedPatient = patientRepository.save(com.triagenet.entity.Patient.builder()
                .name("Assigned Patient")
                .hospitalId(hospital.getId())
                .age(45)
                .presentingComplaint("Chest Pain")
                .status(com.triagenet.entity.PatientStatus.ASSIGNED)
                .admittedAt(java.time.LocalDateTime.now().minusHours(5))
                .build());

        com.triagenet.entity.Patient waitingPatient1 = patientRepository.save(com.triagenet.entity.Patient.builder()
                .name("First Waiting Patient")
                .hospitalId(hospital.getId())
                .age(32)
                .presentingComplaint("Severe Asthma")
                .status(com.triagenet.entity.PatientStatus.WAITING)
                .admittedAt(java.time.LocalDateTime.now().minusHours(3))
                .build());

        com.triagenet.entity.Patient waitingPatient2 = patientRepository.save(com.triagenet.entity.Patient.builder()
                .name("Second Waiting Patient")
                .hospitalId(hospital.getId())
                .age(28)
                .presentingComplaint("Fever")
                .status(com.triagenet.entity.PatientStatus.WAITING)
                .admittedAt(java.time.LocalDateTime.now().minusHours(1))
                .build());

        // Discharge assigned patient
        com.triagenet.entity.Patient discharged = patientService.dischargePatient(assignedPatient.getId(), "Recovered");
        org.junit.jupiter.api.Assertions.assertEquals(com.triagenet.entity.PatientStatus.DISCHARGED, discharged.getStatus());

        // Verify first waiting patient was atomically promoted to ASSIGNED
        com.triagenet.entity.Patient updatedWaiting1 = patientRepository.findById(waitingPatient1.getId()).orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(com.triagenet.entity.PatientStatus.ASSIGNED, updatedWaiting1.getStatus(),
                "Oldest waiting patient must be transitioned to ASSIGNED");

        // Verify second waiting patient remains WAITING
        com.triagenet.entity.Patient updatedWaiting2 = patientRepository.findById(waitingPatient2.getId()).orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(com.triagenet.entity.PatientStatus.WAITING, updatedWaiting2.getStatus(),
                "Second waiting patient must remain WAITING");

        // Verify hospital usedBeds is accurately 10 (10 - 1 + 1 = 10)
        com.triagenet.entity.Hospital updatedHospital = hospitalRepository.findById(hospital.getId()).orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(10, updatedHospital.getUsedBeds(),
                "Used beds must remain accurately accounted");
    }
}
