package com.triagenet.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.triagenet.dto.LoginRequest;
import com.triagenet.dto.LoginResponse;
import com.triagenet.dto.RegisterRequest;
import com.triagenet.entity.RoleName;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Complete Auth Flow: Register -> Login -> Fetch Current User Profile via JWT")
    void testAuthFlow() throws Exception {
        // 1. Register
        RegisterRequest registerReq = RegisterRequest.builder()
                .name("Dr. Alice Smith")
                .email("alice.smith@triagenet.org")
                .password("SecurePassword123!")
                .role(RoleName.HOSPITAL_ADMIN)
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("alice.smith@triagenet.org"))
                // V1 fix: public registration always yields HOSPITAL_STAFF,
                // regardless of any requested role.
                .andExpect(jsonPath("$.role").value("HOSPITAL_STAFF"));

        // 2. Login
        LoginRequest loginReq = LoginRequest.builder()
                .email("alice.smith@triagenet.org")
                .password("SecurePassword123!")
                .build();

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.type").value("Bearer"))
                .andReturn();

        String responseStr = loginResult.getResponse().getContentAsString();
        LoginResponse loginResponse = objectMapper.readValue(responseStr, LoginResponse.class);
        String token = loginResponse.getToken();

        assertThat(token).isNotBlank();

        // 3. Access protected /api/auth/me using Bearer token
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("alice.smith@triagenet.org"))
                .andExpect(jsonPath("$.name").value("Dr. Alice Smith"))
                // V1 fix: role self-assignment blocked, so account is HOSPITAL_STAFF.
                .andExpect(jsonPath("$.role").value("HOSPITAL_STAFF"));
    }

    @Test
    @DisplayName("Should reject invalid login credentials with 401 Unauthorized")
    void testInvalidLogin() throws Exception {
        LoginRequest invalidReq = LoginRequest.builder()
                .email("nonexistent@triagenet.org")
                .password("wrongpassword")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidReq)))
                .andExpect(status().isUnauthorized());
    }
}
