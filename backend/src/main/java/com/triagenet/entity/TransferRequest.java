package com.triagenet.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "transfer_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransferRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "from_hospital_id", nullable = false)
    private UUID fromHospitalId;

    @Column(name = "to_hospital_id", nullable = false)
    private UUID toHospitalId;

    @Enumerated(EnumType.STRING)
    @Column(name = "routing_algorithm", nullable = false, length = 50)
    private RoutingAlgorithm routingAlgorithm;

    @Column(name = "computed_cost", nullable = false)
    private Double computedCost;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private TransferStatus status;

    @CreationTimestamp
    @Column(name = "requested_at", nullable = false, updatable = false)
    private LocalDateTime requestedAt;
}
