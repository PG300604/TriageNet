package com.triagenet.controller;

import com.triagenet.entity.Hospital;
import com.triagenet.service.HospitalService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/hospitals")
@RequiredArgsConstructor
public class HospitalController {

    private final HospitalService hospitalService;
    private final com.triagenet.service.HospitalAuthorizationService hospitalAuthService;

    @GetMapping
    public ResponseEntity<List<Hospital>> getAllHospitals(
            @RequestParam(required = false) String district,
            @RequestParam(required = false, defaultValue = "false") boolean includeTertiary
    ) {
        List<Hospital> allHospitals = hospitalService.getAllHospitals();
        java.util.Set<UUID> authorizedHospitalIds = hospitalAuthService.getAuthorizedHospitalIds();

        List<Hospital> result = allHospitals.stream()
                .filter(h -> authorizedHospitalIds.contains(h.getId()) || (includeTertiary && hospitalAuthService.isTertiaryHospital(h.getId())))
                .toList();

        if (district != null && !district.isBlank() && !"ALL".equalsIgnoreCase(district)) {
            result = result.stream()
                    .filter(h -> district.equalsIgnoreCase(h.getDistrictName()) || district.equalsIgnoreCase(h.getRegion()))
                    .toList();
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Hospital> getHospitalById(@PathVariable UUID id) {
        Hospital hospital = hospitalService.getHospitalById(id);
        if (hospital == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(hospital);
    }

    @PostMapping("/seed")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<Hospital>> seedHospitals() {
        return ResponseEntity.ok(hospitalService.seedHospitalNetwork());
    }
}
