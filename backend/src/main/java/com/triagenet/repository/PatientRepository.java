package com.triagenet.repository;

import com.triagenet.entity.Patient;
import com.triagenet.entity.PatientStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {
    List<Patient> findByHospitalId(UUID hospitalId);
    List<Patient> findByHospitalIdAndStatus(UUID hospitalId, PatientStatus status);
    List<Patient> findByStatus(PatientStatus status);
}
