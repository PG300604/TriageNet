package com.triagenet.repository;

import com.triagenet.entity.LoginAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, UUID> {

    Optional<LoginAttempt> findByEmailIgnoreCase(String email);

    @Transactional
    void deleteByEmailIgnoreCase(String email);

    List<LoginAttempt> findByLockExpiresAtAfter(Instant now);

    @Modifying
    @Transactional
    @Query("DELETE FROM LoginAttempt l WHERE l.lockExpiresAt IS NOT NULL AND l.lockExpiresAt < :now")
    void deleteExpiredLocks(@Param("now") Instant now);
}
