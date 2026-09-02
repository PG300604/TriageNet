package com.triagenet.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "hospitals", indexes = {
    @Index(name = "idx_hosp_district", columnList = "district_name"),
    @Index(name = "idx_hosp_region", columnList = "region")
})
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

    @Column(name = "district_name", length = 100)
    private String districtName;

    @Column(name = "facility_tier", length = 50)
    private String facilityTier; // TERTIARY, DISTRICT, SUB_DIVISIONAL, CHC

    @Column(name = "total_general_beds")
    private Integer totalGeneralBeds;

    @Column(name = "available_general_beds")
    private Integer availableGeneralBeds;

    @Column(name = "total_icu_beds")
    private Integer totalIcuBeds;

    @Column(name = "available_icu_beds")
    private Integer availableIcuBeds;

    @Column(name = "has_ventilator")
    private Boolean hasVentilator;

    @Column(name = "has_trauma_surgery")
    private Boolean hasTraumaSurgery;

    @Column(name = "has_blood_bank")
    private Boolean hasBloodBank;

    @Column(name = "has_oxygen_generator")
    private Boolean hasOxygenGenerator;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Convenience getters
    public Integer getBedsTotal() { return totalBeds != null ? totalBeds : (totalGeneralBeds != null ? totalGeneralBeds : 100); }
    public Integer getBedsUsed() { return usedBeds != null ? usedBeds : 0; }
    public Integer getVentsTotal() { return totalVentilators != null ? totalVentilators : 10; }
    public Integer getVentsUsed() { return usedVentilators != null ? usedVentilators : 0; }
    public Integer getSpecialistsTotal() { return totalSpecialists != null ? totalSpecialists : 5; }
    public Integer getSpecialistsUsed() { return usedSpecialists != null ? usedSpecialists : 0; }
}

