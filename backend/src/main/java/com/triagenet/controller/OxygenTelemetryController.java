package com.triagenet.controller;

import com.triagenet.dto.OxygenTelemetryDto;
import com.triagenet.entity.OxygenTelemetry;
import com.triagenet.service.OxygenTelemetryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/iot/oxygen-telemetry")
@RequiredArgsConstructor
public class OxygenTelemetryController {
    private final OxygenTelemetryService telemetryService;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DISTRICT_CMO', 'STATE_HEALTH_DEPT')")
    public ResponseEntity<OxygenTelemetry> ingestTelemetry(@RequestBody OxygenTelemetryDto dto) {
        if (dto.getHospitalId() == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(telemetryService.recordTelemetry(dto));
    }

    @GetMapping("/hospital/{hospitalId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DISTRICT_CMO', 'STATE_HEALTH_DEPT', 'TRIAGE_NURSE') or permitAll()")
    public ResponseEntity<OxygenTelemetry> getLatestForHospital(@PathVariable UUID hospitalId) {
        return telemetryService.getLatestTelemetry(hospitalId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/alerts")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'DISTRICT_CMO', 'STATE_HEALTH_DEPT', 'HOSPITAL_ADMIN') or permitAll()")
    public ResponseEntity<List<OxygenTelemetry>> getActiveAlerts() {
        return ResponseEntity.ok(telemetryService.getActiveAlerts());
    }
}
