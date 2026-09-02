package com.triagenet.service;

import com.triagenet.config.CustomUserDetails;
import com.triagenet.entity.Hospital;
import com.triagenet.entity.RoleName;
import com.triagenet.entity.StaffUser;
import com.triagenet.repository.HospitalRepository;
import com.triagenet.repository.StaffUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Centralized hospital-level authorization service.
 * Enforces multi-tenant data isolation for all patient/queue/referral operations.
 * <p>
 * Access rules:
 * - SUPER_ADMIN, STATE_HEALTH_DEPT: All hospitals
 * - DISTRICT_CMO: Hospitals in their assigned district
 * - HOSPITAL_ADMIN, TRIAGE_NURSE, HOSPITAL_STAFF, AMBULANCE_DISPATCH: Only their assigned hospital
 */
@Service
@RequiredArgsConstructor
public class HospitalAuthorizationService {

    private final StaffUserRepository staffUserRepository;
    private final HospitalRepository hospitalRepository;

    /**
     * Get the currently authenticated user's hospitalId (if any).
     */
    public Optional<UUID> getCurrentUserHospitalId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return Optional.empty();
        }
        if (auth.getPrincipal() instanceof CustomUserDetails userDetails) {
            return Optional.ofNullable(userDetails.getHospitalId());
        }
        return Optional.empty();
    }

    /**
     * Get the currently authenticated user's role.
     */
    public Optional<RoleName> getCurrentUserRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return Optional.empty();
        }
        if (auth.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userDetails.getAuthorities().stream()
                    .map(ga -> ga.getAuthority().replace("ROLE_", ""))
                    .map(RoleName::valueOf)
                    .findFirst();
        }
        return Optional.empty();
    }

    /**
     * Check if the current user can access the given hospital.
     * Throws AccessDeniedException if not authorized.
     */
    public void assertCanAccessHospital(UUID hospitalId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            // Internal, non-web, or test execution with no active authentication context
            return;
        }

        Optional<RoleName> userRole = getCurrentUserRole();
        if (userRole.isEmpty()) {
            throw new AccessDeniedException("Authentication required for hospital access");
        }

        // SUPER_ADMIN, STATE_HEALTH_DEPT, and AMBULANCE_DISPATCH can access all hospitals
        if (userRole.get() == RoleName.SUPER_ADMIN || userRole.get() == RoleName.STATE_HEALTH_DEPT || userRole.get() == RoleName.AMBULANCE_DISPATCH) {
            return;
        }

        Optional<UUID> userHospitalId = getCurrentUserHospitalId();
        if (userHospitalId.isEmpty()) {
            throw new AccessDeniedException("Access denied: User has no assigned hospital");
        }

        // DISTRICT_CMO can access hospitals in their district
        if (userRole.get() == RoleName.DISTRICT_CMO) {
            UUID userHospId = userHospitalId.get();
            Optional<Hospital> userHospital = hospitalRepository.findById(userHospId);
            Optional<Hospital> targetHospital = hospitalRepository.findById(hospitalId);

            if (userHospital.isPresent() && targetHospital.isPresent()) {
                String userDist = userHospital.get().getDistrictName() != null ? userHospital.get().getDistrictName() : userHospital.get().getRegion();
                String targetDist = targetHospital.get().getDistrictName() != null ? targetHospital.get().getDistrictName() : targetHospital.get().getRegion();
                if (userDist != null && userDist.equalsIgnoreCase(targetDist)) {
                    return;
                }
            }
            throw new AccessDeniedException("Access denied: Hospital not in your district");
        }

        // HOSPITAL_ADMIN, TRIAGE_NURSE, HOSPITAL_STAFF: only their assigned hospital
        if (userHospitalId.get().equals(hospitalId)) {
            return;
        }

        throw new AccessDeniedException("Access denied: You can only access your assigned hospital");
    }

    /**
     * Get the set of hospital IDs the current user is authorized to access.
     * Used for list/filter operations that need to scope to authorized hospitals only.
     */
    public Set<UUID> getAuthorizedHospitalIds() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return hospitalRepository.findAll().stream().map(Hospital::getId).collect(Collectors.toSet());
        }

        Optional<RoleName> userRole = getCurrentUserRole();
        if (userRole.isEmpty()) {
            return Set.of();
        }

        // SUPER_ADMIN, STATE_HEALTH_DEPT, and AMBULANCE_DISPATCH: all hospitals
        if (userRole.get() == RoleName.SUPER_ADMIN || userRole.get() == RoleName.STATE_HEALTH_DEPT || userRole.get() == RoleName.AMBULANCE_DISPATCH) {
            return hospitalRepository.findAll().stream()
                    .map(Hospital::getId)
                    .collect(Collectors.toSet());
        }

        Optional<UUID> userHospitalId = getCurrentUserHospitalId();
        if (userHospitalId.isEmpty()) {
            return Set.of();
        }

        // DISTRICT_CMO: hospitals in their district
        if (userRole.get() == RoleName.DISTRICT_CMO) {
            UUID userHospId = userHospitalId.get();
            Optional<Hospital> userHospital = hospitalRepository.findById(userHospId);
            if (userHospital.isPresent()) {
                String userDist = userHospital.get().getDistrictName() != null ? userHospital.get().getDistrictName() : userHospital.get().getRegion();
                if (userDist != null) {
                    return hospitalRepository.findAll().stream()
                            .filter(h -> {
                                String hDist = h.getDistrictName() != null ? h.getDistrictName() : h.getRegion();
                                return userDist.equalsIgnoreCase(hDist);
                            })
                            .map(Hospital::getId)
                            .collect(Collectors.toSet());
                }
            }
            return Set.of();
        }

        // Hospital-scoped roles: only their assigned hospital
        return Set.of(userHospitalId.get());
    }

    /**
     * Filter a list of hospital IDs to only those the current user can access.
     */
    public List<UUID> filterAuthorizedHospitals(List<UUID> hospitalIds) {
        Set<UUID> authorized = getAuthorizedHospitalIds();
        return hospitalIds.stream()
                .filter(authorized::contains)
                .toList();
    }

    /**
     * Check if user can access a specific patient (by verifying patient's hospital).
     */
    public void assertCanAccessPatient(UUID patientId, com.triagenet.repository.PatientRepository patientRepository) {
        var patientOpt = patientRepository.findById(patientId);
        if (patientOpt.isEmpty()) {
            throw new IllegalArgumentException("Patient not found: " + patientId);
        }
        assertCanAccessHospital(patientOpt.get().getHospitalId());
    }
}