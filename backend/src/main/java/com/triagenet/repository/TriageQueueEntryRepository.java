package com.triagenet.repository;

import com.triagenet.entity.TriageQueueEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TriageQueueEntryRepository extends JpaRepository<TriageQueueEntry, UUID> {
    List<TriageQueueEntry> findByHospitalIdOrderByEffectivePriorityDesc(UUID hospitalId);
    Optional<TriageQueueEntry> findByPatientId(UUID patientId);
    void deleteByPatientId(UUID patientId);
}
