package com.triagenet.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "triage_queue_entries", indexes = {
    @Index(name = "idx_queue_hosp_eff_priority", columnList = "hospital_id, effective_priority DESC")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TriageQueueEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "base_severity", nullable = false)
    private Double baseSeverity;

    @Column(name = "effective_priority", nullable = false)
    private Double effectivePriority;

    @CreationTimestamp
    @Column(name = "entered_queue_at", nullable = false, updatable = false)
    private LocalDateTime enteredQueueAt;

    @UpdateTimestamp
    @Column(name = "last_recomputed_at", nullable = false)
    private LocalDateTime lastRecomputedAt;
}
