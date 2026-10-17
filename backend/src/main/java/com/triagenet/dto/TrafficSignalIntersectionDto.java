package com.triagenet.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrafficSignalIntersectionDto {
    private String signalId;
    private String intersectionName;
    private Double lat;
    private Double lng;
    private Double distanceMeters;
    private Integer etaSeconds;
    private String preemptionStatus; // STANDBY, CLEARING_CROSS_STREETS, GREEN_WAVE_LOCKED, PASSED_AND_RELEASED
    private String mainStreetPhase;  // SOLID_GREEN, FLASHING_YELLOW, RED
    private String crossStreetPhase; // ALL_RED_HOLD, RED_CLEARANCE, NORMAL_CYCLE
    private String vmsMessage;       // Driver warning displayed on overhead electronic gantry
    private Boolean policeOutpostNotified;
    private String policeChowkiName;
}
