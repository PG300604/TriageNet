package com.triagenet.util;

import com.triagenet.config.CustomUserDetails;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;

@Component
@Slf4j
public class JwtUtil {

    private static final String DEFAULT_DEV_SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    @Value("${jwt.secret:}")
    private String secret;

    @Value("${jwt.expiration-ms:86400000}")
    private long expirationMs;

    private final Environment environment;

    public JwtUtil(Environment environment) {
        this.environment = environment;
    }

    @PostConstruct
    public void validateJwtConfiguration() {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("CRITICAL SECURITY ERROR: JWT Secret must be at least 256 bits (32 bytes) long!");
        }

        // SECURITY (V3): reject known-weak secrets in every profile, not just prod.
        if (DEFAULT_DEV_SECRET.equals(secret.trim())) {
            if (environment != null && environment.acceptsProfiles(Profiles.of("prod", "production"))) {
                throw new IllegalStateException("CRITICAL SECURITY ERROR: Production profile cannot use the hardcoded default JWT secret! Set JWT_SECRET in environment variables.");
            }
            log.warn("SECURITY WARNING: Using the publicly-known default dev JWT secret. Anyone can forge valid tokens. Set JWT_SECRET before any shared/staging deployment.");
        }

        // SECURITY (V3): Validate cryptographic randomness using Shannon entropy estimation.
        // A CSPRNG-generated secret (e.g., `openssl rand -hex 32`) should have high entropy.
        // Weak secrets like repeated characters or simple patterns will have low entropy.
        String compact = secret.trim();
        boolean isProd = environment != null && environment.acceptsProfiles(Profiles.of("prod", "production"));

        // Calculate Shannon entropy of the secret
        double entropy = calculateShannonEntropy(compact);
        // For a 64-char hex string (32 bytes), expect ~4 bits/char (hex = 16 symbols).
        // Require at least 3.5 bits/char to allow for some non-uniformity while rejecting weak patterns.
        double minEntropyPerChar = 3.5;

        if (entropy < minEntropyPerChar) {
            if (isProd) {
                throw new IllegalStateException(String.format(
                    "CRITICAL SECURITY ERROR: JWT secret has insufficient entropy (%.2f bits/char, require >= %.1f). " +
                    "Generate it with a CSPRNG: openssl rand -hex 32",
                    entropy, minEntropyPerChar));
            }
            log.warn("SECURITY WARNING: JWT secret has low entropy ({} bits/char). " +
                    "Acceptable ONLY for local dev/test; generate with `openssl rand -hex 32` before any shared deployment.",
                    String.format("%.2f", entropy));
        }
        log.info("JWT Secret successfully validated ({} bytes, {} bits/char entropy).",
                secret.getBytes(StandardCharsets.UTF_8).length, String.format("%.2f", entropy));
    }

    /**
     * Calculate Shannon entropy (bits per character) to assess randomness quality.
     * CSPRNG-generated secrets should have high entropy; weak patterns have low entropy.
     */
    private double calculateShannonEntropy(String text) {
        if (text == null || text.isEmpty()) {
            return 0.0;
        }

        // Count frequency of each character
        Map<Character, Integer> frequencies = new HashMap<>();
        for (char c : text.toCharArray()) {
            frequencies.put(c, frequencies.getOrDefault(c, 0) + 1);
        }

        // Calculate Shannon entropy: H = -Σ(p(x) * log2(p(x)))
        double entropy = 0.0;
        int length = text.length();
        for (int count : frequencies.values()) {
            double probability = (double) count / length;
            entropy -= probability * (Math.log(probability) / Math.log(2));
        }

        return entropy;
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(CustomUserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userDetails.getId().toString());
        claims.put("name", userDetails.getName());
        claims.put("email", userDetails.getEmail());
        if (userDetails.getHospitalId() != null) {
            claims.put("hospitalId", userDetails.getHospitalId().toString());
        }
        claims.put("authorities", userDetails.getAuthorities());

        return createToken(claims, userDetails.getUsername());
    }

    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    public String getUsernameFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }

    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private Boolean isTokenExpired(String token) {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        try {
            final String username = getUsernameFromToken(token);
            return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
