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

    private final com.triagenet.repository.HospitalRepository hospitalRepository;

    @Transactional
    public Patient dischargePatient(UUID patientId, String reason) {
        Patient patient = getPatientById(patientId);
        PatientStatus prevStatus = patient.getStatus();
        patient.setStatus(PatientStatus.DISCHARGED);
        Patient saved = patientRepository.save(patient);

        // Free up bed count at patient's hospital if patient was assigned
        if (prevStatus == PatientStatus.ASSIGNED || prevStatus == PatientStatus.WAITING) {
            hospitalRepository.findById(patient.getHospitalId()).ifPresent(h -> {
                if (h.getUsedBeds() != null && h.getUsedBeds() > 0) {
                    h.setUsedBeds(h.getUsedBeds() - 1);
                    hospitalRepository.save(h);
                }

                // Auto-assign top waiting patient at that hospital to newly freed bed
                patientRepository.findAll().stream()
                        .filter(p -> p.getHospitalId().equals(h.getId()) && p.getStatus() == PatientStatus.WAITING)
                        .findFirst()
                        .ifPresent(nextWaiting -> {
                            nextWaiting.setStatus(PatientStatus.ASSIGNED);
                            patientRepository.save(nextWaiting);
                            h.setUsedBeds(h.getUsedBeds() + 1);
                            hospitalRepository.save(h);
                        });
            });
        }

        return saved;
    }
}
