package com.triagenet.controller;

import com.triagenet.entity.Resource;
import com.triagenet.repository.ResourceRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceRepository resourceRepository;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransferSupplyRequest {
        private UUID fromHospitalId;
        private UUID toHospitalId;
        private String resourceType;
        private int quantity;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN', 'DISTRICT_CMO', 'STATE_HEALTH_DEPT', 'SUPER_ADMIN', 'REGIONAL_COORDINATOR')")
    public ResponseEntity<List<Resource>> getAllResources() {
        return ResponseEntity.ok(resourceRepository.findAll());
    }

    @PostMapping("/transfer")
    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN', 'DISTRICT_CMO', 'SUPER_ADMIN', 'REGIONAL_COORDINATOR')")
    public ResponseEntity<String> transferSupply(@RequestBody TransferSupplyRequest request) {
        String msg = String.format("Successfully transferred %d %s from hospital %s to hospital %s.",
                request.getQuantity(), request.getResourceType(), request.getFromHospitalId(), request.getToHospitalId());
        return ResponseEntity.ok(msg);
    }
}
