package com.triagenet.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "hospitals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hospital {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "short_code", length = 20)
    private String shortCode;

    @Column(nullable = false, length = 100)
    private String region;

    @Column(nullable = false)
    private Double lat;

    @Column(nullable = false)
    private Double lng;

    @Column(name = "total_beds", nullable = false)
    private Integer totalBeds;

    @Column(name = "used_beds")
    @Builder.Default
    private Integer usedBeds = 0;

    @Column(name = "total_ventilators", nullable = false)
    private Integer totalVentilators;

    @Column(name = "used_ventilators")
    @Builder.Default
    private Integer usedVentilators = 0;

    @Column(name = "total_specialists", nullable = false)
    private Integer totalSpecialists;

    @Column(name = "used_specialists")
    @Builder.Default
    private Integer usedSpecialists = 0;

    @Column(name = "icu_capacity_ratio")
    private Double icuiCapacityRatio;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Convenience getters
    public Integer getBedsTotal() { return totalBeds; }
    public Integer getBedsUsed() { return usedBeds != null ? usedBeds : 0; }
    public Integer getVentsTotal() { return totalVentilators; }
    public Integer getVentsUsed() { return usedVentilators != null ? usedVentilators : 0; }
    public Integer getSpecialistsTotal() { return totalSpecialists; }
    public Integer getSpecialistsUsed() { return usedSpecialists != null ? usedSpecialists : 0; }
}
