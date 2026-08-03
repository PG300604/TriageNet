package com.triagenet.controller;

import com.triagenet.entity.TransferRequest;
import com.triagenet.service.ReferralService;
import com.triagenet.service.TriageQueueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/triage-queue")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TriageQueueController {

    private final TriageQueueService triageQueueService;
    private final ReferralService referralService;

    @GetMapping("/{hospitalId}")
    public ResponseEntity<List<TriageQueueService.QueueItemDto>> getQueueForHospital(@PathVariable UUID hospitalId) {
        return ResponseEntity.ok(triageQueueService.getQueueForHospital(hospitalId));
    }

    @PostMapping("/{hospitalId}/step-time")
    public ResponseEntity<List<TriageQueueService.QueueItemDto>> stepSimulationTime(
            @PathVariable UUID hospitalId,
            @RequestParam(defaultValue = "7.0") double minutes) {
        return ResponseEntity.ok(triageQueueService.stepSimulationTime(hospitalId, minutes));
    }

    @GetMapping("/referral-recommendation")
    public ResponseEntity<ReferralService.ReferralRecommendationDto> getReferralRecommendation() {
        ReferralService.ReferralRecommendationDto recommendation = referralService.calculateRecommendation();
        if (recommendation == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(recommendation);
    }

    @PostMapping("/execute-referral")
    public ResponseEntity<TransferRequest> executeReferral(
            @RequestParam UUID patientId,
            @RequestParam UUID toHospitalId,
            @RequestParam(defaultValue = "12.0") double travelMinutes) {
        return ResponseEntity.ok(referralService.executeReferral(patientId, toHospitalId, travelMinutes));
    }
}
