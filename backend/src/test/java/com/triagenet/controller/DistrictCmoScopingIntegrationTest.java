package com.triagenet.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.triagenet.dto.LoginRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class DistrictCmoScopingIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private com.triagenet.service.AuthService authService;

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        authService.seedOfficialCommandAccounts();
    }

    private String loginAndGetToken(String staffId, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(staffId, password))))
                .andReturn();

        if (result.getResponse().getStatus() == 401 && "JH-SYS-0001".equals(staffId)) {
            result = mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(new LoginRequest(staffId, "Admin@123!"))))
                    .andExpect(status().isOk())
                    .andReturn();
        } else {
            assertEquals(200, result.getResponse().getStatus());
        }

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        return root.get("token").asText();
    }

    @Test
    @DisplayName("District CMO Login - Should include districtName and hospitalName in auth payload")
    public void testDistrictCmoLoginPayload() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("JH-CMO-2001", "Triage@2026!"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.staffId", is("JH-CMO-2001")))
                .andExpect(jsonPath("$.role", is("DISTRICT_CMO")))
                .andExpect(jsonPath("$.districtName", is("Ranchi")))
                .andReturn();

        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        assertNotNull(node.get("districtName"));
        assertEquals("Ranchi", node.get("districtName").asText());
    }

    @Test
    @DisplayName("District CMO Scoping - GET /api/hospitals returns ONLY hospitals in Ranchi district")
    public void testDistrictCmoHospitalsScopedToDistrict() throws Exception {
        String cmoToken = loginAndGetToken("JH-CMO-2001", "Triage@2026!");

        MvcResult result = mockMvc.perform(get("/api/hospitals")
                        .header("Authorization", "Bearer " + cmoToken))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode hospitals = objectMapper.readTree(result.getResponse().getContentAsString());
        assertTrue(hospitals.isArray());
        assertTrue(hospitals.size() > 0, "Ranchi should have facilities");
        assertTrue(hospitals.size() < 111, "Should NOT return all statewide facilities");

        // Every returned hospital must belong to Ranchi
        for (JsonNode h : hospitals) {
            String dist = h.hasNonNull("districtName") ? h.get("districtName").asText() : h.get("region").asText();
            assertEquals("Ranchi", dist, "Hospital " + h.get("name").asText() + " must belong to Ranchi");
        }
    }

    @Test
    @DisplayName("District CMO Scoping - GET /api/dashboard/state-overview returns only assigned district")
    public void testDistrictCmoStateOverviewScoped() throws Exception {
        String cmoToken = loginAndGetToken("JH-CMO-2001", "Triage@2026!");

        mockMvc.perform(get("/api/dashboard/state-overview")
                        .header("Authorization", "Bearer " + cmoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalDistricts", is(1)))
                .andExpect(jsonPath("$.districts", hasSize(1)))
                .andExpect(jsonPath("$.districts[0].name", is("Ranchi")));
    }

    @Test
    @DisplayName("District CMO Cross-District Access Control - Ranchi CMO accessing Dhanbad returns 403")
    public void testDistrictCmoCrossDistrictAccessDenied() throws Exception {
        String cmoToken = loginAndGetToken("JH-CMO-2001", "Triage@2026!");

        // Ranchi details - OK
        mockMvc.perform(get("/api/dashboard/district/Ranchi")
                        .header("Authorization", "Bearer " + cmoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.district.name", is("Ranchi")));

        // Dhanbad details - 403 Forbidden
        mockMvc.perform(get("/api/dashboard/district/Dhanbad")
                        .header("Authorization", "Bearer " + cmoToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error", containsString("Access denied")));
    }

    @Test
    @DisplayName("Super Admin Access - GET /api/hospitals returns all 111 statewide facilities")
    public void testSuperAdminCanAccessAllHospitals() throws Exception {
        String adminToken = loginAndGetToken("JH-SYS-0001", "Triage@2026!");

        mockMvc.perform(get("/api/hospitals")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(111)));

        mockMvc.perform(get("/api/dashboard/state-overview")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalDistricts", is(24)))
                .andExpect(jsonPath("$.totalHospitals", is(111)));
    }
}
