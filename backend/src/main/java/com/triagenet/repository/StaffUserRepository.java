package com.triagenet.repository;

import com.triagenet.entity.StaffUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StaffUserRepository extends JpaRepository<StaffUser, UUID> {
    Optional<StaffUser> findByEmail(String email);
    boolean existsByEmail(String email);
    List<StaffUser> findByHospitalId(UUID hospitalId);

    Optional<StaffUser> findByStaffId(String staffId);
    Optional<StaffUser> findByStaffIdOrEmail(String staffId, String email);
    boolean existsByStaffId(String staffId);

    List<StaffUser> findByHospitalIdAndStatus(UUID hospitalId, StaffUser.UserStatus status);
    List<StaffUser> findByStatus(StaffUser.UserStatus status);
}
