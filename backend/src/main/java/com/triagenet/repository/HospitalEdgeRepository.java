package com.triagenet.repository;

import com.triagenet.entity.HospitalEdge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface HospitalEdgeRepository extends JpaRepository<HospitalEdge, UUID> {
    List<HospitalEdge> findByFromHospitalId(UUID fromHospitalId);
}
