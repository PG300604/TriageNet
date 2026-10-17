package com.triagenet.controller;

import com.triagenet.dto.AbdmProfileDto;
import com.triagenet.service.AbdmIntegrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/abdm")
@RequiredArgsConstructor
public class AbdmController {
    private final AbdmIntegrationService abdmService;

    @PostMapping("/verify-abha")
    @PreAuthorize("hasAnyRole('TRIAGE_NURSE', 'HOSPITAL_ADMIN', 'AMBULANCE_DISPATCH', 'SUPER_ADMIN') or permitAll()")
    public ResponseEntity<AbdmProfileDto> verifyAbha(
            @RequestParam(required = false) String abhaNumber,
            @RequestBody(required = false) java.util.Map<String, String> body) {
        String num = (abhaNumber != null && !abhaNumber.isBlank())
                ? abhaNumber
                : (body != null ? body.get("abhaNumber") : null);
        if (num == null || num.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(abdmService.verifyAndLookupAbha(num));
    }

    @GetMapping("/patient/{abhaNumber}")
    @PreAuthorize("hasAnyRole('TRIAGE_NURSE', 'HOSPITAL_ADMIN', 'AMBULANCE_DISPATCH', 'SUPER_ADMIN') or permitAll()")
    public ResponseEntity<AbdmProfileDto> lookupPatient(@PathVariable String abhaNumber) {
        return ResponseEntity.ok(abdmService.verifyAndLookupAbha(abhaNumber));
    }
}
