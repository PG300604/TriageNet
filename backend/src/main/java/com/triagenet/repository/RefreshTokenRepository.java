package com.triagenet.repository;

import com.triagenet.entity.RefreshToken;
import com.triagenet.entity.StaffUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    List<RefreshToken> findByUserAndRevokedAtIsNull(StaffUser user);

    @Modifying
    @Query("UPDATE RefreshToken r SET r.revokedAt = :now WHERE r.user = :user AND r.revokedAt IS NULL")
    void revokeAllForUser(@Param("user") StaffUser user, @Param("now") LocalDateTime now);

    @Modifying
    @Query("DELETE FROM RefreshToken r WHERE r.expiresAt < :now")
    void deleteExpiredBefore(@Param("now") LocalDateTime now);
}
