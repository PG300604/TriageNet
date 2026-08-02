package com.triagenet.repository;

import com.triagenet.entity.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class EntityRepositoryTest {

    @Autowired
    private HospitalRepository hospitalRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private StaffUserRepository staffUserRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private SeverityScoreRepository severityScoreRepository;

    @Autowired
    private TriageQueueEntryRepository triageQueueEntryRepository;

    @Autowired
    private AllocationRecordRepository allocationRecordRepository;

    @Autowired
    private HospitalEdgeRepository hospitalEdgeRepository;

    @Autowired
    private TransferRequestRepository transferRequestRepository;

    @Test
    @DisplayName("Should successfully persist and retrieve records for all 9 entities")
    void testAllEntitiesPersistence() {
        // 1. Role
        Role role = roleRepository.save(Role.builder().name(RoleName.HOSPITAL_STAFF).build());
        assertThat(role.getId()).isNotNull();

        // 2. Hospital
        Hospital hospital = hospitalRepository.save(Hospital.builder()
                .name("City General")
                .region("Metropolitan")
                .lat(12.9716)
                .lng(77.5946)
                .totalBeds(50)
                .totalVentilators(10)
                .totalSpecialists(15)
                .build());
        assertThat(hospital.getId()).isNotNull();

        // 3. StaffUser
        StaffUser user = staffUserRepository.save(StaffUser.builder()
                .name("Nurse Joy")
                .email("nurse.joy@citygeneral.org")
                .passwordHash("hashed_secret")
                .hospitalId(hospital.getId())
                .role(role)
                .build());
        assertThat(user.getId()).isNotNull();

        // 4. Resource
        Resource resource = resourceRepository.save(Resource.builder()
                .hospitalId(hospital.getId())
                .type(ResourceType.BED)
                .subtype("ICU-Bed")
                .status(ResourceStatus.AVAILABLE)
                .build());
        assertThat(resource.getId()).isNotNull();

        // 5. Patient
        Patient patient = patientRepository.save(Patient.builder()
                .hospitalId(hospital.getId())
                .name("John Doe")
                .age(45)
                .presentingComplaint("Chest Pain")
                .heartRate(110.0)
                .systolicBp(140.0)
                .spo2(92.0)
                .bloodType("O+")
                .requiredSpecialty("Cardiology")
                .status(PatientStatus.WAITING)
                .build());
        assertThat(patient.getId()).isNotNull();

        // 6. SeverityScore
        SeverityScore severityScore = severityScoreRepository.save(SeverityScore.builder()
                .patientId(patient.getId())
                .score(85.5)
                .contributingFactors("{\"spo2\": 92, \"heartRate\": 110}")
                .build());
        assertThat(severityScore.getId()).isNotNull();

        // 7. TriageQueueEntry
        TriageQueueEntry queueEntry = triageQueueEntryRepository.save(TriageQueueEntry.builder()
                .patientId(patient.getId())
                .hospitalId(hospital.getId())
                .baseSeverity(85.5)
                .effectivePriority(90.0)
                .build());
        assertThat(queueEntry.getId()).isNotNull();

        // 8. AllocationRecord
        AllocationRecord allocationRecord = allocationRecordRepository.save(AllocationRecord.builder()
                .patientId(patient.getId())
                .resourceId(resource.getId())
                .assignmentCost(0.15)
                .algorithmRunId("run-2026-08-01-001")
                .build());
        assertThat(allocationRecord.getId()).isNotNull();

        // 9. HospitalEdge & TransferRequest
        Hospital targetHospital = hospitalRepository.save(Hospital.builder()
                .name("St. Mary's")
                .region("Metropolitan")
                .lat(12.9800)
                .lng(77.6000)
                .totalBeds(30)
                .totalVentilators(5)
                .totalSpecialists(8)
                .build());

        HospitalEdge edge = hospitalEdgeRepository.save(HospitalEdge.builder()
                .fromHospitalId(hospital.getId())
                .toHospitalId(targetHospital.getId())
                .transferTimeMinutes(15.0)
                .distanceKm(8.5)
                .build());
        assertThat(edge.getId()).isNotNull();

        TransferRequest transferRequest = transferRequestRepository.save(TransferRequest.builder()
                .patientId(patient.getId())
                .fromHospitalId(hospital.getId())
                .toHospitalId(targetHospital.getId())
                .routingAlgorithm(RoutingAlgorithm.DIJKSTRA)
                .computedCost(15.0)
                .status(TransferStatus.PROPOSED)
                .build());
        assertThat(transferRequest.getId()).isNotNull();
    }
}
