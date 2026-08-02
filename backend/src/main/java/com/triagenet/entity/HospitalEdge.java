package com.triagenet.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "hospital_edges", indexes = {
    @Index(name = "idx_edge_from_hospital", columnList = "from_hospital_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HospitalEdge {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "from_hospital_id", nullable = false)
    private UUID fromHospitalId;

    @Column(name = "to_hospital_id", nullable = false)
    private UUID toHospitalId;

    @Column(name = "transfer_time_minutes", nullable = false)
    private Double transferTimeMinutes;

    @Column(name = "distance_km", nullable = false)
    private Double distanceKm;
}
