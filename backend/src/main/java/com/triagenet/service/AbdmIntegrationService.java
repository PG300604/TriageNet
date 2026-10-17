package com.triagenet.service;

import com.triagenet.dto.AbdmProfileDto;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AbdmIntegrationService {
    private final Map<String, AbdmProfileDto> mockRegistry = new ConcurrentHashMap<>();

    public AbdmIntegrationService() {
        mockRegistry.put("12-3456-7890-1234", AbdmProfileDto.builder()
                .abhaNumber("12-3456-7890-1234")
                .abhaAddress("birsa.munda@abdm")
                .fullName("Birsa Munda")
                .gender("MALE")
                .dateOfBirth("1988-11-15")
                .bloodGroup("O_POSITIVE")
                .allergies(List.of("Penicillin", "Sulfa Drugs"))
                .chronicConditions(List.of("Hypertension", "Type 2 Diabetes"))
                .emergencyContact("+91-98351-99882")
                .verified(true)
                .build());
    }

    public AbdmProfileDto verifyAndLookupAbha(String abhaNumber) {
        String clean = abhaNumber != null ? abhaNumber.replace("-", "").trim() : "";
        if (clean.length() != 14 && (abhaNumber == null || !abhaNumber.contains("-"))) {
            throw new IllegalArgumentException("Invalid ABHA number format. Must be 14 digits.");
        }
        for (Map.Entry<String, AbdmProfileDto> entry : mockRegistry.entrySet()) {
            if (entry.getKey().replace("-", "").equals(clean)) {
                return entry.getValue();
            }
        }
        return AbdmProfileDto.builder()
                .abhaNumber(abhaNumber)
                .abhaAddress("citizen." + clean.substring(0, Math.min(6, clean.length())) + "@abdm")
                .fullName("Jharkhand Verified Citizen")
                .gender("NOT_SPECIFIED")
                .dateOfBirth("1990-01-01")
                .bloodGroup("B_POSITIVE")
                .allergies(List.of("None Declared"))
                .chronicConditions(List.of())
                .emergencyContact("+91-108")
                .verified(true)
                .build();
    }
}
