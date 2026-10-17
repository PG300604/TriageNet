package com.triagenet.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.triagenet.config.CustomUserDetails;
import com.triagenet.dto.LoginRequest;
import com.triagenet.entity.*;
import com.triagenet.repository.HospitalRepository;
import com.triagenet.repository.PatientRepository;
import com.triagenet.repository.ResourceRepository;
import com.triagenet.repository.StaffUserRepository;
import com.triagenet.service.AuthService;
import com.triagenet.util.JwtUtil;
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
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ResourceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AuthService authService;

    @Autowired
    private HospitalRepository hospitalRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private StaffUserRepository staffUserRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private String superAdminToken;
    private Hospital testHospital;

    @BeforeEach
    void setUp() throws Exception {
        authService.seedOfficialCommandAccounts();
        StaffUser admin = staffUserRepository.findByStaffId("JH-SYS-0001")
                .orElseThrow(() -> new IllegalStateException("JH-SYS-0001 not found"));
        superAdminToken = jwtUtil.generateToken(new CustomUserDetails(admin));

        testHospital = hospitalRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> hospitalRepository.save(Hospital.builder()
                        .name("Test Base Hospital")
                        .shortCode("TBH")
                        .districtName("Ranchi")
                        .facilityTier("DISTRICT")
                        .totalBeds(50)
                        .totalIcuBeds(10)
                        .totalVentilators(5)
                        .lat(23.3441)
                        .lng(85.3096)
                        .build()));

        resourceRepository.save(Resource.builder()
                .hospitalId(testHospital.getId())
                .type(ResourceType.BED)
                .status(ResourceStatus.AVAILABLE)
                .subtype("General Bed 1")
                .build());

        resourceRepository.save(Resource.builder()
                .hospitalId(testHospital.getId())
                .type(ResourceType.VENTILATOR)
                .status(ResourceStatus.AVAILABLE)
                .subtype("Servo-air Ventilator 1")
                .build());
    }

    @Test
    @DisplayName("GET /api/resources - Should return resources list for authorized user")
    void testGetAllResources() throws Exception {
        mockMvc.perform(get("/api/resources")
                        .header("Authorization", "Bearer " + superAdminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", isA(java.util.List.class)));
    }

    @Test
    @DisplayName("GET /api/resources/hospital/{hospitalId} - Should return hospital-scoped resources")
    void testGetResourcesByHospital() throws Exception {
        mockMvc.perform(get("/api/resources/hospital/" + testHospital.getId())
                        .header("Authorization", "Bearer " + superAdminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", isA(java.util.List.class)))
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("POST /api/resources/assign/{hospitalId} - Should compute Hungarian resource matching")
    void testAssignResources() throws Exception {
        patientRepository.save(Patient.builder()
                .hospitalId(testHospital.getId())
                .name("Resource Match Patient")
                .age(42)
                .presentingComplaint("Acute respiratory distress with low SpO2")
                .status(PatientStatus.WAITING)
                .heartRate(115.0)
                .spo2(86.0)
                .systolicBp(110.0)
                .build());

        mockMvc.perform(post("/api/resources/assign/" + testHospital.getId())
                        .header("Authorization", "Bearer " + superAdminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", isA(java.util.List.class)))
                .andExpect(jsonPath("$[0].patientName", is("Resource Match Patient")))
                .andExpect(jsonPath("$[0].matched", is(true)));
    }

    @Test
    @DisplayName("POST /api/resources/transfer - Rejects invalid quantity")
    void testTransferSupplyInvalidQuantity() throws Exception {
        ResourceController.TransferSupplyRequest request = ResourceController.TransferSupplyRequest.builder()
                .fromHospitalId(testHospital.getId())
                .toHospitalId(UUID.randomUUID())
                .resourceType("VENTILATOR")
                .quantity(-5)
                .build();

        mockMvc.perform(post("/api/resources/transfer")
                        .header("Authorization", "Bearer " + superAdminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
