package com.triagenet.service;

import com.triagenet.engine.DijkstraRouter;
import com.triagenet.engine.HungarianMatcher;
import com.triagenet.engine.SeverityScorer;
import com.triagenet.entity.Hospital;
import com.triagenet.entity.HospitalEdge;
import com.triagenet.entity.Patient;
import com.triagenet.entity.PatientStatus;
import com.triagenet.entity.ReferralStatus;
import com.triagenet.entity.RoutingAlgorithm;
import com.triagenet.entity.TransferRequest;
import com.triagenet.entity.TransferStatus;
import com.triagenet.repository.PatientRepository;
import com.triagenet.repository.TransferRequestRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReferralService {

    private final HospitalService hospitalService;
    private final PatientRepository patientRepository;
    private final TransferRequestRepository transferRequestRepository;
    private final DijkstraRouter dijkstraRouter;
    private final HungarianMatcher hungarianMatcher;
    private final SeverityScorer severityScorer;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReferralRecommendationDto {
        private UUID fromHospitalId;
        private String fromHospitalName;
        private UUID toHospitalId;
        private String toHospitalName;
        private UUID patientId;
        private String patientName;
        private double patientSeverity;
        private double travelMinutes;
        private String reason;
        private String matchReason;
    }

    @Transactional(readOnly = true)
    public ReferralRecommendationDto calculateRecommendation() {
        List<Hospital> hospitals = hospitalService.getAllHospitals();
        List<HospitalEdge> edges = hospitalService.getAllEdges();
        List<Patient> allPatients = patientRepository.findAll();

        for (Hospital fromH : hospitals) {
            long severeCount = allPatients.stream()
                    .filter(p -> p.getHospitalId().equals(fromH.getId()) && p.getStatus() == PatientStatus.WAITING)
                    .map(p -> severityScorer.computeSeverityFromPatient(p))
                    .filter(s -> s.getScore() >= 75.0)
                    .count();

            int openBeds = (fromH.getBedsTotal() != null && fromH.getBedsUsed() != null)
                    ? Math.max(0, fromH.getBedsTotal() - fromH.getBedsUsed())
                    : 2;

            if (severeCount > 0 && openBeds <= 2) {
                Patient severeWaiting = allPatients.stream()
                        .filter(p -> p.getHospitalId().equals(fromH.getId()) && p.getStatus() == PatientStatus.WAITING)
                        .sorted((a, b) -> Double.compare(
                                severityScorer.computeSeverityFromPatient(b).getScore(),
                                severityScorer.computeSeverityFromPatient(a).getScore()
                        ))
                        .findFirst()
                        .orElse(null);

                if (severeWaiting == null) continue;

                SeverityScorer.SeverityResult sevResult = severityScorer.computeSeverityFromPatient(severeWaiting);

                Hospital targetH = hospitals.stream()
                        .filter(h -> !h.getId().equals(fromH.getId()))
                        .filter(h -> (h.getBedsTotal() - h.getBedsUsed()) >= 2)
                        .filter(h -> hungarianMatcher.checkCompatibility(severeWaiting, sevResult.getScore(), h, List.of()).isCompatible())
                        .sorted((a, b) -> Integer.compare(b.getBedsTotal() - b.getBedsUsed(), a.getBedsTotal() - a.getBedsUsed()))
                        .findFirst()
                        .orElse(null);

                if (targetH != null) {
                    DijkstraRouter.RouteResult route = dijkstraRouter.findShortestRoute(fromH.getId(), targetH.getId(), edges);
                    HungarianMatcher.MatchResult compat = hungarianMatcher.checkCompatibility(severeWaiting, sevResult.getScore(), targetH, List.of());

                    return ReferralRecommendationDto.builder()
                            .fromHospitalId(fromH.getId())
                            .fromHospitalName(fromH.getName())
                            .toHospitalId(targetH.getId())
                            .toHospitalName(targetH.getName())
                            .patientId(severeWaiting.getId())
                            .patientName(severeWaiting.getName())
                            .patientSeverity(sevResult.getScore())
                            .travelMinutes(route.getTotalMinutes())
                            .reason(fromH.getName() + " has " + severeCount + " severe cases with only " + openBeds + " open beds. Target " + targetH.getName() + " has verified open beds, equipment, and specialist availability.")
                            .matchReason(compat.getMatchReason())
                            .build();
                }
            }
        }

        return null;
    }

    @Transactional
    public TransferRequest executeReferral(UUID patientId, UUID toHospitalId, double travelMinutes) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found: " + patientId));

        UUID fromId = patient.getHospitalId();
        patient.setHospitalId(toHospitalId);
        patient.setStatus(PatientStatus.TRANSFERRED);
        patientRepository.save(patient);

        TransferRequest request = TransferRequest.builder()
                .patientId(patientId)
                .fromHospitalId(fromId)
                .toHospitalId(toHospitalId)
                .routingAlgorithm(RoutingAlgorithm.DIJKSTRA)
                .computedCost(travelMinutes)
                .status(TransferStatus.PROPOSED)
                .build();

        return transferRequestRepository.save(request);
    }

    @Transactional(readOnly = true)
    public List<TransferRequest> getActiveReferrals() {
        return transferRequestRepository.findByStatusIn(List.of(TransferStatus.PROPOSED, TransferStatus.APPROVED, TransferStatus.IN_TRANSIT));
    }

    /**
     * BUG (B5): single entry point for referral creation. Persists the transfer
     * in one place with a consistent PROPOSED status and a travel-time estimate
     * derived from hospital coordinates (Haversine) instead of the controller's
     * hardcoded 30.0 minutes.
     */
    @Transactional
    public TransferRequest createReferralWithEstimate(UUID patientId, UUID toHospitalId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found: " + patientId));

        UUID fromId = patient.getHospitalId();

        double estimatedMinutes = 30.0; // conservative fallback
        Hospital to = hospitalService.getAllHospitals().stream()
                .filter(h -> h.getId().equals(toHospitalId)).findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Target hospital not found: " + toHospitalId));
        if (fromId != null) {
            Hospital from = hospitalService.getAllHospitals().stream()
                    .filter(h -> h.getId().equals(fromId)).findFirst().orElse(null);
            if (from != null && from.getLat() != null && from.getLng() != null
                    && to.getLat() != null && to.getLng() != null) {
                double km = Math.acos(Math.min(1.0,
                        Math.sin(Math.toRadians(from.getLat())) * Math.sin(Math.toRadians(to.getLat()))
                                 Math.cos(Math.toRadians(from.getLat())) * Math.cos(Math.toRadians(to.getLat()))
                                        * Math.cos(Math.toRadians(to.getLng() - from.getLng())))) * 6371.0;
                estimatedMinutes = Math.max(5.0, km / 0.6); // ~36 km/h urban average
            }
        }

        return executeReferral(patientId, toHospitalId, estimatedMinutes);
    }

    @Transactional
    public TransferRequest updateReferralStatus(UUID id, ReferralStatus newStatus) {
        TransferRequest request = transferRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Referral not found: " + id));

        TransferStatus mappedStatus = switch (newStatus) {
            case PENDING -> TransferStatus.APPROVED;
            case IN_TRANSIT -> TransferStatus.APPROVED;
            case COMPLETED -> TransferStatus.COMPLETED;
            case CANCELLED -> TransferStatus.REJECTED;
        };

        request.setStatus(mappedStatus);
        return transferRequestRepository.save(request);
    }
}
