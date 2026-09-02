package com.triagenet.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.triagenet.engine.SeverityScorer;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class RoutingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private com.triagenet.repository.HospitalRepository hospitalRepository;

    @Autowired
    private com.triagenet.service.HospitalSeedService hospitalSeedService;

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        if (hospitalRepository.count() == 0) {
            hospitalSeedService.seedJharkhandData();
        }
    }

    @Test
    @DisplayName("POST /api/routing/optimal - Should return ranked hospital recommendations with travel time and suitability score")
    public void testFindOptimalHospital() throws Exception {
        RoutingController.OptimalRoutingRequest req = RoutingController.OptimalRoutingRequest.builder()
                .originLat(23.2500)
                .originLng(85.2000)
                .preferredDistrict("Ranchi")
                .vitals(SeverityScorer.ClinicalVitals.builder()
                        .spo2(88.0)
                        .heartRate(120.0)
                        .systolicBp(100.0)
                        .age(55)
                        .build())
                .requiresIcu(true)
                .build();

        mockMvc.perform(post("/api/routing/optimal")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.recommendedHospitals", notNullValue()))
                .andExpect(jsonPath("$.topChoice", notNullValue()))
                .andExpect(jsonPath("$.topChoice.estimatedMinutes", greaterThan(0.0)))
                .andExpect(jsonPath("$.topChoice.distanceKm", greaterThanOrEqualTo(0.0)))
                .andExpect(jsonPath("$.topChoice.suitabilityScore", greaterThan(0.0)));
    }

    @Test
    @DisplayName("GET /api/routing/matrix/Ranchi - Should return spatial distance matrix for Ranchi hospitals")
    @org.springframework.security.test.context.support.WithMockUser(roles = {"DISTRICT_CMO"})
    public void testGetDistrictMatrix() throws Exception {
        mockMvc.perform(get("/api/routing/matrix/Ranchi"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.districtName", is("Ranchi")))
                .andExpect(jsonPath("$.hospitalCount", greaterThanOrEqualTo(2)))
                .andExpect(jsonPath("$.edges", notNullValue()));
    }
}
