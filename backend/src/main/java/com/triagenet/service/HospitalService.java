package com.triagenet.service;

import com.triagenet.entity.Hospital;
import com.triagenet.entity.HospitalEdge;
import com.triagenet.repository.HospitalEdgeRepository;
import com.triagenet.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HospitalService {

    private final HospitalRepository hospitalRepository;
    private final HospitalEdgeRepository hospitalEdgeRepository;

    @Transactional(readOnly = true)
    public List<Hospital> getAllHospitals() {
        List<Hospital> list = hospitalRepository.findAll();
        if (list.isEmpty()) {
            return getSeedHospitals();
        }
        return list;
    }

    @Transactional(readOnly = true)
    public Hospital getHospitalById(UUID id) {
        return hospitalRepository.findById(id).orElseGet(() ->
            getSeedHospitals().stream().filter(h -> h.getId().equals(id)).findFirst().orElse(null)
        );
    }

    @Transactional(readOnly = true)
    public List<HospitalEdge> getAllEdges() {
        List<HospitalEdge> edges = hospitalEdgeRepository.findAll();
        if (edges.isEmpty()) {
            return getSeedEdges();
        }
        return edges;
    }

    @Transactional
    public List<Hospital> seedHospitalNetwork() {
        if (hospitalRepository.count() > 0) {
            return hospitalRepository.findAll();
        }
        List<Hospital> seedHospitals = getSeedHospitals();
        List<Hospital> saved = hospitalRepository.saveAll(seedHospitals);

        // Seed edges
        if (saved.size() >= 4) {
            UUID h1 = saved.get(0).getId();
            UUID h2 = saved.get(1).getId();
            UUID h3 = saved.get(2).getId();
            UUID h4 = saved.get(3).getId();

            List<HospitalEdge> edges = Arrays.asList(
                HospitalEdge.builder().fromHospitalId(h1).toHospitalId(h2).transferTimeMinutes(8.0).distanceKm(5.2).build(),
                HospitalEdge.builder().fromHospitalId(h1).toHospitalId(h3).transferTimeMinutes(15.0).distanceKm(11.0).build(),
                HospitalEdge.builder().fromHospitalId(h2).toHospitalId(h4).transferTimeMinutes(10.0).distanceKm(7.8).build(),
                HospitalEdge.builder().fromHospitalId(h3).toHospitalId(h4).transferTimeMinutes(12.0).distanceKm(8.5).build()
            );
            hospitalEdgeRepository.saveAll(edges);
        }

        return saved;
    }

    public List<Hospital> getSeedHospitals() {
        Hospital h1 = Hospital.builder()
                .id(UUID.fromString("11111111-1111-1111-1111-111111111111"))
                .name("City General Hospital")
                .shortCode("CGH")
                .region("Central District")
                .lat(40.7128)
                .lng(-74.0060)
                .totalBeds(48)
                .usedBeds(34)
                .totalVentilators(12)
                .usedVentilators(7)
                .totalSpecialists(9)
                .usedSpecialists(5)
                .icuiCapacityRatio(0.71)
                .build();

        Hospital h2 = Hospital.builder()
                .id(UUID.fromString("22222222-2222-2222-2222-222222222222"))
                .name("St. Mary's Medical Center")
                .shortCode("SMM")
                .region("North Region")
                .lat(40.7306)
                .lng(-73.9352)
                .totalBeds(36)
                .usedBeds(22)
                .totalVentilators(10)
                .usedVentilators(4)
                .totalSpecialists(7)
                .usedSpecialists(3)
                .icuiCapacityRatio(0.61)
                .build();

        Hospital h3 = Hospital.builder()
                .id(UUID.fromString("33333333-3333-3333-3333-333333333333"))
                .name("Riverside Regional Health")
                .shortCode("RRH")
                .region("West Waterfront")
                .lat(40.7589)
                .lng(-73.9851)
                .totalBeds(40)
                .usedBeds(12)
                .totalVentilators(9)
                .usedVentilators(2)
                .totalSpecialists(8)
                .usedSpecialists(2)
                .icuiCapacityRatio(0.30)
                .build();

        Hospital h4 = Hospital.builder()
                .id(UUID.fromString("44444444-4444-4444-4444-444444444444"))
                .name("North District Emergency Clinic")
                .shortCode("NDE")
                .region("Northern Outskirts")
                .lat(40.7829)
                .lng(-73.9654)
                .totalBeds(20)
                .usedBeds(18)
                .totalVentilators(8)
                .usedVentilators(6)
                .totalSpecialists(5)
                .usedSpecialists(4)
                .icuiCapacityRatio(0.90)
                .build();

        return Arrays.asList(h1, h2, h3, h4);
    }

    public List<HospitalEdge> getSeedEdges() {
        UUID h1 = UUID.fromString("11111111-1111-1111-1111-111111111111");
        UUID h2 = UUID.fromString("22222222-2222-2222-2222-222222222222");
        UUID h3 = UUID.fromString("33333333-3333-3333-3333-333333333333");
        UUID h4 = UUID.fromString("44444444-4444-4444-4444-444444444444");

        return Arrays.asList(
            HospitalEdge.builder().fromHospitalId(h1).toHospitalId(h2).transferTimeMinutes(8.0).distanceKm(5.2).build(),
            HospitalEdge.builder().fromHospitalId(h1).toHospitalId(h3).transferTimeMinutes(15.0).distanceKm(11.0).build(),
            HospitalEdge.builder().fromHospitalId(h2).toHospitalId(h4).transferTimeMinutes(10.0).distanceKm(7.8).build(),
            HospitalEdge.builder().fromHospitalId(h3).toHospitalId(h4).transferTimeMinutes(12.0).distanceKm(8.5).build()
        );
    }
}
