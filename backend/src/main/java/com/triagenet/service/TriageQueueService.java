package com.triagenet.service;

import com.triagenet.engine.HungarianMatcher;
import com.triagenet.engine.SeverityScorer;
import com.triagenet.entity.Patient;
import com.triagenet.entity.PatientStatus;
import com.triagenet.entity.TriageQueueEntry;
import com.triagenet.repository.PatientRepository;
import com.triagenet.repository.TriageQueueEntryRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TriageQueueService {

    private final TriageQueueEntryRepository queueRepository;
    private final PatientRepository patientRepository;
    private final SeverityScorer severityScorer;
    private final HungarianMatcher hungarianMatcher;
    private final HospitalAuthorizationService hospitalAuthService;

    // Dynamic priority decay multiplier: E = S + lambda * W
    private static final double LAMBDA_WAIT_DECAY = 0.5;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QueueItemDto {
        private UUID queueEntryId;
        private UUID patientId;
        private String patientName;
        private double baseSeverity;
        private double effectivePriority;
        private long waitMinutes;
        private String presentingComplaint;
        private String status;
        private String matchReason;
    }

    public double calculateEffectivePriority(double baseSeverity, long waitMinutes) {
        return baseSeverity + (LAMBDA_WAIT_DECAY * waitMinutes);
    }

    @Transactional(readOnly = true)
    public List<QueueItemDto> getQueueForHospital(UUID hospitalId) {
        hospitalAuthService.assertCanAccessHospital(hospitalId);
        
        List<Patient> patients = patientRepository.findByHospitalId(hospitalId);

        List<QueueItemDto> items = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (Patient p : patients) {
            long waitMin = p.getAdmittedAt() != null
                    ? Math.max(0, Duration.between(p.getAdmittedAt(), now).toMinutes())
                    : 0;

            SeverityScorer.SeverityResult sev = severityScorer.computeSeverityFromPatient(p);
            double effPri = calculateEffectivePriority(sev.getScore(), waitMin);

            HungarianMatcher.ClinicalRequirement req = hungarianMatcher.evaluateRequirements(p, sev.getScore());

            items.add(QueueItemDto.builder()
                    .patientId(p.getId())
                    .patientName(p.getName())
                    .baseSeverity(sev.getScore())
                    .effectivePriority(Math.round(effPri * 10.0) / 10.0)
                    .waitMinutes(waitMin)
                    .presentingComplaint(p.getPresentingComplaint())
                    .status(p.getStatus() != null ? p.getStatus().name() : "WAITING")
                    .matchReason(req.getMatchReason())
                    .build());
        }

        // Sort priority queue by effective priority descending
        items.sort((a, b) -> Double.compare(b.getEffectivePriority(), a.getEffectivePriority()));
        return items;
    }

    @Transactional
    public List<QueueItemDto> stepSimulationTime(UUID hospitalId, double addMinutes) {
        hospitalAuthService.assertCanAccessHospital(hospitalId);
        List<QueueItemDto> queue = getQueueForHospital(hospitalId);
        for (QueueItemDto item : queue) {
            item.setWaitMinutes(item.getWaitMinutes() + (long) addMinutes);
            double newEff = calculateEffectivePriority(item.getBaseSeverity(), item.getWaitMinutes());
            item.setEffectivePriority(Math.round(newEff * 10.0) / 10.0);
        }
        queue.sort((a, b) -> Double.compare(b.getEffectivePriority(), a.getEffectivePriority()));
        return queue;
    }
}
