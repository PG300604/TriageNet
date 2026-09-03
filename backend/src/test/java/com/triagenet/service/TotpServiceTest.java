package com.triagenet.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TotpServiceTest {

    private TotpService totpService;

    @BeforeEach
    void setUp() {
        totpService = new TotpService();
    }

    @Test
    @DisplayName("Should generate valid Base32 secret key")
    void testGenerateSecret() {
        String secret = totpService.generateSecret();
        assertNotNull(secret);
        assertTrue(secret.length() >= 32);
        assertTrue(secret.matches("^[A-Z2-7]+$"), "Secret must be valid RFC 4648 Base32");
    }

    @Test
    @DisplayName("Should generate valid otpauth URI for QR code apps")
    void testGenerateQrUri() {
        String secret = totpService.generateSecret();
        String uri = totpService.generateQrUri("nurse.ananya@rims.gov.in", secret);

        assertNotNull(uri);
        assertTrue(uri.startsWith("otpauth://totp/"));
        assertTrue(uri.contains("secret=" + secret));
        assertTrue(uri.contains("issuer=TriageNet"));
    }

    @Test
    @DisplayName("Should validate current TOTP code generated for secret")
    void testValidateCodeCurrentWindow() throws Exception {
        String secret = totpService.generateSecret();
        byte[] keyBytes = TotpService.decodeBase32(secret);
        long currentStep = System.currentTimeMillis() / 1000L / 30L;

        int codeInt = totpService.generateCodeForStep(keyBytes, currentStep);
        String codeStr = String.format("%06d", codeInt);

        assertTrue(totpService.validateCode(secret, codeStr));
    }

    @Test
    @DisplayName("Should validate code within ±1 step clock drift tolerance")
    void testValidateCodeWithClockDrift() throws Exception {
        String secret = totpService.generateSecret();
        byte[] keyBytes = TotpService.decodeBase32(secret);
        long currentStep = System.currentTimeMillis() / 1000L / 30L;

        // Step -1 (30s in the past)
        int pastCode = totpService.generateCodeForStep(keyBytes, currentStep - 1);
        assertTrue(totpService.validateCode(secret, String.format("%06d", pastCode)));

        // Step +1 (30s in the future)
        int futureCode = totpService.generateCodeForStep(keyBytes, currentStep + 1);
        assertTrue(totpService.validateCode(secret, String.format("%06d", futureCode)));

        // Step +5 (far outside window) -> MUST FAIL
        int invalidCode = totpService.generateCodeForStep(keyBytes, currentStep + 5);
        assertFalse(totpService.validateCode(secret, String.format("%06d", invalidCode)));
    }

    @Test
    @DisplayName("Should reject invalid or malformed codes")
    void testRejectMalformedCode() {
        String secret = totpService.generateSecret();
        assertFalse(totpService.validateCode(secret, "123"));
        assertFalse(totpService.validateCode(secret, "abcdef"));
        assertFalse(totpService.validateCode(secret, null));
        assertFalse(totpService.validateCode(null, "123456"));
    }
}
