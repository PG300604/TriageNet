package com.triagenet.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "oxygen_telemetry", indexes = {
    @Index(name = "idx_oxygen_hospital", columnList = "hospital_id"),
    @Index(name = "idx_oxygen_alert", columnList = "alert_triggered")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OxygenTelemetry {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "psa_oxygen_purity", nullable = false)
    private Double psaOxygenPurity; // e.g. 94.5%

    @Column(name = "lmo_tank_pressure_bar", nullable = false)
    private Double lmoTankPressureBar; // e.g. 4.6 bar

    @Column(name = "flow_rate_lpm", nullable = false)
    private Double flowRateLpm; // e.g. 180 LPM

    @Column(name = "capacity_percent", nullable = false)
    private Double capacityPercent; // e.g. 78%

    @Column(name = "alert_triggered", nullable = false)
    private Boolean alertTriggered;

    @Column(name = "alert_severity", length = 20)
    private String alertSeverity; // NORMAL, WARNING, CRITICAL

    @CreationTimestamp
    @Column(name = "recorded_at", nullable = false, updatable = false)
    private LocalDateTime recordedAt;
}
