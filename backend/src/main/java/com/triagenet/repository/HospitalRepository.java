package com.triagenet.repository;

import com.triagenet.entity.Hospital;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, UUID> {
    List<Hospital> findByRegion(String region);
    List<Hospital> findByDistrictNameIgnoreCase(String districtName);

    @org.springframework.data.jpa.repository.Query("SELECT h FROM Hospital h WHERE LOWER(h.districtName) = LOWER(:district) OR LOWER(h.region) = LOWER(:district)")
    List<Hospital> findByDistrictOrRegionIgnoreCase(@org.springframework.data.repository.query.Param("district") String district);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT h FROM Hospital h WHERE h.id = :id")
    Optional<Hospital> findByIdWithLock(@Param("id") UUID id);
}
