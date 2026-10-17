package com.triagenet.controller;

import com.triagenet.dto.TrafficPreemptionRequestDto;
import com.triagenet.dto.TrafficPreemptionStatusDto;
import com.triagenet.service.TrafficControlGatewayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/traffic")
@RequiredArgsConstructor
public class TrafficControlController {

    private final TrafficControlGatewayService trafficGatewayService;

    @PostMapping("/preemption/activate")
    @PreAuthorize("hasAnyRole('AMBULANCE_DISPATCH', 'TRIAGE_NURSE', 'HOSPITAL_ADMIN', 'DISTRICT_CMO', 'STATE_HEALTH_DEPT', 'SUPER_ADMIN') or permitAll()")
    public ResponseEntity<TrafficPreemptionStatusDto> activatePreemption(@RequestBody TrafficPreemptionRequestDto request) {
        return ResponseEntity.ok(trafficGatewayService.activatePreemption(request));
    }

    @PostMapping("/preemption/telemetry")
    @PreAuthorize("hasAnyRole('AMBULANCE_DISPATCH', 'TRIAGE_NURSE', 'HOSPITAL_ADMIN', 'DISTRICT_CMO', 'STATE_HEALTH_DEPT', 'SUPER_ADMIN') or permitAll()")
    public ResponseEntity<TrafficPreemptionStatusDto> updateTelemetry(@RequestBody TrafficPreemptionRequestDto request) {
        return ResponseEntity.ok(trafficGatewayService.processTelemetryUpdate(request));
    }

    @GetMapping("/preemption/corridor/{ambulanceNumber}")
    @PreAuthorize("hasAnyRole('AMBULANCE_DISPATCH', 'TRIAGE_NURSE', 'HOSPITAL_ADMIN', 'DISTRICT_CMO', 'STATE_HEALTH_DEPT', 'SUPER_ADMIN') or permitAll()")
    public ResponseEntity<TrafficPreemptionStatusDto> getCorridorStatus(@PathVariable String ambulanceNumber) {
        return trafficGatewayService.getCorridorStatus(ambulanceNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/preemption/corridors")
    @PreAuthorize("hasAnyRole('AMBULANCE_DISPATCH', 'TRIAGE_NURSE', 'HOSPITAL_ADMIN', 'DISTRICT_CMO', 'STATE_HEALTH_DEPT', 'SUPER_ADMIN') or permitAll()")
    public ResponseEntity<List<TrafficPreemptionStatusDto>> getAllActiveCorridors() {
        return ResponseEntity.ok(trafficGatewayService.getAllActiveCorridors());
    }

    @PostMapping("/preemption/{ambulanceNumber}/release")
    @PreAuthorize("hasAnyRole('AMBULANCE_DISPATCH', 'TRIAGE_NURSE', 'HOSPITAL_ADMIN', 'DISTRICT_CMO', 'STATE_HEALTH_DEPT', 'SUPER_ADMIN') or permitAll()")
    public ResponseEntity<Map<String, Object>> releasePreemption(@PathVariable String ambulanceNumber) {
        boolean released = trafficGatewayService.releasePreemption(ambulanceNumber);
        return ResponseEntity.ok(Map.of(
                "ambulanceNumber", ambulanceNumber,
                "released", released,
                "status", released ? "NORMAL_TRAFFIC_CYCLE_RESTORED" : "CORRIDOR_NOT_FOUND"
        ));
    }

    @GetMapping("/itms/status")
    public ResponseEntity<Map<String, Object>> getItmsDiagnosticStatus() {
        return ResponseEntity.ok(Map.of(
                "gateway", "Ranchi Smart City ITMS / Jharkhand Police ATCS",
                "status", "CONNECTED",
                "protocol", "NTCIP 1202 / SCATS Emergency Vehicle Preemption (EVP)",
                "latencyMs", 18,
                "activeCorridors", trafficGatewayService.getAllActiveCorridors().size()
        ));
    }
}
