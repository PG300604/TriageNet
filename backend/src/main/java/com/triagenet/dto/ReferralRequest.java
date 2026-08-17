package com.triagenet.dto;

import com.triagenet.entity.ResourceType;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReferralRequest {

    @NotNull(message = "Patient ID is required")
    private UUID patientId;

    @NotNull(message = "Origin hospital ID is required")
    private UUID originHospitalId;

    @NotNull(message = "Target hospital ID is required")
    private UUID targetHospitalId;

    @NotNull(message = "Reason is required")
    private String reason;

    @NotNull(message = "Resource type is required")
    private ResourceType resourceType;

    @NotNull(message = "Urgency level is required")
    private String urgencyLevel;
}
