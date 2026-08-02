package com.triagenet.repository;

import com.triagenet.entity.Resource;
import com.triagenet.entity.ResourceStatus;
import com.triagenet.entity.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, UUID> {
    List<Resource> findByHospitalId(UUID hospitalId);
    List<Resource> findByHospitalIdAndStatus(UUID hospitalId, ResourceStatus status);
    List<Resource> findByHospitalIdAndTypeAndStatus(UUID hospitalId, ResourceType type, ResourceStatus status);
    long countByHospitalIdAndTypeAndStatus(UUID hospitalId, ResourceType type, ResourceStatus status);
}
