package com.triagenet.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.triagenet.dto.LoginRequest;
import com.triagenet.dto.RegisterRequest;
import com.triagenet.entity.Role;
import com.triagenet.entity.RoleName;
import com.triagenet.entity.StaffUser;
import com.triagenet.repository.RefreshTokenRepository;
import com.triagenet.repository.RoleRepository;
import com.triagenet.repository.StaffUserRepository;
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
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminStaffApprovalTest {

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

    @BeforeEach
    void setUp() {
        refreshTokenRepository.deleteAll();
        staffUserRepository.deleteAll();

        // Seed Super Admin
        Role superAdminRole = roleRepository.findByName(RoleName.SUPER_ADMIN)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.SUPER_ADMIN).build()));

        staffUserRepository.save(StaffUser.builder()
                .name("Super Administrator")
                .staffId("JH-SYS-0001")
                .email("superadmin@triagenet.gov.in")
                .passwordHash(passwordEncoder.encode("Admin@123!"))
                .role(superAdminRole)
                .status(StaffUser.UserStatus.ACTIVE)
                .build());
    }

    @Test
    @DisplayName("E2E: Staff Registration -> Pending Verification Lock -> Status Probe -> Admin Approval -> Active Login")
    void testStaffRegistrationAndAdminApprovalWorkflow() throws Exception {
        String staffId = "JH-STF-8012";
        String email = "ananya.verma@rims.gov.in";
        String password = "Password@123!";

        // 1. Self-register with official Staff ID
        RegisterRequest registerReq = RegisterRequest.builder()
                .name("Dr. Ananya Verma")
                .staffId(staffId)
                .email(email)
                .password(password)
                .build();

        MvcResult regResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.staffId").value(staffId))
                .andExpect(jsonPath("$.status").value("PENDING_VERIFICATION"))
                .andExpect(jsonPath("$.totpSecret").isNotEmpty())
                .andExpect(jsonPath("$.recoveryMnemonic").isNotEmpty())
                .andReturn();

        String registeredUserId = objectMapper.readTree(regResult.getResponse().getContentAsString())
                .get("id").asText();

        // 2. Attempt login before admin approval -> MUST BE LOCKED / FORBIDDEN
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(staffId, password))))
                .andExpect(status().isLocked());

        // 3. Public Status Probe by Staff ID (Zero Email / SMS required)
        mockMvc.perform(get("/api/auth/status/" + staffId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.staffId").value(staffId))
                .andExpect(jsonPath("$.status").value("PENDING_VERIFICATION"));

        // 4. Log in as Super Admin
        MvcResult adminLoginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("JH-SYS-0001", "Admin@123!"))))
                .andExpect(status().isOk())
                .andReturn();

        String adminToken = objectMapper.readTree(adminLoginResult.getResponse().getContentAsString())
                .get("token").asText();

        // 5. Admin lists pending staff queue
        mockMvc.perform(get("/api/admin/staff/pending")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].staffId").value(staffId))
                .andExpect(jsonPath("$[0].status").value("PENDING_VERIFICATION"));

        // 6. Admin approves staff member and assigns clinical role
        mockMvc.perform(post("/api/admin/staff/" + registeredUserId + "/approve")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("role", "TRIAGE_NURSE"))))
                .andExpect(status().isOk());

        // 7. Status Probe now shows ACTIVE
        mockMvc.perform(get("/api/auth/status/" + staffId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.role").value("TRIAGE_NURSE"));

        // 8. Staff Member logs in successfully using Staff ID
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(staffId, password))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.staffId").value(staffId))
                .andExpect(jsonPath("$.role").value("TRIAGE_NURSE"));
    }
}
