package com.triagenet.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "severity_scores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeverityScore {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(nullable = false)
    private Double score;

    @Column(name = "contributing_factors", columnDefinition = "TEXT")
    private String contributingFactors;

    @CreationTimestamp
    @Column(name = "computed_at", nullable = false, updatable = false)
    private LocalDateTime computedAt;
}
