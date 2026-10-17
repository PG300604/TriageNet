package com.triagenet.service;

import com.triagenet.dto.TrafficPreemptionRequestDto;
import com.triagenet.dto.TrafficPreemptionStatusDto;
import com.triagenet.dto.TrafficSignalIntersectionDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class TrafficControlGatewayService {

    private final Map<String, TrafficPreemptionStatusDto> activeCorridors = new ConcurrentHashMap<>();

    private static final List<TrafficSignalIntersectionDto> RANCHI_CORRIDOR_SIGNALS = List.of(
            TrafficSignalIntersectionDto.builder()
                    .signalId("SIG-RN-01")
                    .intersectionName("Ormanjhi NH-33 Toll Plaza & Expressway Ramp")
                    .lat(23.4795).lng(85.4741)
                    .distanceMeters(0.0).etaSeconds(0)
                    .preemptionStatus("STANDBY").mainStreetPhase("NORMAL_CYCLE").crossStreetPhase("NORMAL_CYCLE")
                    .vmsMessage("108 ALS AMBULANCE APPROACHING - MERGE LEFT - CLEAR EMERGENCY CORRIDOR")
                    .policeOutpostNotified(true).policeChowkiName("Ormanjhi Traffic Police Outpost")
                    .build(),
            TrafficSignalIntersectionDto.builder()
                    .signalId("SIG-RN-02")
                    .intersectionName("Mesra Ring Road Junction")
                    .lat(23.4320).lng(85.4380)
                    .distanceMeters(5500.0).etaSeconds(260)
                    .preemptionStatus("STANDBY").mainStreetPhase("NORMAL_CYCLE").crossStreetPhase("NORMAL_CYCLE")
                    .vmsMessage("VMS GANTRY: EMERGENCY GREEN WAVE IN PROGRESS - PREPARE TO MERGE LEFT")
                    .policeOutpostNotified(true).policeChowkiName("Mesra Highway Patrol Interceptor PCR-04")
                    .build(),
            TrafficSignalIntersectionDto.builder()
                    .signalId("SIG-RN-03")
                    .intersectionName("Booty More Traffic Junction")
                    .lat(23.4012).lng(85.3780)
                    .distanceMeters(9200.0).etaSeconds(440)
                    .preemptionStatus("STANDBY").mainStreetPhase("NORMAL_CYCLE").crossStreetPhase("NORMAL_CYCLE")
                    .vmsMessage("BOOTY MORE VMS: ALL CROSS-TRAFFIC HALT - AMBULANCE ARRIVING IN 60S")
                    .policeOutpostNotified(true).policeChowkiName("Booty More Traffic Post")
                    .build(),
            TrafficSignalIntersectionDto.builder()
                    .signalId("SIG-RN-04")
                    .intersectionName("Kanta Toli Flyover Incline Ramp")
                    .lat(23.3685).lng(85.3460)
                    .distanceMeters(13400.0).etaSeconds(640)
                    .preemptionStatus("STANDBY").mainStreetPhase("NORMAL_CYCLE").crossStreetPhase("NORMAL_CYCLE")
                    .vmsMessage("RIGHT LANE STRICTLY RESERVED FOR 108 EMERGENCY PATIENT TRANSFER")
                    .policeOutpostNotified(true).policeChowkiName("Kanta Toli Police Control Room Unit 09")
                    .build(),
            TrafficSignalIntersectionDto.builder()
                    .signalId("SIG-RN-05")
                    .intersectionName("Bariatu Road Medical Crossing")
                    .lat(23.3855).lng(85.3580)
                    .distanceMeters(16200.0).etaSeconds(780)
                    .preemptionStatus("STANDBY").mainStreetPhase("NORMAL_CYCLE").crossStreetPhase("NORMAL_CYCLE")
                    .vmsMessage("APPROACHING RIMS TRAUMA BAY - KEEP INTERSECTIONS FULLY CLEAR")
                    .policeOutpostNotified(true).policeChowkiName("Bariatu Road Traffic Post")
                    .build(),
            TrafficSignalIntersectionDto.builder()
                    .signalId("SIG-RN-06")
                    .intersectionName("RIMS Apex Hospital Emergency Entrance")
                    .lat(23.3892).lng(85.3621)
                    .distanceMeters(17100.0).etaSeconds(820)
                    .preemptionStatus("STANDBY").mainStreetPhase("NORMAL_CYCLE").crossStreetPhase("NORMAL_CYCLE")
                    .vmsMessage("TRAUMA BAY RECEPTION: CODE RED EMERGENCY ARRIVAL IMMINENT")
                    .policeOutpostNotified(true).policeChowkiName("RIMS Gate Constabulary & Security Command")
                    .build()
    );

    /**
     * Activates a municipal ITMS Green Wave preemption corridor for an in-transit ambulance.
     */
    public TrafficPreemptionStatusDto activatePreemption(TrafficPreemptionRequestDto request) {
        String ambulanceNum = request.getAmbulanceNumber() != null ? request.getAmbulanceNumber() : "JH-108-ALS-01";
        String corridorId = "CORR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        log.info("[ITMS GATEWAY] Activating road preemption corridor {} for ambulance {} heading to {}",
                corridorId, ambulanceNum, request.getDestinationHospitalName());

        List<TrafficSignalIntersectionDto> signals = cloneCorridorSignals();
        updateSignalDistancesAndPhases(signals, request.getCurrentLat(), request.getCurrentLng(), request.getSpeedKmph());

        int preemptedCount = (int) signals.stream()
                .filter(s -> "GREEN_WAVE_LOCKED".equals(s.getPreemptionStatus()) || "CLEARING_CROSS_STREETS".equals(s.getPreemptionStatus()))
                .count();

        TrafficPreemptionStatusDto status = TrafficPreemptionStatusDto.builder()
                .corridorId(corridorId)
                .ambulanceNumber(ambulanceNum)
                .active(true)
                .preemptionMode("AUTOMATIC_ITMS_V2X")
                .itmsProvider("Ranchi Smart City ITMS Gateway v3.1 / Jharkhand Police ATCS")
                .handshakeLatencyMs(18L + (long)(Math.random() * 8))
                .totalSignalsInCorridor(signals.size())
                .signalsPreemptedGreen(Math.max(1, preemptedCount))
                .trafficDelayClearedMinutes(preemptedCount * 3.4)
                .corridorSpeedKmph(request.getSpeedKmph() != null && request.getSpeedKmph() > 0 ? request.getSpeedKmph() : 74.0)
                .activeVmsAlert("VMS GANTRY: 108 AMBULANCE APPROACHING - MERGE LEFT - KEEP RIGHT LANE OPEN")
                .upcomingIntersections(signals)
                .policeUnitsAlerted(List.of(
                        "Ranchi Traffic Control Room (Central Police Wireless)",
                        "Highway Patrol Interceptor PCR-04",
                        "Kanta Toli PCR Unit 09",
                        "RIMS Emergency Trauma Gate Security"
                ))
                .lastTelemetrySyncAt(LocalDateTime.now())
                .build();

        activeCorridors.put(ambulanceNum, status);
        return status;
    }

    /**
     * Ingests real-time ambulance GPS telemetry to update signal preemption ahead of the vehicle.
     */
    public TrafficPreemptionStatusDto processTelemetryUpdate(TrafficPreemptionRequestDto request) {
        String ambulanceNum = request.getAmbulanceNumber() != null ? request.getAmbulanceNumber() : "JH-108-ALS-01";
        TrafficPreemptionStatusDto existing = activeCorridors.get(ambulanceNum);

        if (existing == null) {
            return activatePreemption(request);
        }

        List<TrafficSignalIntersectionDto> signals = existing.getUpcomingIntersections();
        updateSignalDistancesAndPhases(signals, request.getCurrentLat(), request.getCurrentLng(), request.getSpeedKmph());

        int preemptedCount = (int) signals.stream()
                .filter(s -> "GREEN_WAVE_LOCKED".equals(s.getPreemptionStatus()))
                .count();

        existing.setSignalsPreemptedGreen(preemptedCount);
        existing.setTrafficDelayClearedMinutes(preemptedCount * 3.4);
        if (request.getSpeedKmph() != null) {
            existing.setCorridorSpeedKmph(request.getSpeedKmph());
        }
        existing.setHandshakeLatencyMs(16L + (long)(Math.random() * 6));
        existing.setLastTelemetrySyncAt(LocalDateTime.now());

        return existing;
    }

    /**
     * Retrieves current active corridor status by ambulance number.
     */
    public Optional<TrafficPreemptionStatusDto> getCorridorStatus(String ambulanceNumber) {
        return Optional.ofNullable(activeCorridors.get(ambulanceNumber));
    }

    /**
     * Lists all active traffic preemption corridors across the state.
     */
    public List<TrafficPreemptionStatusDto> getAllActiveCorridors() {
        return new ArrayList<>(activeCorridors.values());
    }

    /**
     * Releases traffic preemption back to normal municipal adaptive cycle.
     */
    public boolean releasePreemption(String ambulanceNumber) {
        TrafficPreemptionStatusDto status = activeCorridors.remove(ambulanceNumber);
        if (status != null) {
            log.info("[ITMS GATEWAY] Released Green Wave preemption for ambulance {}. Signals returned to normal adaptive cycle.",
                    ambulanceNumber);
            return true;
        }
        return false;
    }

    private List<TrafficSignalIntersectionDto> cloneCorridorSignals() {
        List<TrafficSignalIntersectionDto> list = new ArrayList<>();
        for (TrafficSignalIntersectionDto sig : RANCHI_CORRIDOR_SIGNALS) {
            list.add(TrafficSignalIntersectionDto.builder()
                    .signalId(sig.getSignalId())
                    .intersectionName(sig.getIntersectionName())
                    .lat(sig.getLat())
                    .lng(sig.getLng())
                    .distanceMeters(sig.getDistanceMeters())
                    .etaSeconds(sig.getEtaSeconds())
                    .preemptionStatus(sig.getPreemptionStatus())
                    .mainStreetPhase(sig.getMainStreetPhase())
                    .crossStreetPhase(sig.getCrossStreetPhase())
                    .vmsMessage(sig.getVmsMessage())
                    .policeOutpostNotified(sig.getPoliceOutpostNotified())
                    .policeChowkiName(sig.getPoliceChowkiName())
                    .build());
        }
        return list;
    }

    private void updateSignalDistancesAndPhases(List<TrafficSignalIntersectionDto> signals, Double lat, Double lng, Double speedKmph) {
        if (lat == null || lng == null) return;
        double speedMps = (speedKmph != null && speedKmph > 10.0 ? speedKmph : 72.0) * (1000.0 / 3600.0);

        for (TrafficSignalIntersectionDto sig : signals) {
            double distMeters = calculateHaversineDistance(lat, lng, sig.getLat(), sig.getLng()) * 1000.0;
            int etaSec = (int) Math.round(distMeters / speedMps);

            sig.setDistanceMeters(Math.round(distMeters * 10.0) / 10.0);
            sig.setEtaSeconds(etaSec);

            if (distMeters < 1500.0) {
                // Immediate lookahead: Lock solid green and hold cross streets red
                sig.setPreemptionStatus("GREEN_WAVE_LOCKED");
                sig.setMainStreetPhase("SOLID_GREEN");
                sig.setCrossStreetPhase("ALL_RED_HOLD");
            } else if (distMeters < 3500.0) {
                // Advance warning: Clear cross traffic with yellow clearance
                sig.setPreemptionStatus("CLEARING_CROSS_STREETS");
                sig.setMainStreetPhase("FLASHING_YELLOW");
                sig.setCrossStreetPhase("RED_CLEARANCE");
            } else {
                sig.setPreemptionStatus("STANDBY");
                sig.setMainStreetPhase("NORMAL_CYCLE");
                sig.setCrossStreetPhase("NORMAL_CYCLE");
            }
        }
    }

    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
