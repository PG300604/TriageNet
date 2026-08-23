package com.triagenet.repository;

import com.triagenet.entity.Patient;
import com.triagenet.entity.PatientStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {
    List<Patient> findByHospitalId(UUID hospitalId);
    List<Patient> findByHospitalIdAndStatus(UUID hospitalId, PatientStatus status);
    List<Patient> findByStatus(PatientStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Patient p WHERE p.hospitalId = :hospitalId AND p.status = :status ORDER BY p.admittedAt ASC")
    List<Patient> findWaitingPatientsForUpdate(@Param("hospitalId") UUID hospitalId, @Param("status") PatientStatus status);
}
