package com.triagenet.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.triagenet.dto.OxygenTelemetryDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class FuturePhasesIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /api/iot/oxygen-telemetry - Should ingest telemetry with auth")
    @WithMockUser(roles = {"SUPER_ADMIN"})
    public void testIngestTelemetry() throws Exception {
        OxygenTelemetryDto dto = OxygenTelemetryDto.builder()
                .hospitalId(UUID.randomUUID())
                .psaOxygenPurity(94.5)
                .lmoTankPressureBar(4.6)
                .flowRateLpm(180.0)
                .capacityPercent(78.0)
                .build();
        mockMvc.perform(post("/api/iot/oxygen-telemetry")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("GET /api/iot/oxygen-telemetry/hospital/{hospitalId} - Should return telemetry for hospital")
    @WithMockUser(roles = {"TRIAGE_NURSE"})
    public void testGetLatestForHospital() throws Exception {
        UUID hospitalId = UUID.randomUUID();
        mockMvc.perform(get("/api/iot/oxygen-telemetry/hospital/" + hospitalId))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("GET /api/iot/oxygen-telemetry/alerts - Should return active alerts")
    @WithMockUser(roles = {"DISTRICT_CMO"})
    public void testGetActiveAlerts() throws Exception {
        mockMvc.perform(get("/api/iot/oxygen-telemetry/alerts"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("POST /api/abdm/verify-abha - Should verify ABHA number")
    @WithMockUser(roles = {"TRIAGE_NURSE"})
    public void testVerifyAbha() throws Exception {
        mockMvc.perform(post("/api/abdm/verify-abha")
                        .param("abhaNumber", "12-3456-7890-1234"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/abdm/patient/{abhaNumber} - Should lookup patient by ABHA")
    @WithMockUser(roles = {"HOSPITAL_ADMIN"})
    public void testLookupPatient() throws Exception {
        mockMvc.perform(get("/api/abdm/patient/12-3456-7890-1234"))
                .andExpect(status().isOk());
    }
}
