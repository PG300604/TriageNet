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

        // SECURITY (V3): reject low-entropy secrets (e.g. repeated characters).
        String compact = secret.trim();
        if (compact.chars().distinct().count() < 16) {
            throw new IllegalStateException("CRITICAL SECURITY ERROR: JWT secret has too little entropy (<16 distinct characters). Generate it with a CSPRNG, e.g. `openssl rand -hex 32`.");
        }
        log.info("JWT Secret successfully validated with {} bits of entropy.", secret.getBytes(StandardCharsets.UTF_8).length * 8);
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
