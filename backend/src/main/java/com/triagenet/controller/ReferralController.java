package com.triagenet.controller;

import com.triagenet.dto.ReferralRequest;
import com.triagenet.dto.ReferralResponse;
import com.triagenet.dto.ReferralStatusUpdate;
import com.triagenet.entity.ReferralStatus;
import com.triagenet.entity.TransferRequest;
import com.triagenet.entity.TransferStatus;
import com.triagenet.repository.TransferRequestRepository;
import com.triagenet.service.ReferralService;
import com.triagenet.service.ReferralService.ReferralRecommendationDto;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * REST Controller for the 108 Ambulance Transfer Referral API.
 *
 * Exposes endpoints for creating emergency inter-hospital transfer referrals,
 * querying active ambulance dispatches, updating referral lifecycle status,
 * and fetching AI-computed transfer recommendations from the Dijkstra +
 * Hungarian engines.
 *
 * API Surface (from TRD §4):
 *   POST   /api/referrals              — Create referral & pre-book bed
 *   GET    /api/referrals/active        — List active 108 transfers
 *   PUT    /api/referrals/{id}/status   — Update status (IN_TRANSIT, COMPLETED)
 *   GET    /api/referrals/recommendation — AI-computed transfer recommendation
 */
@RestController
@RequestMapping("/api/referrals")
@RequiredArgsConstructor
public class ReferralController {

    private final ReferralService referralService;
    private final TransferRequestRepository transferRequestRepository;
    private final Random random = new Random();

    /**
     * POST /api/referrals
     * Create a 108 ambulance transfer referral and pre-book a bed at the
     * receiving hospital. Generates a unique dispatch token (#JH-108-DISPATCH-XXXX).
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('AMBULANCE_DISPATCH', 'HOSPITAL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ReferralResponse> createReferral(@RequestBody @Valid ReferralRequest request) {
        TransferRequest transfer = referralService.executeReferral(
                request.getPatientId(),
                request.getTargetHospitalId(),
                30.0 // Default travel time estimate; refined by Dijkstra in production
        );
        transfer.setStatus(TransferStatus.PROPOSED);
        transfer = transferRequestRepository.save(transfer);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(mapToResponse(transfer, request.getReason()));
    }

    /**
     * GET /api/referrals/active
     * Returns all currently active 108 ambulance transfers (PROPOSED, APPROVED, or IN_TRANSIT).
     */
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('AMBULANCE_DISPATCH', 'HOSPITAL_ADMIN', 'STATE_HEALTH_DEPT', 'DISTRICT_CMO', 'SUPER_ADMIN')")
    public ResponseEntity<List<ReferralResponse>> getActiveReferrals() {
        List<TransferRequest> active = new ArrayList<>();
        active.addAll(transferRequestRepository.findByStatus(TransferStatus.PROPOSED));
        active.addAll(transferRequestRepository.findByStatus(TransferStatus.APPROVED));
        active.addAll(transferRequestRepository.findByStatus(TransferStatus.IN_TRANSIT));

        List<ReferralResponse> responses = active.stream()
                .map(t -> mapToResponse(t, "Active Transfer"))
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    /**
     * PUT /api/referrals/{id}/status
     * Update the lifecycle status of an existing referral (e.g. mark as IN_TRANSIT
     * when ambulance departs, or COMPLETED when patient arrives at receiving facility).
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('AMBULANCE_DISPATCH', 'HOSPITAL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ReferralResponse> updateReferralStatus(
            @PathVariable UUID id,
            @RequestBody @Valid ReferralStatusUpdate update) {

        TransferRequest transfer = transferRequestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Referral not found: " + id));

        transfer.setStatus(mapToTransferStatus(update.getStatus()));
        transferRequestRepository.save(transfer);

        return ResponseEntity.ok(mapToResponse(transfer, update.getNotes()));
    }

    /**
     * GET /api/referrals/recommendation
     * Fetches an AI-computed referral recommendation from the Dijkstra + Hungarian
     * engines. Returns 204 No Content if no overflow recommendation is needed.
     */
    @GetMapping("/recommendation")
    @PreAuthorize("hasAnyRole('AMBULANCE_DISPATCH', 'HOSPITAL_ADMIN', 'STATE_HEALTH_DEPT', 'DISTRICT_CMO', 'SUPER_ADMIN')")
    public ResponseEntity<ReferralRecommendationDto> getRecommendation() {
        ReferralRecommendationDto recommendation = referralService.calculateRecommendation();
        if (recommendation == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(recommendation);
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    /**
     * Maps a TransferRequest entity to a ReferralResponse DTO,
     * generating a dispatch token and setting timestamps.
     */
    private ReferralResponse mapToResponse(TransferRequest transfer, String reason) {
        return ReferralResponse.builder()
                .id(transfer.getId())
                .patientId(transfer.getPatientId())
                .fromHospitalId(transfer.getFromHospitalId())
                .toHospitalId(transfer.getToHospitalId())
                .dispatchToken(generateDispatchToken(transfer.getId()))
                .status(mapToReferralStatus(transfer.getStatus()))
                .reason(reason != null ? reason : "Referral initiated")
                .requestedAt(transfer.getRequestedAt() != null
                        ? transfer.getRequestedAt() : LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    /** Maps frontend ReferralStatus → backend TransferStatus. */
    private TransferStatus mapToTransferStatus(ReferralStatus referralStatus) {
        if (referralStatus == null) return TransferStatus.PROPOSED;
        return switch (referralStatus) {
            case PENDING -> TransferStatus.PROPOSED;
            case IN_TRANSIT -> TransferStatus.IN_TRANSIT;
            case COMPLETED -> TransferStatus.COMPLETED;
            case CANCELLED -> TransferStatus.REJECTED;
        };
    }

    /** Maps backend TransferStatus → frontend ReferralStatus. */
    private ReferralStatus mapToReferralStatus(TransferStatus transferStatus) {
        if (transferStatus == null) return ReferralStatus.PENDING;
        return switch (transferStatus) {
            case PROPOSED -> ReferralStatus.PENDING;
            case APPROVED -> ReferralStatus.IN_TRANSIT;
            case IN_TRANSIT -> ReferralStatus.IN_TRANSIT;
            case COMPLETED -> ReferralStatus.COMPLETED;
            case REJECTED -> ReferralStatus.CANCELLED;
        };
    }

    /**
     * Generates a unique 108 dispatch token from the transfer UUID.
     * Format: #JH-108-DISPATCH-XXXXXXXX
     */
    private String generateDispatchToken(UUID id) {
        if (id != null) {
            return String.format("#JH-108-DISPATCH-%s",
                    id.toString().replace("-", "").substring(0, 8).toUpperCase());
        }
        int tokenNum = 1000 + random.nextInt(9000);
        return "#JH-108-DISPATCH-" + tokenNum;
    }
}
