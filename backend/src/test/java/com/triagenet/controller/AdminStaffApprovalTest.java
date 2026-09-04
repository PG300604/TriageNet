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

    @Autowired
    private com.triagenet.repository.HospitalRepository hospitalRepository;

    @BeforeEach
    void setUp() {
        refreshTokenRepository.deleteAll();
        staffUserRepository.deleteAll();

        // Seed Super Admin (Tier 1)
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

        // Seed Hospital & Medical Superintendent (Tier 2)
        com.triagenet.entity.Hospital hospital = hospitalRepository.findAll().stream().findFirst().orElse(null);
        if (hospital != null) {
            Role hospAdminRole = roleRepository.findByName(RoleName.HOSPITAL_ADMIN)
                    .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.HOSPITAL_ADMIN).build()));

            staffUserRepository.save(StaffUser.builder()
                    .name("Dr. Medical Superintendent")
                    .staffId("JH-ADM-3001")
                    .email("supt.rims@triagenet.gov.in")
                    .passwordHash(passwordEncoder.encode("Admin@123!"))
                    .role(hospAdminRole)
                    .hospitalId(hospital.getId())
                    .status(StaffUser.UserStatus.ACTIVE)
                    .build());
        }
    }

    @Test
    @DisplayName("Precedence Hierarchy: Super Admin blocked from approving ground staff; Medical Superintendent approves ground staff")
    void testStaffRegistrationAndHierarchicalApprovalWorkflow() throws Exception {
        com.triagenet.entity.Hospital hospital = hospitalRepository.findAll().stream().findFirst().orElseThrow();
        String staffId = "JH-STF-8012";
        String email = "ananya.verma@rims.gov.in";
        String password = "Password@123!";

        // 1. Candidate self-registers requesting ground operational role (TRIAGE_NURSE)
        RegisterRequest registerReq = RegisterRequest.builder()
                .name("Dr. Ananya Verma")
                .staffId(staffId)
                .email(email)
                .password(password)
                .desiredRole("TRIAGE_NURSE")
                .hospitalId(hospital.getId())
                .build();

        MvcResult regResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.staffId").value(staffId))
                .andExpect(jsonPath("$.status").value("PENDING_VERIFICATION"))
                .andReturn();

        String registeredUserId = objectMapper.readTree(regResult.getResponse().getContentAsString())
                .get("id").asText();

        // 2. Candidate login before approval is blocked
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(staffId, password))))
                .andExpect(status().isLocked());

        // 3. Log in as Super Admin (Tier 1)
        MvcResult superAdminLoginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("JH-SYS-0001", "Admin@123!"))))
                .andExpect(status().isOk())
                .andReturn();

        String superAdminToken = objectMapper.readTree(superAdminLoginResult.getResponse().getContentAsString())
                .get("token").asText();

        // 4. Super Admin pending queue excludes ground operational roles (delegated to facility)
        mockMvc.perform(get("/api/admin/staff/pending")
                        .header("Authorization", "Bearer " + superAdminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        // 5. Precedence Enforcement: Super Admin directly approving ground staff MUST BE REJECTED (403 Forbidden)
        mockMvc.perform(post("/api/admin/staff/" + registeredUserId + "/approve")
                        .header("Authorization", "Bearer " + superAdminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("role", "TRIAGE_NURSE"))))
                .andExpect(status().isForbidden());

        // 6. Log in as Medical Superintendent (Tier 2) for this facility
        MvcResult suptLoginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("JH-ADM-3001", "Admin@123!"))))
                .andExpect(status().isOk())
                .andReturn();

        String suptToken = objectMapper.readTree(suptLoginResult.getResponse().getContentAsString())
                .get("token").asText();

        // 7. Medical Superintendent sees candidate in their facility queue
        mockMvc.perform(get("/api/admin/staff/pending")
                        .header("Authorization", "Bearer " + suptToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].staffId").value(staffId))
                .andExpect(jsonPath("$[0].status").value("PENDING_VERIFICATION"));

        // 8. Medical Superintendent successfully approves ground staff member
        mockMvc.perform(post("/api/admin/staff/" + registeredUserId + "/approve")
                        .header("Authorization", "Bearer " + suptToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("role", "TRIAGE_NURSE"))))
                .andExpect(status().isOk());

        // 9. Status Probe now shows ACTIVE
        mockMvc.perform(get("/api/auth/status/" + staffId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.role").value("TRIAGE_NURSE"));

        // 10. Staff Member logs in successfully using Staff ID
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(staffId, password))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.staffId").value(staffId))
                .andExpect(jsonPath("$.role").value("TRIAGE_NURSE"));
    }

    @Test
    @DisplayName("Precedence Hierarchy: Super Admin successfully approves intermediate leadership (District CMO)")
    void testSuperAdminApprovesIntermediateLeadership() throws Exception {
        String staffId = "JH-CMO-9001";
        String email = "cmo.dhanbad@triagenet.gov.in";
        String password = "Password@123!";

        // 1. Self-register requesting intermediate leadership role (DISTRICT_CMO)
        RegisterRequest registerReq = RegisterRequest.builder()
                .name("Dr. Dhanbad CMO")
                .staffId(staffId)
                .email(email)
                .password(password)
                .desiredRole("DISTRICT_CMO")
                .build();

        MvcResult regResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String registeredUserId = objectMapper.readTree(regResult.getResponse().getContentAsString())
                .get("id").asText();

        // 2. Log in as Super Admin
        MvcResult superAdminLoginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("JH-SYS-0001", "Admin@123!"))))
                .andExpect(status().isOk())
                .andReturn();

        String superAdminToken = objectMapper.readTree(superAdminLoginResult.getResponse().getContentAsString())
                .get("token").asText();

        // 3. Super Admin queue contains intermediate leadership applicant
        mockMvc.perform(get("/api/admin/staff/pending")
                        .header("Authorization", "Bearer " + superAdminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].staffId").value(staffId));

        // 4. Super Admin successfully approves intermediate leadership
        mockMvc.perform(post("/api/admin/staff/" + registeredUserId + "/approve")
                        .header("Authorization", "Bearer " + superAdminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("role", "DISTRICT_CMO"))))
                .andExpect(status().isOk());

        // 5. Status Probe confirms ACTIVE and DISTRICT_CMO role
        mockMvc.perform(get("/api/auth/status/" + staffId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.role").value("DISTRICT_CMO"));
    }
}
