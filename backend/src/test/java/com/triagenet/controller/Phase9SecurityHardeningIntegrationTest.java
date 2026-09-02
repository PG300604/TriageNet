package com.triagenet.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.triagenet.dto.LoginRequest;
import com.triagenet.entity.Role;
import com.triagenet.entity.RoleName;
import com.triagenet.entity.StaffUser;
import com.triagenet.repository.RefreshTokenRepository;
import com.triagenet.repository.RoleRepository;
import com.triagenet.repository.StaffUserRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class Phase9SecurityHardeningIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private StaffUserRepository staffUserRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final String TEST_EMAIL = "p9test@triagenet.org";
    private static final String TEST_PASSWORD = "Password@123!";

    @BeforeEach
    void setUp() {
        refreshTokenRepository.deleteAll();
        staffUserRepository.deleteAll();

        Role adminRole = roleRepository.findByName(RoleName.SUPER_ADMIN)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.SUPER_ADMIN).build()));

        staffUserRepository.save(StaffUser.builder()
                .email(TEST_EMAIL)
                .name("Phase 9 Test Admin")
                .passwordHash(passwordEncoder.encode(TEST_PASSWORD))
                .role(adminRole)
                .build());
    }

    @Test
    @DisplayName("V2: H2 Console must NOT be accessible in test profile")
    public void testH2ConsoleForbiddenInTestProfile() throws Exception {
        mockMvc.perform(get("/h2-console"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("V4: Login issues short-lived JWT and HttpOnly refresh token cookie")
    public void testLoginIssuesRefreshToken() throws Exception {
        LoginRequest req = LoginRequest.builder()
                .email(TEST_EMAIL)
                .password(TEST_PASSWORD)
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("triagenet_jwt"))
                .andExpect(cookie().maxAge("triagenet_jwt", 900)) // 15 minutes
                .andExpect(cookie().exists("triagenet_refresh"))
                .andExpect(cookie().maxAge("triagenet_refresh", 604800)) // 7 days
                .andExpect(cookie().httpOnly("triagenet_refresh", true))
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty());
    }

    @Test
    @DisplayName("V4: POST /api/auth/refresh rotates token and revokes previous refresh token")
    public void testTokenRotationAndRevocation() throws Exception {
        LoginRequest req = LoginRequest.builder()
                .email(TEST_EMAIL)
                .password(TEST_PASSWORD)
                .build();

        String loginBody = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JsonNode loginJson = objectMapper.readTree(loginBody);
        String initialRefreshToken = loginJson.get("refreshToken").asText();
        assertNotNull(initialRefreshToken);

        // 1. Refresh using initial refresh token
        String refreshBody = mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .cookie(new Cookie("triagenet_refresh", initialRefreshToken)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("triagenet_jwt"))
                .andExpect(cookie().exists("triagenet_refresh"))
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andReturn().getResponse().getContentAsString();

        JsonNode refreshJson = objectMapper.readTree(refreshBody);
        String secondRefreshToken = refreshJson.get("refreshToken").asText();

        // 2. Replay attack defense: Reusing the first revoked refresh token must fail
        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .cookie(new Cookie("triagenet_refresh", initialRefreshToken)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("V4: Logout invalidates refresh token")
    public void testLogoutInvalidatesRefreshToken() throws Exception {
        LoginRequest req = LoginRequest.builder()
                .email(TEST_EMAIL)
                .password(TEST_PASSWORD)
                .build();

        String loginBody = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String refreshToken = objectMapper.readTree(loginBody).get("refreshToken").asText();

        // Logout
        mockMvc.perform(post("/api/auth/logout")
                        .cookie(new Cookie("triagenet_refresh", refreshToken)))
                .andExpect(status().isOk())
                .andExpect(cookie().maxAge("triagenet_jwt", 0))
                .andExpect(cookie().maxAge("triagenet_refresh", 0));

        // Subsequent refresh using logged-out token must fail
        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(new Cookie("triagenet_refresh", refreshToken)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("V9: Mutating request with cookie auth requires X-Requested-With or CSRF header")
    public void testCsrfGuardRejectsMissingHeaderForCookieAuth() throws Exception {
        LoginRequest req = LoginRequest.builder()
                .email(TEST_EMAIL)
                .password(TEST_PASSWORD)
                .build();

        String loginBody = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String jwtToken = objectMapper.readTree(loginBody).get("token").asText();

        // Mutating request (POST /api/patients) with cookie and WITHOUT X-Requested-With or X-CSRF-TOKEN
        mockMvc.perform(post("/api/patients")
                        .cookie(new Cookie("triagenet_jwt", jwtToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", containsString("CSRF guard")));

        // Mutating request WITH X-Requested-With header passes CSRF guard
        mockMvc.perform(post("/api/patients")
                        .cookie(new Cookie("triagenet_jwt", jwtToken))
                        .header("X-Requested-With", "XMLHttpRequest")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest()); // reaches controller validation (not 403 CSRF blocked)
    }

    @Test
    @DisplayName("B10: Missing resource returns structured 404 Not Found error response")
    public void testErrorTaxonomyMissingResource() throws Exception {
        LoginRequest req = LoginRequest.builder()
                .email(TEST_EMAIL)
                .password(TEST_PASSWORD)
                .build();

        String loginBody = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String jwtToken = objectMapper.readTree(loginBody).get("token").asText();

        UUID nonExistentPatientId = UUID.randomUUID();
        mockMvc.perform(get("/api/patients/" + nonExistentPatientId)
                        .cookie(new Cookie("triagenet_jwt", jwtToken)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message", containsString("Patient not found")));
    }
}
