package com.triagenet.controller;

import com.triagenet.entity.District;
import com.triagenet.entity.Hospital;
import com.triagenet.repository.DistrictRepository;
import com.triagenet.repository.HospitalRepository;
import com.triagenet.repository.PatientRepository;
import com.triagenet.service.HospitalAuthorizationService;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final HospitalRepository hospitalRepository;
    private final DistrictRepository districtRepository;
    private final PatientRepository patientRepository;
    private final HospitalAuthorizationService hospitalAuthService;

    @Data
    @Builder
    public static class StateOverviewDto {
        private String stateName;
        private String stateCode;
        private long totalDistricts;
        private long totalHospitals;
        private long totalGeneralBeds;
        private long availableGeneralBeds;
        private long totalIcuBeds;
        private long availableIcuBeds;
        private long totalVentilators;
        private double averageCapacityUtilization;
        private List<DistrictSummaryDto> districts;
    }

    @Data
    @Builder
    public static class DistrictSummaryDto {
        private UUID id;
        private String name;
        private String cmoName;
        private String cmoPhone;
        private int hospitalCount;
        private int totalBeds;
        private int availableBeds;
        private int icuTotal;
        private int icuAvailable;
    }

    @GetMapping("/state-overview")
    public ResponseEntity<StateOverviewDto> getStateOverview() {
        // Multi-tenant: only show hospitals the user can access
        Set<UUID> authorizedHospitalIds = hospitalAuthService.getAuthorizedHospitalIds();
        List<Hospital> hospitals = hospitalRepository.findAll().stream()
                .filter(h -> authorizedHospitalIds.isEmpty() || authorizedHospitalIds.contains(h.getId()))
                .toList();
        
        List<District> districts = districtRepository.findAll().stream()
                .filter(d -> hospitals.stream().anyMatch(h -> d.getName().equalsIgnoreCase(h.getDistrictName()) || d.getName().equalsIgnoreCase(h.getRegion())))
                .toList();

        long totalGen = hospitals.stream().mapToLong(h -> h.getTotalGeneralBeds() != null ? h.getTotalGeneralBeds() : h.getBedsTotal()).sum();
        long availGen = hospitals.stream().mapToLong(h -> h.getAvailableGeneralBeds() != null ? h.getAvailableGeneralBeds() : (h.getBedsTotal() - h.getBedsUsed())).sum();
        long totalIcu = hospitals.stream().mapToLong(h -> h.getTotalIcuBeds() != null ? h.getTotalIcuBeds().intValue() : 0).sum();
        long availIcu = hospitals.stream().mapToLong(h -> h.getAvailableIcuBeds() != null ? h.getAvailableIcuBeds().intValue() : 0).sum();
        long totalVents = hospitals.stream().mapToLong(Hospital::getVentsTotal).sum();

        double avgUtil = hospitals.isEmpty() ? 0.0 :
                hospitals.stream().mapToDouble(h -> (double) h.getBedsUsed() / Math.max(1, h.getBedsTotal())).average().orElse(0.0) * 100.0;

        List<DistrictSummaryDto> distSummaries = districts.stream().map(d -> {
            List<Hospital> dHospitals = hospitals.stream()
                    .filter(h -> d.getName().equalsIgnoreCase(h.getDistrictName()))
                    .collect(Collectors.toList());

            int hCount = dHospitals.size();
            int tBeds = dHospitals.stream().mapToInt(Hospital::getBedsTotal).sum();
            int aBeds = dHospitals.stream().mapToInt(h -> h.getAvailableGeneralBeds() != null ? h.getAvailableGeneralBeds() : (h.getBedsTotal() - h.getBedsUsed())).sum();
            int tIcu = dHospitals.stream().mapToInt(h -> h.getTotalIcuBeds() != null ? h.getTotalIcuBeds().intValue() : 0).sum();
            int aIcu = dHospitals.stream().mapToInt(h -> h.getAvailableIcuBeds() != null ? h.getAvailableIcuBeds().intValue() : 0).sum();

            return DistrictSummaryDto.builder()
                    .id(d.getId())
                    .name(d.getName())
                    .cmoName(d.getCmoName())
                    .cmoPhone(d.getCmoPhone())
                    .hospitalCount(hCount)
                    .totalBeds(tBeds)
                    .availableBeds(aBeds)
                    .icuTotal(tIcu)
                    .icuAvailable(aIcu)
                    .build();
        }).collect(Collectors.toList());

        StateOverviewDto overview = StateOverviewDto.builder()
                .stateName("Jharkhand")
                .stateCode("JH")
                .totalDistricts(districts.size())
                .totalHospitals(hospitals.size())
                .totalGeneralBeds(totalGen)
                .availableGeneralBeds(availGen)
                .totalIcuBeds(totalIcu)
                .availableIcuBeds(availIcu)
                .totalVentilators(totalVents)
                .averageCapacityUtilization(Math.round(avgUtil * 10.0) / 10.0)
                .districts(distSummaries)
                .build();

        return ResponseEntity.ok(overview);
    }

    @GetMapping("/district/{districtName}")
    public ResponseEntity<?> getDistrictDetails(@PathVariable String districtName) {
        // Multi-tenant: verify access to this district
        Optional<District> dOpt = districtRepository.findByName(districtName);
        if (dOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        // Check if user has access to any hospital in this district
        Set<UUID> authorizedHospitalIds = hospitalAuthService.getAuthorizedHospitalIds();
        List<Hospital> allDistrictHospitals = hospitalRepository.findAll().stream()
                .filter(h -> districtName.equalsIgnoreCase(h.getDistrictName()) || districtName.equalsIgnoreCase(h.getRegion()))
                .toList();

        if (!authorizedHospitalIds.isEmpty() && !allDistrictHospitals.isEmpty()) {
            boolean hasAccess = allDistrictHospitals.stream()
                    .anyMatch(h -> authorizedHospitalIds.contains(h.getId()));
            if (!hasAccess) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied: No hospitals in this district"));
            }
        }
        
        List<Hospital> dHospitals = allDistrictHospitals.stream()
                .filter(h -> authorizedHospitalIds.isEmpty() || authorizedHospitalIds.contains(h.getId()))
                .collect(Collectors.toList());

        Map<String, Object> resp = new HashMap<>();
        resp.put("district", dOpt.orElse(null));
        resp.put("hospitals", dHospitals);
        resp.put("facilityCount", dHospitals.size());
        return ResponseEntity.ok(resp);
    }
}
