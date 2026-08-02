package com.triagenet.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "patients", indexes = {
    @Index(name = "idx_patient_hosp_status", columnList = "hospital_id, status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false)
    private Integer age;

    @Column(name = "presenting_complaint", nullable = false, length = 255)
    private String presentingComplaint;

    @Column(name = "heart_rate")
    private Double heartRate;

    @Column(name = "systolic_bp")
    private Double systolicBp;

    @Column(name = "spo2")
    private Double spo2;

    @Column(name = "blood_type", length = 10)
    private String bloodType;

    @Column(name = "required_specialty", length = 100)
    private String requiredSpecialty;

    @CreationTimestamp
    @Column(name = "admitted_at", nullable = false, updatable = false)
    private LocalDateTime admittedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private PatientStatus status;
}
