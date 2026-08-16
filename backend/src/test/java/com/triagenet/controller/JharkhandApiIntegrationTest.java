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
public class JharkhandApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("GET /api/dashboard/state-overview - Should return 24 districts and 111 Jharkhand hospitals")
    public void testGetStateOverview() throws Exception {
        mockMvc.perform(get("/api/dashboard/state-overview"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stateName", is("Jharkhand")))
                .andExpect(jsonPath("$.stateCode", is("JH")))
                .andExpect(jsonPath("$.totalDistricts", is(24)))
                .andExpect(jsonPath("$.totalHospitals", is(111)))
                .andExpect(jsonPath("$.totalGeneralBeds", greaterThan(5000)))
                .andExpect(jsonPath("$.totalIcuBeds", greaterThan(500)))
                .andExpect(jsonPath("$.districts", hasSize(24)));
    }

    @Test
    @DisplayName("GET /api/dashboard/district/Ranchi - Should return Ranchi district telemetry and hospital nodes")
    public void testGetRanchiDistrictDetails() throws Exception {
        mockMvc.perform(get("/api/dashboard/district/Ranchi"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.district.name", is("Ranchi")))
                .andExpect(jsonPath("$.facilityCount", greaterThanOrEqualTo(5)))
                .andExpect(jsonPath("$.hospitals[*].name", hasItem(containsString("Rajendra Institute of Medical Sciences"))));
    }

    @Test
    @DisplayName("POST /api/patients/score-vitals - Should return HIGH_RISK and sepsis alert for critical vitals")
    public void testScoreVitalsCritical() throws Exception {
        SeverityScorer.ClinicalVitals criticalVitals = SeverityScorer.ClinicalVitals.builder()
                .spo2(82.0)
                .heartRate(135.0)
                .systolicBp(85.0)
                .temperature(39.5)
                .respRate(32.0)
                .age(68)
                .build();

        mockMvc.perform(post("/api/patients/score-vitals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(criticalVitals)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.riskTier", is("HIGH_RISK")))
                .andExpect(jsonPath("$.sepsisWarning", is(true)))
                .andExpect(jsonPath("$.score", greaterThanOrEqualTo(80.0)));
    }

    @Test
    @DisplayName("GET /api/hospitals - Should return all seeded Jharkhand hospitals with facility tier")
    public void testGetAllHospitals() throws Exception {
        mockMvc.perform(get("/api/hospitals"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(111)))
                .andExpect(jsonPath("$[0].districtName", notNullValue()))
                .andExpect(jsonPath("$[0].facilityTier", notNullValue()));
    }
}

