package com.triagenet.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.triagenet.dto.LoginRequest;
import com.triagenet.dto.RegisterRequest;
import com.triagenet.dto.ShiftAuthDto;
import com.triagenet.entity.StaffUser;
import com.triagenet.repository.RefreshTokenRepository;
import com.triagenet.repository.ShiftSessionRepository;
import com.triagenet.repository.StaffUserRepository;
import com.triagenet.service.TotpService;
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

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ShiftSessionIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private StaffUserRepository staffUserRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private ShiftSessionRepository shiftSessionRepository;

    @Autowired
    private TotpService totpService;

    @BeforeEach
    void setUp() {
        shiftSessionRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        staffUserRepository.deleteAll();
    }

    @Test
    @DisplayName("Comprehensive E2E: 2FA Setup -> Challenge Login -> 8h Shift -> Quick Lock/PIN Unlock -> Mnemonic Recovery")
    void testFull2faAndClinicalShiftLifecycle() throws Exception {
        String email = "dr.ananya@rims.gov.in";
        String password = "Password@123!";

        // 1. Register staff user
        RegisterRequest registerReq = RegisterRequest.builder()
                .name("Dr. Ananya Verma")
                .email(email)
                .password(password)
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated());

        staffUserRepository.findByEmail(email).ifPresent(u -> {
            u.setStatus(StaffUser.UserStatus.ACTIVE);
            staffUserRepository.save(u);
        });

        // 2. Initial Login (no 2FA yet)
        LoginRequest loginReq = new LoginRequest(email, password);
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.twoFactorRequired").value(false))
                .andReturn();

        String responseBody = loginResult.getResponse().getContentAsString();
        String initialToken = objectMapper.readTree(responseBody).get("token").asText();

        // 3. Setup 2FA
        MvcResult setupResult = mockMvc.perform(post("/api/auth/2fa/setup")
                        .header("Authorization", "Bearer " + initialToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.secret").isNotEmpty())
                .andExpect(jsonPath("$.recoveryMnemonic").isNotEmpty())
                .andExpect(jsonPath("$.backupCodes").isArray())
                .andReturn();

        ShiftAuthDto.TwoFactorSetupResponse setupResp = objectMapper.readValue(
                setupResult.getResponse().getContentAsString(),
                ShiftAuthDto.TwoFactorSetupResponse.class
        );

        String secret = setupResp.getSecret();
        String mnemonic = setupResp.getRecoveryMnemonic();

        // 4. Confirm 2FA setup with valid TOTP code
        byte[] keyBytes = TotpService.decodeBase32(secret);
        long currentStep = System.currentTimeMillis() / 1000L / 30L;
        int codeInt = totpService.generateCodeForStep(keyBytes, currentStep);
        String codeStr = String.format("%06d", codeInt);

        mockMvc.perform(post("/api/auth/2fa/confirm-setup")
                        .header("Authorization", "Bearer " + initialToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ShiftAuthDto.TwoFactorConfirmRequest(codeStr))))
                .andExpect(status().isOk());

        // 5. Subsequent Login: Now requires 2FA!
        MvcResult challengedResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.twoFactorRequired").value(true))
                .andExpect(jsonPath("$.challengeToken").isNotEmpty())
                .andReturn();

        String challengeToken = objectMapper.readTree(challengedResult.getResponse().getContentAsString())
                .get("challengeToken").asText();

        // 6. Verify 2FA & Establish 8-hour Shift Session with PIN "4321"
        ShiftAuthDto.TwoFactorVerifyRequest verifyReq = new ShiftAuthDto.TwoFactorVerifyRequest(
                challengeToken,
                codeStr,
                8,
                "4321"
        );

        MvcResult verifiedResult = mockMvc.perform(post("/api/auth/2fa/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(verifyReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shiftActive").value(true))
                .andExpect(jsonPath("$.shiftDurationHours").value(8))
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn();

        String shiftToken = objectMapper.readTree(verifiedResult.getResponse().getContentAsString())
                .get("token").asText();

        // 7. Check Shift Status
        mockMvc.perform(get("/api/auth/shift/status")
                        .header("Authorization", "Bearer " + shiftToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shiftActive").value(true))
                .andExpect(jsonPath("$.locked").value(false))
                .andExpect(jsonPath("$.durationHours").value(8));

        // 8. Lock Workstation Screen
        mockMvc.perform(post("/api/auth/shift/lock")
                        .header("Authorization", "Bearer " + shiftToken))
                .andExpect(status().isOk());

        // 9. Unlock with Wrong PIN -> Fails
        mockMvc.perform(post("/api/auth/shift/unlock")
                        .header("Authorization", "Bearer " + shiftToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ShiftAuthDto.ShiftUnlockRequest("9999"))))
                .andExpect(status().isUnauthorized());

        // 10. Unlock with Correct PIN "4321" -> Succeeds in 1 second!
        mockMvc.perform(post("/api/auth/shift/unlock")
                        .header("Authorization", "Bearer " + shiftToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ShiftAuthDto.ShiftUnlockRequest("4321"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.screenLocked").value(false));

        // 11. End Shift -> Revokes tokens
        mockMvc.perform(post("/api/auth/shift/end")
                        .header("Authorization", "Bearer " + shiftToken))
                .andExpect(status().isOk());

        // 12. Mnemonic Account Recovery without Email
        String newPassword = "NewStrongPass@456!";
        ShiftAuthDto.MnemonicRecoveryRequest recoveryReq = new ShiftAuthDto.MnemonicRecoveryRequest(
                email,
                mnemonic,
                newPassword
        );

        mockMvc.perform(post("/api/auth/recovery/mnemonic")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(recoveryReq)))
                .andExpect(status().isOk());

        // 13. Verify login with recovered new password succeeds!
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(email, newPassword))))
                .andExpect(status().isOk());
    }
}
