package com.triagenet.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrafficPreemptionStatusDto {
    private String corridorId;
    private String ambulanceNumber;
    private Boolean active;
    private String preemptionMode; // AUTOMATIC_ITMS_V2X
    private String itmsProvider;   // e.g. "Ranchi Smart City ITMS Gateway v3.1 / Jharkhand Police ATCS"
    private Long handshakeLatencyMs;
    private Integer totalSignalsInCorridor;
    private Integer signalsPreemptedGreen;
    private Double trafficDelayClearedMinutes;
    private Double corridorSpeedKmph;
    private String activeVmsAlert;
    private List<TrafficSignalIntersectionDto> upcomingIntersections;
    private List<String> policeUnitsAlerted;
    private LocalDateTime lastTelemetrySyncAt;
}
