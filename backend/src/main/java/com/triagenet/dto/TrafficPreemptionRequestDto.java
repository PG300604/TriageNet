package com.triagenet.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrafficPreemptionRequestDto {
    private String ambulanceNumber;
    private UUID destinationHospitalId;
    private String destinationHospitalName;
    private String corridorName;
    private Double currentLat;
    private Double currentLng;
    private Double speedKmph;
    private Double headingDegrees;
    private Double acuityScore;
    private String priorityTier; // CODE_RED_CRITICAL, URGENT_TRAUMA, STANDARD
    private String patientCondition;
}
