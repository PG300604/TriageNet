package com.triagenet.service;

import com.triagenet.dto.OxygenTelemetryDto;
import com.triagenet.entity.OxygenTelemetry;
import com.triagenet.repository.OxygenTelemetryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OxygenTelemetryService {
    private final OxygenTelemetryRepository repository;

    @Transactional
    public OxygenTelemetry recordTelemetry(OxygenTelemetryDto dto) {
        boolean isCritical = (dto.getLmoTankPressureBar() != null && dto.getLmoTankPressureBar() < 4.2)
                || (dto.getPsaOxygenPurity() != null && dto.getPsaOxygenPurity() < 90.0);
        boolean isWarning = !isCritical && ((dto.getLmoTankPressureBar() != null && dto.getLmoTankPressureBar() < 4.5)
                || (dto.getPsaOxygenPurity() != null && dto.getPsaOxygenPurity() < 93.0));

        String severity = isCritical ? "CRITICAL" : (isWarning ? "WARNING" : "NORMAL");
        boolean alert = isCritical || isWarning;

        OxygenTelemetry telemetry = OxygenTelemetry.builder()
                .hospitalId(dto.getHospitalId())
                .psaOxygenPurity(dto.getPsaOxygenPurity() != null ? dto.getPsaOxygenPurity() : 94.0)
                .lmoTankPressureBar(dto.getLmoTankPressureBar() != null ? dto.getLmoTankPressureBar() : 4.8)
                .flowRateLpm(dto.getFlowRateLpm() != null ? dto.getFlowRateLpm() : 150.0)
                .capacityPercent(dto.getCapacityPercent() != null ? dto.getCapacityPercent() : 80.0)
                .alertTriggered(alert)
                .alertSeverity(severity)
                .build();

        return repository.save(telemetry);
    }

    @Transactional(readOnly = true)
    public Optional<OxygenTelemetry> getLatestTelemetry(UUID hospitalId) {
        return repository.findFirstByHospitalIdOrderByRecordedAtDesc(hospitalId);
    }

    @Transactional(readOnly = true)
    public List<OxygenTelemetry> getActiveAlerts() {
        return repository.findByAlertTriggeredTrueOrderByRecordedAtDesc();
    }
}
