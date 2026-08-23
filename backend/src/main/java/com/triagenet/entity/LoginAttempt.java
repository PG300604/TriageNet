package com.triagenet.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "login_attempts", indexes = {
    @Index(name = "idx_login_attempts_email", columnList = "email"),
    @Index(name = "idx_login_attempts_lock_expires", columnList = "lock_expires_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "attempt_count", nullable = false)
    private int attemptCount;

    @Column(name = "last_attempt_at", nullable = false)
    private Instant lastAttemptAt;

    @Column(name = "lock_expires_at")
    private Instant lockExpiresAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
