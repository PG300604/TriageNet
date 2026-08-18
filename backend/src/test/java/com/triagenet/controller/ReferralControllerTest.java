package com.triagenet.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.triagenet.dto.LoginRequest;
import com.triagenet.dto.LoginResponse;
import com.triagenet.dto.RegisterRequest;
import com.triagenet.dto.ReferralRequest;
import com.triagenet.dto.ReferralStatusUpdate;
import com.triagenet.entity.ReferralStatus;
import com.triagenet.entity.ResourceType;
import com.triagenet.entity.RoleName;
import com.triagenet.repository.RoleRepository;
import com.triagenet.repository.StaffUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ReferralControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private StaffUserRepository staffUserRepository;

    @Autowired
    private RoleRepository roleRepository;

    private String ambulanceToken;
    private String hospitalAdminToken;
    private String unauthorizedToken;
    private UUID patientId;
    private UUID fromHospitalId;
    private UUID toHospitalId;

    @Autowired
    private com.triagenet.repository.PatientRepository patientRepository;

    @Autowired
    private com.triagenet.repository.TransferRequestRepository transferRequestRepository;

    @BeforeEach
    void setUp() throws Exception {
        // Clean up from previous test method
        transferRequestRepository.deleteAll();
        patientRepository.deleteAll();
        staffUserRepository.deleteAll();
        roleRepository.deleteAll();

        // Create a real patient in DB
        com.triagenet.entity.Patient savedPatient = patientRepository.save(com.triagenet.entity.Patient.builder()
                .hospitalId(UUID.randomUUID())
                .name("Ramesh Kumar")
                .age(45)
                .presentingComplaint("Acute Respiratory Distress")
                .status(com.triagenet.entity.PatientStatus.WAITING)
                .heartRate(110.0)
                .systolicBp(95.0)
                .spo2(86.0)
                .bloodType("O+")
                .requiredSpecialty("Pulmonology")
                .build());

        patientId = savedPatient.getId();
        fromHospitalId = savedPatient.getHospitalId();
        toHospitalId = UUID.randomUUID();

        // Register & login AMBULANCE_DISPATCH user
        RegisterRequest dispatchReg = RegisterRequest.builder()
                .name("Dispatch Officer")
                .email("dispatch@triagenet.org")
                .password("DispatchPass123!")
                .role(RoleName.AMBULANCE_DISPATCH)
                .build();
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dispatchReg)))
                .andExpect(status().isCreated());
        ambulanceToken = login("dispatch@triagenet.org", "DispatchPass123!");

        // Register & login HOSPITAL_ADMIN user
        RegisterRequest adminReg = RegisterRequest.builder()
                .name("Hospital Admin")
                .email("admin@triagenet.org")
                .password("AdminPass123!")
                .role(RoleName.HOSPITAL_ADMIN)
                .build();
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminReg)))
                .andExpect(status().isCreated());
        hospitalAdminToken = login("admin@triagenet.org", "AdminPass123!");

        // Register & login TRIAGE_NURSE user (unauthorized for referrals)
        RegisterRequest nurseReg = RegisterRequest.builder()
                .name("Triage Nurse")
                .email("nurse@triagenet.org")
                .password("NursePass123!")
                .role(RoleName.TRIAGE_NURSE)
                .build();
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(nurseReg)))
                .andExpect(status().isCreated());
        unauthorizedToken = login("nurse@triagenet.org", "NursePass123!");
    }

    @Test
    @DisplayName("POST /api/referrals - Create referral with AMBULANCE_DISPATCH role returns 201 and dispatch token")
    void testCreateReferralWithValidRole() throws Exception {
        ReferralRequest request = ReferralRequest.builder()
                .patientId(patientId)
                .originHospitalId(fromHospitalId)
                .targetHospitalId(toHospitalId)
                .reason("ICU Bed required - patient in respiratory distress")
                .resourceType(ResourceType.ICU_BED)
                .urgencyLevel("CRITICAL")
                .build();

        mockMvc.perform(post("/api/referrals")
                        .header("Authorization", "Bearer " + ambulanceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.dispatchToken", matchesPattern("^#JH-108-DISPATCH-[A-Z0-9]+$")))
                .andExpect(jsonPath("$.status", is("PENDING")))
                .andExpect(jsonPath("$.patientId", is(patientId.toString())))
                .andExpect(jsonPath("$.fromHospitalId", is(fromHospitalId.toString())))
                .andExpect(jsonPath("$.toHospitalId", is(toHospitalId.toString())))
                .andExpect(jsonPath("$.reason").exists());
    }

    @Test
    @DisplayName("POST /api/referrals - Unauthorized role (TRIAGE_NURSE) gets 403 Forbidden")
    void testCreateReferralUnauthorized() throws Exception {
        ReferralRequest request = ReferralRequest.builder()
                .patientId(patientId)
                .originHospitalId(fromHospitalId)
                .targetHospitalId(toHospitalId)
                .reason("ICU Bed required")
                .resourceType(ResourceType.ICU_BED)
                .urgencyLevel("HIGH")
                .build();

        mockMvc.perform(post("/api/referrals")
                        .header("Authorization", "Bearer " + unauthorizedToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/referrals/active - Fetch active referrals with valid role returns 200")
    void testGetActiveReferrals() throws Exception {
        // First create a referral
        ReferralRequest request = ReferralRequest.builder()
                .patientId(patientId)
                .originHospitalId(fromHospitalId)
                .targetHospitalId(toHospitalId)
                .reason("Oxygen bed needed")
                .resourceType(ResourceType.OXYGEN_BED)
                .urgencyLevel("MODERATE")
                .build();

        mockMvc.perform(post("/api/referrals")
                        .header("Authorization", "Bearer " + ambulanceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Then fetch active referrals
        mockMvc.perform(get("/api/referrals/active")
                        .header("Authorization", "Bearer " + ambulanceToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[0].status", is("PENDING")))
                .andExpect(jsonPath("$[0].dispatchToken", matchesPattern("^#JH-108-DISPATCH-[A-Z0-9]+$")));
    }

    @Test
    @DisplayName("GET /api/referrals/active - Unauthorized role gets 403")
    void testGetActiveReferralsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/referrals/active")
                        .header("Authorization", "Bearer " + unauthorizedToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("PUT /api/referrals/{id}/status - Full lifecycle: PENDING -> IN_TRANSIT -> COMPLETED")
    void testUpdateReferralStatusLifecycle() throws Exception {
        // Create referral
        ReferralRequest request = ReferralRequest.builder()
                .patientId(patientId)
                .originHospitalId(fromHospitalId)
                .targetHospitalId(toHospitalId)
                .reason("Ventilator needed for severe respiratory failure")
                .resourceType(ResourceType.VENTILATOR)
                .urgencyLevel("CRITICAL")
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/referrals")
                        .header("Authorization", "Bearer " + ambulanceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        String createResponse = createResult.getResponse().getContentAsString();
        UUID referralId = UUID.fromString(objectMapper.readTree(createResponse).get("id").asText());

        // Step 1: Update to IN_TRANSIT
        ReferralStatusUpdate inTransit = ReferralStatusUpdate.builder()
                .status(ReferralStatus.IN_TRANSIT)
                .notes("Ambulance dispatched, en route to target hospital")
                .build();

        mockMvc.perform(put("/api/referrals/" + referralId + "/status")
                        .header("Authorization", "Bearer " + ambulanceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inTransit)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("IN_TRANSIT")))
                .andExpect(jsonPath("$.id", is(referralId.toString())));

        // Step 2: Update to COMPLETED
        ReferralStatusUpdate completed = ReferralStatusUpdate.builder()
                .status(ReferralStatus.COMPLETED)
                .notes("Patient arrived and admitted to ICU")
                .build();

        mockMvc.perform(put("/api/referrals/" + referralId + "/status")
                        .header("Authorization", "Bearer " + ambulanceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(completed)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("COMPLETED")))
                .andExpect(jsonPath("$.id", is(referralId.toString())));
    }

    @Test
    @DisplayName("PUT /api/referrals/{id}/status - Unauthorized role gets 403")
    void testUpdateStatusUnauthorized() throws Exception {
        // Create referral first
        ReferralRequest request = ReferralRequest.builder()
                .patientId(patientId)
                .originHospitalId(fromHospitalId)
                .targetHospitalId(toHospitalId)
                .reason("Test referral")
                .resourceType(ResourceType.BED)
                .urgencyLevel("LOW")
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/referrals")
                        .header("Authorization", "Bearer " + ambulanceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        UUID referralId = UUID.fromString(objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asText());

        ReferralStatusUpdate update = ReferralStatusUpdate.builder()
                .status(ReferralStatus.COMPLETED)
                .notes("Done")
                .build();

        mockMvc.perform(put("/api/referrals/" + referralId + "/status")
                        .header("Authorization", "Bearer " + unauthorizedToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /api/referrals - HOSPITAL_ADMIN role can also create referrals")
    void testCreateReferralWithHospitalAdminRole() throws Exception {
        ReferralRequest request = ReferralRequest.builder()
                .patientId(patientId)
                .originHospitalId(fromHospitalId)
                .targetHospitalId(toHospitalId)
                .reason("Transfer from overflow bed")
                .resourceType(ResourceType.BED)
                .urgencyLevel("MODERATE")
                .build();

        mockMvc.perform(post("/api/referrals")
                        .header("Authorization", "Bearer " + hospitalAdminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("PENDING")));
    }

    private String login(String email, String password) throws Exception {
        LoginRequest loginReq = LoginRequest.builder()
                .email(email)
                .password(password)
                .build();

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn();

        String responseStr = result.getResponse().getContentAsString();
        LoginResponse loginResponse = objectMapper.readValue(responseStr, LoginResponse.class);
        return loginResponse.getToken();
    }
}
