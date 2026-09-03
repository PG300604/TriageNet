package com.triagenet.repository;

import com.triagenet.entity.ShiftSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShiftSessionRepository extends JpaRepository<ShiftSession, UUID> {

    Optional<ShiftSession> findFirstByUserIdAndActiveTrueOrderByStartedAtDesc(UUID userId);

    List<ShiftSession> findByUserIdAndActiveTrue(UUID userId);

    List<ShiftSession> findByExpiresAtBeforeAndActiveTrue(LocalDateTime now);
}
