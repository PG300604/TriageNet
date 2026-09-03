package com.triagenet.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "shift_sessions", indexes = {
        @Index(name = "idx_shift_user_active", columnList = "user_id, active"),
        @Index(name = "idx_shift_expires", columnList = "expires_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShiftSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private StaffUser user;

    @Column(name = "shift_pin_hash", nullable = false, length = 128)
    private String shiftPinHash;

    @Column(name = "duration_hours", nullable = false)
    private int durationHours;

    @Column(name = "workstation_fingerprint", length = 255)
    private String workstationFingerprint;

    @CreationTimestamp
    @Column(name = "started_at", nullable = false, updatable = false)
    private LocalDateTime startedAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "is_locked", nullable = false)
    @Builder.Default
    private boolean isLocked = false;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private boolean active = true;

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
}
