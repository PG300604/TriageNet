package com.triagenet.service;

import com.triagenet.engine.SeverityScorer;
import com.triagenet.entity.Patient;
import com.triagenet.entity.PatientStatus;
import com.triagenet.entity.SeverityScore;
import com.triagenet.repository.PatientRepository;
import com.triagenet.repository.SeverityScoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final SeverityScoreRepository severityScoreRepository;
    @lombok.Getter
    private final SeverityScorer severityScorer;
    private final HospitalAuthorizationService hospitalAuthService;
    private final com.triagenet.repository.HospitalRepository hospitalRepository;

    @Transactional(readOnly = true)
    public List<Patient> getAllPatients() {
        // Multi-tenant: only return patients from hospitals the user can access
        Set<UUID> authorizedHospitalIds = hospitalAuthService.getAuthorizedHospitalIds();
        if (authorizedHospitalIds.isEmpty()) {
            return List.of();
        }
        return patientRepository.findByHospitalIdIn(authorizedHospitalIds);
    }

    @Transactional(readOnly = true)
    public Patient getPatientById(UUID id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new com.triagenet.exception.ResourceNotFoundException("Patient not found with id: " + id));
        hospitalAuthService.assertCanAccessHospital(patient.getHospitalId());
        return patient;
    }

    @Transactional
    public Patient registerPatient(Patient patient) {
        if (patient.getHospitalId() == null) {
            throw new IllegalArgumentException("Hospital ID is required for patient registration");
        }

        // Multi-tenant: verify user can register patients at this hospital
        hospitalAuthService.assertCanAccessHospital(patient.getHospitalId());

        if (patient.getStatus() == null) {
            patient.setStatus(PatientStatus.WAITING);
        }

        // Sanitize vitals before persisting to ensure values stay within physiological bounds
        SeverityScorer.ClinicalVitals vitals = SeverityScorer.ClinicalVitals.builder()
                .spo2(patient.getSpo2() != null ? patient.getSpo2() : 98.0)
                .heartRate(patient.getHeartRate() != null ? patient.getHeartRate() : 75.0)
                .systolicBp(patient.getSystolicBp() != null ? patient.getSystolicBp() : 120.0)
                .age(patient.getAge() != null ? patient.getAge() : 45)
                .build()
                .sanitized();

        patient.setSpo2(vitals.getSpo2());
        patient.setHeartRate(vitals.getHeartRate());
        patient.setSystolicBp(vitals.getSystolicBp());
        patient.setAge(vitals.getAge());

        Patient saved = patientRepository.save(patient);

        // Compute initial ML severity score from sanitized vitals
        SeverityScorer.SeverityResult result = severityScorer.computeSeverity(vitals);

        SeverityScore scoreEntity = SeverityScore.builder()
                .patientId(saved.getId())
                .score(result.getScore())
                .contributingFactors(result.getTopFactor())
                .build();
        severityScoreRepository.save(scoreEntity);

        return saved;
    }

    @Transactional
    public SeverityScorer.SeverityResult evaluateVitals(UUID patientId, SeverityScorer.ClinicalVitals vitals) {
        Patient patient = getPatientById(patientId);

        SeverityScorer.ClinicalVitals clean = vitals != null ? vitals.sanitized() : SeverityScorer.ClinicalVitals.builder().build().sanitized();

        patient.setSpo2(clean.getSpo2());
        patient.setHeartRate(clean.getHeartRate());
        patient.setSystolicBp(clean.getSystolicBp());
        patientRepository.save(patient);

        SeverityScorer.SeverityResult result = severityScorer.computeSeverity(clean);

        SeverityScore scoreEntity = SeverityScore.builder()
                .patientId(patientId)
                .score(result.getScore())
                .contributingFactors(result.getTopFactor())
                .build();
        severityScoreRepository.save(scoreEntity);

        return result;
    }

    @Transactional
    public Patient dischargePatient(UUID patientId, String reason) {
        Patient patient = getPatientById(patientId);
        PatientStatus prevStatus = patient.getStatus();
        patient.setStatus(PatientStatus.DISCHARGED);
        Patient saved = patientRepository.save(patient);

        // Atomically reassign bed count and waiting patients under pessimistic write lock
        if (patient.getHospitalId() != null && (prevStatus == PatientStatus.ASSIGNED || prevStatus == PatientStatus.WAITING)) {
            hospitalRepository.findByIdWithLock(patient.getHospitalId()).ifPresent(h -> {
                if (prevStatus == PatientStatus.ASSIGNED) {
                    if (h.getUsedBeds() != null && h.getUsedBeds() > 0) {
                        h.setUsedBeds(h.getUsedBeds() - 1);
                    }
                }

                // Query and lock candidate waiting patients ordered deterministically by admittedAt ASC
                List<Patient> waiting = patientRepository.findWaitingPatientsForUpdate(h.getId(), PatientStatus.WAITING);
                if (!waiting.isEmpty()) {
                    int total = h.getTotalBeds() != null ? h.getTotalBeds() : Integer.MAX_VALUE;
                    int used = h.getUsedBeds() != null ? h.getUsedBeds() : 0;
                    if (used < total) {
                        Patient nextWaiting = waiting.get(0);
                        nextWaiting.setStatus(PatientStatus.ASSIGNED);
                        patientRepository.save(nextWaiting);
                        h.setUsedBeds(used + 1);
                    }
                }
                hospitalRepository.save(h);
            });
        }

        return saved;
    }
}