package com.triagenet.repository;

import com.triagenet.entity.TransferRequest;
import com.triagenet.entity.TransferStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TransferRequestRepository extends JpaRepository<TransferRequest, UUID> {
    List<TransferRequest> findByFromHospitalId(UUID fromHospitalId);
    List<TransferRequest> findByToHospitalId(UUID toHospitalId);
    List<TransferRequest> findByStatus(TransferStatus status);
}
