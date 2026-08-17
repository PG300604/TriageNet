package com.triagenet.dto;

import com.triagenet.entity.ReferralStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReferralResponse {

    private UUID id;
    private UUID patientId;
    private UUID fromHospitalId;
    private UUID toHospitalId;
    private String dispatchToken;
    private ReferralStatus status;
    private String reason;
    private LocalDateTime requestedAt;
    private LocalDateTime updatedAt;
}
