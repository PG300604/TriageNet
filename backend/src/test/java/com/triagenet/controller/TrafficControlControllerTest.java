package com.triagenet.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.triagenet.dto.TrafficPreemptionRequestDto;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class TrafficControlControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /api/traffic/preemption/activate - Should activate ITMS Green Wave corridor")
    @WithMockUser(roles = {"AMBULANCE_DISPATCH"})
    public void testActivatePreemption() throws Exception {
        TrafficPreemptionRequestDto request = TrafficPreemptionRequestDto.builder()
                .ambulanceNumber("JH-108-TEST-01")
                .destinationHospitalId(UUID.randomUUID())
                .destinationHospitalName("Rajendra Institute of Medical Sciences (RIMS)")
                .corridorName("NH-33 - Booty More - Bariatu Road - RIMS Trauma Corridor")
                .currentLat(23.4795)
                .currentLng(85.4741)
                .speedKmph(75.0)
                .acuityScore(92.0)
                .priorityTier("CODE_RED_CRITICAL")
                .patientCondition("Severe Flail Chest & Hypoxia (SpO2 78%)")
                .build();

        mockMvc.perform(post("/api/traffic/preemption/activate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(true))
                .andExpect(jsonPath("$.ambulanceNumber").value("JH-108-TEST-01"))
                .andExpect(jsonPath("$.preemptionMode").value("AUTOMATIC_ITMS_V2X"))
                .andExpect(jsonPath("$.upcomingIntersections").isArray());
    }

    @Test
    @DisplayName("POST /api/traffic/preemption/telemetry - Should process moving vehicle telemetry")
    @WithMockUser(roles = {"AMBULANCE_DISPATCH"})
    public void testUpdateTelemetry() throws Exception {
        TrafficPreemptionRequestDto telemetry = TrafficPreemptionRequestDto.builder()
                .ambulanceNumber("JH-108-TEST-02")
                .currentLat(23.4012)
                .currentLng(85.3780)
                .speedKmph(72.0)
                .build();

        mockMvc.perform(post("/api/traffic/preemption/telemetry")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(telemetry)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.signalsPreemptedGreen").isNumber());
    }

    @Test
    @DisplayName("GET /api/traffic/preemption/corridor/{ambulanceNumber} - Should retrieve active corridor")
    @WithMockUser(roles = {"TRIAGE_NURSE"})
    public void testGetCorridorStatus() throws Exception {
        TrafficPreemptionRequestDto request = TrafficPreemptionRequestDto.builder()
                .ambulanceNumber("JH-108-TEST-03")
                .currentLat(23.4320)
                .currentLng(85.4380)
                .build();

        mockMvc.perform(post("/api/traffic/preemption/activate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/traffic/preemption/corridor/JH-108-TEST-03"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ambulanceNumber").value("JH-108-TEST-03"));
    }

    @Test
    @DisplayName("POST /api/traffic/preemption/{ambulanceNumber}/release - Should release corridor to normal traffic")
    @WithMockUser(roles = {"AMBULANCE_DISPATCH"})
    public void testReleasePreemption() throws Exception {
        TrafficPreemptionRequestDto request = TrafficPreemptionRequestDto.builder()
                .ambulanceNumber("JH-108-TEST-04")
                .currentLat(23.4320)
                .currentLng(85.4380)
                .build();

        mockMvc.perform(post("/api/traffic/preemption/activate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/traffic/preemption/JH-108-TEST-04/release"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.released").value(true));
    }

    @Test
    @DisplayName("GET /api/traffic/itms/status - Should return ITMS gateway diagnostic status")
    public void testItmsDiagnosticStatus() throws Exception {
        mockMvc.perform(get("/api/traffic/itms/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONNECTED"))
                .andExpect(jsonPath("$.protocol").value("NTCIP 1202 / SCATS Emergency Vehicle Preemption (EVP)"));
    }
}
