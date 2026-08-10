package com.triagenet.service;

import com.triagenet.entity.Hospital;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class SpatialRoutingService {

    private static final double EARTH_RADIUS_KM = 6371.0;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HospitalDistanceEstimate {
        private UUID hospitalId;
        private String hospitalName;
        private String districtName;
        private String facilityTier;
        private double distanceKm;
        private double estimatedMinutes;
        private int availableGeneralBeds;
        private int availableIcuBeds;
        private boolean hasVentilator;
        private boolean hasTraumaSurgery;
        private boolean hasBloodBank;
        private double latitude;
        private double longitude;
        private double suitabilityScore; // Combined acuteness + travel cost score
    }

    /**
     * Calculate Haversine distance in kilometers between two GPS points
     */
    public double calculateHaversineDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double straightKm = EARTH_RADIUS_KM * c;
        // Winding factor multiplier for real road networks (approx 1.3x Euclidean)
        return Math.round(straightKm * 1.3 * 10.0) / 10.0;
    }

    /**
     * Estimate travel time in minutes based on road distance
     */
    public double estimateTravelMinutes(double distanceKm, boolean isEmergencyAmbulance) {
        // Average speed: 45 km/h for ambulances with siren, 35 km/h for standard traffic
        double avgSpeedKmh = isEmergencyAmbulance ? 50.0 : 35.0;
        double travelHours = distanceKm / avgSpeedKmh;
        return Math.round((travelHours * 60.0 + 3.0) * 10.0) / 10.0; // +3 mins dispatch prep delay
    }

    /**
     * Rank candidate hospitals by dynamic suitability formula:
     * Suitability = α * (100 - TravelTimeMin) + β * AvailICUBeds + γ * TierBonus
     */
    public List<HospitalDistanceEstimate> rankHospitalsForPatient(
            double originLat,
            double originLng,
            int patientSeverityScore,
            boolean requiresIcu,
            boolean requiresVentilator,
            List<Hospital> candidates) {

        List<HospitalDistanceEstimate> estimates = new ArrayList<>();

        for (Hospital h : candidates) {
            double distKm = calculateHaversineDistanceKm(originLat, originLng, h.getLat(), h.getLng());
            double travelMins = estimateTravelMinutes(distKm, patientSeverityScore >= 80);

            int availGeneral = h.getAvailableGeneralBeds() != null ? h.getAvailableGeneralBeds() : (h.getBedsTotal() - h.getBedsUsed());
            int availIcu = h.getAvailableIcuBeds() != null ? h.getAvailableIcuBeds() : 2;

            // Compute composite suitability score
            double travelPenalty = travelMins * 1.5;
            double bedScore = (requiresIcu ? availIcu * 10.0 : availGeneral * 2.0);
            
            double tierBonus = 0.0;
            if ("TERTIARY".equalsIgnoreCase(h.getFacilityTier())) tierBonus = 30.0;
            else if ("DISTRICT".equalsIgnoreCase(h.getFacilityTier())) tierBonus = 15.0;

            double capabilityPenalty = 0.0;
            if (requiresVentilator && (h.getHasVentilator() == null || !h.getHasVentilator())) capabilityPenalty += 50.0;
            if (requiresIcu && availIcu <= 0) capabilityPenalty += 100.0;

            double suitability = Math.max(0, 100.0 - travelPenalty + bedScore + tierBonus - capabilityPenalty);

            estimates.add(HospitalDistanceEstimate.builder()
                    .hospitalId(h.getId())
                    .hospitalName(h.getName())
                    .districtName(h.getDistrictName() != null ? h.getDistrictName() : h.getRegion())
                    .facilityTier(h.getFacilityTier() != null ? h.getFacilityTier() : "DISTRICT")
                    .distanceKm(distKm)
                    .estimatedMinutes(travelMins)
                    .availableGeneralBeds(availGeneral)
                    .availableIcuBeds(availIcu)
                    .hasVentilator(h.getHasVentilator() != null ? h.getHasVentilator() : true)
                    .hasTraumaSurgery(h.getHasTraumaSurgery() != null ? h.getHasTraumaSurgery() : false)
                    .hasBloodBank(h.getHasBloodBank() != null ? h.getHasBloodBank() : false)
                    .latitude(h.getLat())
                    .longitude(h.getLng())
                    .suitabilityScore(Math.round(suitability * 10.0) / 10.0)
                    .build());
        }

        estimates.sort(Comparator.comparingDouble(HospitalDistanceEstimate::getSuitabilityScore).reversed());
        return estimates;
    }
}
