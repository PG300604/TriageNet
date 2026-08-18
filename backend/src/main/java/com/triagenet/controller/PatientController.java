package com.triagenet.controller;

import com.triagenet.engine.SeverityScorer;
import com.triagenet.entity.Patient;
import com.triagenet.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping
    @PreAuthorize("hasAnyRole('TRIAGE_NURSE', 'HOSPITAL_STAFF', 'HOSPITAL_ADMIN', 'DISTRICT_CMO', 'STATE_HEALTH_DEPT', 'SUPER_ADMIN')")
    public ResponseEntity<List<Patient>> getAllPatients() {
        return ResponseEntity.ok(patientService.getAllPatients());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('TRIAGE_NURSE', 'HOSPITAL_STAFF', 'HOSPITAL_ADMIN', 'DISTRICT_CMO', 'STATE_HEALTH_DEPT', 'SUPER_ADMIN')")
    public ResponseEntity<Patient> getPatientById(@PathVariable UUID id) {
        return ResponseEntity.ok(patientService.getPatientById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TRIAGE_NURSE', 'HOSPITAL_STAFF', 'HOSPITAL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Patient> registerPatient(@RequestBody Patient patient) {
        return ResponseEntity.ok(patientService.registerPatient(patient));
    }

    @PostMapping("/{id}/evaluate-vitals")
    @PreAuthorize("hasAnyRole('TRIAGE_NURSE', 'HOSPITAL_STAFF', 'HOSPITAL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<SeverityScorer.SeverityResult> evaluateVitals(
            @PathVariable UUID id,
            @RequestBody SeverityScorer.ClinicalVitals vitals) {
        return ResponseEntity.ok(patientService.evaluateVitals(id, vitals));
    }

    @PostMapping("/score-vitals")
    public ResponseEntity<SeverityScorer.SeverityResult> scoreVitalsStandalone(
            @RequestBody SeverityScorer.ClinicalVitals vitals) {
        return ResponseEntity.ok(patientService.getSeverityScorer().computeSeverity(vitals));
    }

    @PostMapping("/{id}/discharge")
    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN', 'TRIAGE_NURSE', 'HOSPITAL_STAFF', 'SUPER_ADMIN')")
    public ResponseEntity<Patient> dischargePatient(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "Treatment Completed") String reason) {
        return ResponseEntity.ok(patientService.dischargePatient(id, reason));
    }
}

