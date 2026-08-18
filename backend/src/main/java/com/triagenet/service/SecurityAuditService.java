package com.triagenet.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;

@Service
@Slf4j
public class SecurityAuditService {

    public enum SecurityEventType {
        AUTH_LOGIN_SUCCESS,
        AUTH_LOGIN_FAILURE,
        AUTH_ACCOUNT_LOCKED,
        AUTH_REGISTER_SUCCESS,
        REFERRAL_DISPATCH_CREATED,
        REFERRAL_STATUS_UPDATED,
        RESOURCE_TRANSFER_EXECUTED,
        PATIENT_REGISTERED,
        PATIENT_DISCHARGED,
        ACCESS_DENIED
    }

    public void logEvent(SecurityEventType eventType, String userEmail, String resource, String details) {
        String sanitizedUser = maskAndSanitizeUser(userEmail);
        String sanitizedResource = sanitize(resource, "N/A");
        String sanitizedDetails = sanitize(details, "");

        log.info("[SECURITY AUDIT] timestamp=\"{}\" event=\"{}\" user=\"{}\" resource=\"{}\" details=\"{}\"",
                Instant.now(),
                eventType.name(),
                sanitizedUser,
                sanitizedResource,
                sanitizedDetails
        );
    }

    private String sanitize(String input, String defaultValue) {
        if (input == null || input.isBlank()) {
            return defaultValue;
        }
        // Escape backslashes and double quotes, and remove CR/LF/control characters to prevent log forging (CWE-117)
        return input.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replaceAll("[\\r\\n\\t]", "_")
                .replaceAll("[^\\x20-\\x7E]", "?");
    }

    private String maskAndSanitizeUser(String email) {
        if (email == null || email.isBlank()) {
            return "ANONYMOUS";
        }
        String clean = sanitize(email.trim(), "ANONYMOUS");
        int atIdx = clean.indexOf('@');
        if (atIdx > 1) {
            return clean.charAt(0) + "***" + clean.substring(atIdx);
        } else if (atIdx == 1) {
            return clean.charAt(0) + "***" + clean.substring(atIdx);
        }
        return clean.length() > 2 ? clean.substring(0, 2) + "***" : "***";
    }
}
