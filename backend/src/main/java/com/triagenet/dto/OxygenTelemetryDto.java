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
public class OxygenTelemetryDto {
    private UUID hospitalId;
    private Double psaOxygenPurity;
    private Double lmoTankPressureBar;
    private Double flowRateLpm;
    private Double capacityPercent;
}
