package com.triagenet.controller;

import com.triagenet.entity.Hospital;
import com.triagenet.entity.Resource;
import com.triagenet.repository.ResourceRepository;
import com.triagenet.repository.HospitalRepository;
import com.triagenet.service.HospitalAuthorizationService;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceRepository resourceRepository;
    private final HospitalRepository hospitalRepository;
    private final HospitalAuthorizationService hospitalAuthService;

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
        // Multi-tenant: only return resources from hospitals the user can access
        Set<UUID> authorizedHospitalIds = hospitalAuthService.getAuthorizedHospitalIds();
        if (authorizedHospitalIds.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(resourceRepository.findByHospitalIdIn(authorizedHospitalIds));
    }

    @PostMapping("/transfer")
    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN', 'DISTRICT_CMO', 'SUPER_ADMIN', 'REGIONAL_COORDINATOR')")
    public ResponseEntity<String> transferSupply(@RequestBody TransferSupplyRequest request) {
        // BUG (B2): this endpoint previously returned a fabricated success
        // message without validating anything or persisting anything — a fake
        // audit trail in a healthcare system.
        if (request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Transfer quantity must be positive");
        }
        if (request.getFromHospitalId() == null || request.getToHospitalId() == null) {
            throw new IllegalArgumentException("fromHospitalId and toHospitalId are required");
        }
        if (request.getFromHospitalId().equals(request.getToHospitalId())) {
            throw new IllegalArgumentException("Source and target hospital must differ");
        }
        if (request.getResourceType() == null || request.getResourceType().isBlank()) {
            throw new IllegalArgumentException("resourceType is required");
        }

        // Multi-tenant: verify access to source hospital (outbound transfer)
        hospitalAuthService.assertCanAccessHospital(request.getFromHospitalId());

        Hospital from = hospitalRepository.findById(request.getFromHospitalId())
                .orElseThrow(() -> new IllegalArgumentException("Source hospital not found: " + request.getFromHospitalId()));
        hospitalRepository.findById(request.getToHospitalId())
                .orElseThrow(() -> new IllegalArgumentException("Target hospital not found: " + request.getToHospitalId()));

        // Inventory mutation is NOT yet implemented; refuse honestly rather
        // than pretending the transfer happened.
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(
                String.format(
                        "Validated transfer request of %d %s from '%s' to target hospital, but inventory movement is not implemented yet. No stock was changed.",
                        request.getQuantity(), request.getResourceType(), from.getName()));
    }
}
