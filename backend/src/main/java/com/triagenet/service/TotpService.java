package com.triagenet.service;

import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;

/**
 * Pure Java implementation of RFC 6238 TOTP (Time-Based One-Time Password Algorithm)
 * using HMAC-SHA1 and standard Base32 encoding.
 *
 * Provides offline, self-hosted cryptographic 2FA without any external third-party services.
 */
@Service
public class TotpService {

    private static final String HMAC_ALGO = "HmacSHA1";
    private static final int TIME_STEP_SECONDS = 30;
    private static final int DIGITS = 6;
    private static final int MODULUS = 1_000_000;
    private static final String BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Generates a cryptographically secure 160-bit (20-byte) Base32 secret key.
     */
    public String generateSecret() {
        byte[] buffer = new byte[20];
        secureRandom.nextBytes(buffer);
        return encodeBase32(buffer);
    }

    /**
     * Formats the otpauth URI for QR code generation in authenticator apps.
     */
    public String generateQrUri(String email, String secret) {
        String encodedIssuer = URLEncoder.encode("TriageNet State Health", StandardCharsets.UTF_8);
        String encodedEmail = URLEncoder.encode(email, StandardCharsets.UTF_8);
        return String.format("otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=%d&period=%d",
                encodedIssuer, encodedEmail, secret, encodedIssuer, DIGITS, TIME_STEP_SECONDS);
    }

    /**
     * Validates a 6-digit TOTP code against the secret key with a ±1 time step tolerance (±30 seconds).
     */
    public boolean validateCode(String base32Secret, String inputCode) {
        if (base32Secret == null || inputCode == null || inputCode.trim().length() != DIGITS) {
            return false;
        }

        try {
            int code = Integer.parseInt(inputCode.trim());
            byte[] keyBytes = decodeBase32(base32Secret.trim().toUpperCase());
            long currentStep = System.currentTimeMillis() / 1000L / TIME_STEP_SECONDS;

            // Check step -1, 0, and +1 to tolerate minor clock drift between server and phone
            for (int window = -1; window <= 1; window++) {
                int expectedCode = generateCodeForStep(keyBytes, currentStep + window);
                if (expectedCode == code) {
                    return true;
                }
            }
        } catch (Exception e) {
            return false;
        }

        return false;
    }

    /**
     * Calculates the TOTP code for a specific time step counter using HMAC-SHA1.
     */
    public int generateCodeForStep(byte[] key, long step) throws Exception {
        byte[] counterBytes = ByteBuffer.allocate(8).putLong(step).array();

        Mac mac = Mac.getInstance(HMAC_ALGO);
        mac.init(new SecretKeySpec(key, HMAC_ALGO));
        byte[] hash = mac.doFinal(counterBytes);

        // Dynamic truncation (RFC 6238 / RFC 4226)
        int offset = hash[hash.length - 1] & 0x0F;
        int binary = ((hash[offset] & 0x7F) << 24)
                | ((hash[offset + 1] & 0xFF) << 16)
                | ((hash[offset + 2] & 0xFF) << 8)
                | (hash[offset + 3] & 0xFF);

        return binary % MODULUS;
    }

    /**
     * Standard RFC 4648 Base32 encoder.
     */
    public static String encodeBase32(byte[] data) {
        StringBuilder sb = new StringBuilder((data.length * 8 + 4) / 5);
        int buffer = 0;
        int bitsLeft = 0;

        for (byte b : data) {
            buffer = (buffer << 8) | (b & 0xFF);
            bitsLeft += 8;
            while (bitsLeft >= 5) {
                bitsLeft -= 5;
                int index = (buffer >> bitsLeft) & 0x1F;
                sb.append(BASE32_CHARS.charAt(index));
            }
        }

        if (bitsLeft > 0) {
            int index = (buffer << (5 - bitsLeft)) & 0x1F;
            sb.append(BASE32_CHARS.charAt(index));
        }

        return sb.toString();
    }

    /**
     * Standard RFC 4648 Base32 decoder.
     */
    public static byte[] decodeBase32(String base32) {
        String sanitized = base32.replaceAll("[^A-Z2-7]", "");
        byte[] out = new byte[sanitized.length() * 5 / 8];
        int buffer = 0;
        int bitsLeft = 0;
        int count = 0;

        for (char c : sanitized.toCharArray()) {
            int val = BASE32_CHARS.indexOf(c);
            if (val < 0) continue;
            buffer = (buffer << 5) | val;
            bitsLeft += 5;
            if (bitsLeft >= 8) {
                bitsLeft -= 8;
                out[count++] = (byte) ((buffer >> bitsLeft) & 0xFF);
            }
        }

        if (count < out.length) {
            byte[] exact = new byte[count];
            System.arraycopy(out, 0, exact, 0, count);
            return exact;
        }

        return out;
    }
}
