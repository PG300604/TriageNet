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

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final SeverityScoreRepository severityScoreRepository;
    @lombok.Getter
    private final SeverityScorer severityScorer;

    @Transactional(readOnly = true)
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Patient getPatientById(UUID id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found with id: " + id));
    }

    @Transactional
    public Patient registerPatient(Patient patient) {
        // BUG (B1): hospitalId is a NOT NULL DB column; validate up front so the
        // caller gets a clear 400 instead of a 500 from a constraint violation.
        if (patient.getHospitalId() == null) {
            throw new IllegalArgumentException("hospitalId is required when registering a patient");
        }
        if (patient.getName() == null || patient.getName().isBlank()) {
            throw new IllegalArgumentException("name is required when registering a patient");
        }

        if (patient.getStatus() == null) {
            patient.setStatus(PatientStatus.WAITING);
        }

        Patient saved = patientRepository.save(patient);

        // Compute initial ML severity score
        SeverityScorer.SeverityResult result = severityScorer.computeSeverityFromPatient(saved);

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

        patient.setSpo2(vitals.getSpo2());
        patient.setHeartRate(vitals.getHeartRate());
        patient.setSystolicBp(vitals.getSystolicBp());
        patientRepository.save(patient);

        SeverityScorer.SeverityResult result = severityScorer.computeSeverity(vitals);

        SeverityScore scoreEntity = SeverityScore.builder()
                .patientId(patientId)
                .score(result.getScore())
                .contributingFactors(result.getTopFactor())
                .build();
        severityScoreRepository.save(scoreEntity);

        return result;
    }

    private final com.triagenet.repository.HospitalRepository hospitalRepository;

    @Transactional
    public Patient dischargePatient(UUID patientId, String reason) {
        Patient patient = getPatientById(patientId);
        PatientStatus prevStatus = patient.getStatus();
        patient.setStatus(PatientStatus.DISCHARGED);
        Patient saved = patientRepository.save(patient);

        // BUG (B4): previously a bed was freed even when the patient had status
        // WAITING (never occupying one), and the auto-assign picked an arbitrary
        // waiting patient via unordered findAll(). Now:
        //  - only ASSIGNED patients occupy a bed, so only they free one;
        //  - the replacement is the most severe waiting patient at that hospital
        //    (deterministic triage order), not a random row.
        if (prevStatus == PatientStatus.ASSIGNED && patient.getHospitalId() != null) {
            hospitalRepository.findById(patient.getHospitalId()).ifPresent(h -> {
                if (h.getUsedBeds() != null && h.getUsedBeds() > 0) {
                    h.setUsedBeds(h.getUsedBeds() - 1);
                }

                // Auto-assign highest-severity waiting patient at that hospital to the freed bed
                patientRepository.findAll().stream()
                        .filter(p -> h.getId().equals(p.getHospitalId()) && p.getStatus() == PatientStatus.WAITING)
                        .max(java.util.Comparator.comparingDouble(
                                p -> severityScorer.computeSeverityFromPatient(p).getScore()))
                        .ifPresent(nextWaiting -> {
                            nextWaiting.setStatus(PatientStatus.ASSIGNED);
                            patientRepository.save(nextWaiting);
                            if (h.getUsedBeds() != null) {
                                h.setUsedBeds(h.getUsedBeds() + 1);
                            }
                        });

                hospitalRepository.save(h);
            });
        }

        return saved;
    }
}
