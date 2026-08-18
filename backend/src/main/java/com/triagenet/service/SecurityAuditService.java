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
        log.info("[SECURITY AUDIT] timestamp=\"{}\" event=\"{}\" user=\"{}\" resource=\"{}\" details=\"{}\"",
                Instant.now(),
                eventType.name(),
                userEmail != null ? userEmail : "ANONYMOUS",
                resource != null ? resource : "N/A",
                details != null ? details : ""
        );
    }
}
