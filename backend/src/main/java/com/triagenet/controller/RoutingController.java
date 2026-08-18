package com.triagenet.controller;

import com.triagenet.engine.SeverityScorer;
import com.triagenet.entity.Hospital;
import com.triagenet.repository.HospitalRepository;
import com.triagenet.service.SpatialRoutingService;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/routing")
@RequiredArgsConstructor
public class RoutingController {

    private final HospitalRepository hospitalRepository;
    private final SpatialRoutingService spatialRoutingService;
    private final SeverityScorer severityScorer;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OptimalRoutingRequest {
        private double originLat;
        private double originLng;
        private SeverityScorer.ClinicalVitals vitals;
        private String preferredDistrict;
        private boolean requiresIcu;
        private boolean requiresVentilator;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OptimalRoutingResponse {
        private SeverityScorer.SeverityResult patientSeverity;
        private int totalCandidateHospitals;
        private List<SpatialRoutingService.HospitalDistanceEstimate> recommendedHospitals;
        private SpatialRoutingService.HospitalDistanceEstimate topChoice;
    }

    @PostMapping("/optimal")
    public ResponseEntity<OptimalRoutingResponse> findOptimalHospital(@RequestBody OptimalRoutingRequest req) {
        List<Hospital> candidates = hospitalRepository.findAll();

        if (req.getPreferredDistrict() != null && !req.getPreferredDistrict().isEmpty()) {
            List<Hospital> districtFiltered = candidates.stream()
                    .filter(h -> req.getPreferredDistrict().equalsIgnoreCase(h.getDistrictName()))
                    .collect(Collectors.toList());
            if (!districtFiltered.isEmpty()) {
                candidates = districtFiltered;
            }
        }

        SeverityScorer.SeverityResult severity = req.getVitals() != null ?
                severityScorer.computeSeverity(req.getVitals()) :
                SeverityScorer.SeverityResult.builder().score(50.0).riskTier("MODERATE_RISK").build();

        boolean icuNeeded = req.isRequiresIcu() || severity.getScore() >= 80.0;
        boolean ventNeeded = req.isRequiresVentilator() || severity.isSepsisWarning();

        List<SpatialRoutingService.HospitalDistanceEstimate> ranked = spatialRoutingService.rankHospitalsForPatient(
                req.getOriginLat(),
                req.getOriginLng(),
                (int) severity.getScore(),
                icuNeeded,
                ventNeeded,
                candidates
        );

        OptimalRoutingResponse resp = OptimalRoutingResponse.builder()
                .patientSeverity(severity)
                .totalCandidateHospitals(candidates.size())
                .recommendedHospitals(ranked)
                .topChoice(ranked.isEmpty() ? null : ranked.get(0))
                .build();

        return ResponseEntity.ok(resp);
    }

    @GetMapping("/matrix/{districtName}")
    @PreAuthorize("hasAnyRole('AMBULANCE_DISPATCH', 'TRIAGE_NURSE', 'HOSPITAL_ADMIN', 'DISTRICT_CMO', 'STATE_HEALTH_DEPT', 'SUPER_ADMIN', 'REGIONAL_COORDINATOR')")
    public ResponseEntity<?> getDistrictDistanceMatrix(@PathVariable String districtName) {
        List<Hospital> dHospitals = hospitalRepository.findAll().stream()
                .filter(h -> districtName.equalsIgnoreCase(h.getDistrictName()))
                .collect(Collectors.toList());

        List<Map<String, Object>> matrix = new ArrayList<>();
        for (Hospital h1 : dHospitals) {
            for (Hospital h2 : dHospitals) {
                if (!h1.getId().equals(h2.getId())) {
                    double distKm = spatialRoutingService.calculateHaversineDistanceKm(
                            h1.getLat(), h1.getLng(), h2.getLat(), h2.getLng());
                    double timeMins = spatialRoutingService.estimateTravelMinutes(distKm, false);

                    Map<String, Object> edge = new HashMap<>();
                    edge.put("fromHospital", h1.getName());
                    edge.put("toHospital", h2.getName());
                    edge.put("distanceKm", distKm);
                    edge.put("travelMinutes", timeMins);
                    matrix.add(edge);
                }
            }
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("districtName", districtName);
        resp.put("hospitalCount", dHospitals.size());
        resp.put("edges", matrix);
        return ResponseEntity.ok(resp);
    }
}
