package com.triagenet.repository;

import com.triagenet.entity.OxygenTelemetry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OxygenTelemetryRepository extends JpaRepository<OxygenTelemetry, UUID> {
    List<OxygenTelemetry> findByHospitalIdOrderByRecordedAtDesc(UUID hospitalId);
    Optional<OxygenTelemetry> findFirstByHospitalIdOrderByRecordedAtDesc(UUID hospitalId);
    List<OxygenTelemetry> findByAlertTriggeredTrueOrderByRecordedAtDesc();
}
