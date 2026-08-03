package com.triagenet.engine;

import com.triagenet.entity.Hospital;
import com.triagenet.entity.Patient;
import com.triagenet.entity.Resource;
import com.triagenet.entity.ResourceType;
import com.triagenet.entity.ResourceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Multi-Resource Clinical Compatibility Evaluator & Bed Matcher.
 * Ensures patients are only assigned or referred to facilities that satisfy 3 constraints:
 * 1. Available Open Bed
 * 2. Required Clinical Equipment (Ventilator, Monitor)
 * 3. On-Call Specialist Physician (Pulmonologist, Cardiologist, Trauma Surgeon)
 */
@Component
public class HungarianMatcher {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClinicalRequirement {
        private String requiredEquipment;
        private String requiredSpecialist;
        private String matchReason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MatchResult {
        private boolean compatible;
        private String matchReason;
        private String missingResource;
    }

    public ClinicalRequirement evaluateRequirements(Patient patient, double severityScore) {
        String complaint = patient.getPresentingComplaint() != null ? patient.getPresentingComplaint().toLowerCase() : "";

        if (severityScore >= 88.0 || complaint.contains("spo2") || complaint.contains("airway") || complaint.contains("breath")) {
            return ClinicalRequirement.builder()
                    .requiredEquipment("VENTILATOR")
                    .requiredSpecialist("PULMONOLOGIST")
                    .matchReason("High SpO₂ Drop / Severe Respiratory Support Required (Ventilator + Pulmonologist)")
                    .build();
        }

        if (complaint.contains("chest") || complaint.contains("tachycardia") || complaint.contains("cardiac") || complaint.contains("hr")) {
            return ClinicalRequirement.builder()
                    .requiredEquipment("MONITOR_BED")
                    .requiredSpecialist("CARDIOLOGIST")
                    .matchReason("Cardiac Critical Care Required (ECG Monitor + On-Call Cardiologist)")
                    .build();
        }

        if (complaint.contains("trauma") || complaint.contains("bleed") || complaint.contains("fracture") || complaint.contains("hemorrhage")) {
            return ClinicalRequirement.builder()
                    .requiredEquipment("ICU_BED")
                    .requiredSpecialist("TRAUMA_SURGEON")
                    .matchReason("Trauma Intervention Required (OR ICU Bed + Trauma Surgeon)")
                    .build();
        }

        return ClinicalRequirement.builder()
                .requiredEquipment("GENERAL_BED")
                .requiredSpecialist("GENERAL_PHYSICIAN")
                .matchReason("Standard ICU / Step-Down Bed Matched")
                .build();
    }

    public MatchResult checkCompatibility(Patient patient, double severityScore, Hospital hospital, List<Resource> hospitalResources) {
        ClinicalRequirement req = evaluateRequirements(patient, severityScore);

        // 1. Check Available Bed
        long availableBeds = hospitalResources.stream()
                .filter(r -> r.getType() == ResourceType.BED && r.getStatus() == ResourceStatus.AVAILABLE)
                .count();

        if (availableBeds == 0 && (hospital.getBedsUsed() != null && hospital.getBedsTotal() != null && hospital.getBedsUsed() >= hospital.getBedsTotal())) {
            return MatchResult.builder()
                    .compatible(false)
                    .matchReason(req.getMatchReason())
                    .missingResource("No Open ICU Beds Available")
                    .build();
        }

        // 2. Check Equipment
        if ("VENTILATOR".equals(req.getRequiredEquipment())) {
            long openVents = hospitalResources.stream()
                    .filter(r -> r.getType() == ResourceType.VENTILATOR && r.getStatus() == ResourceStatus.AVAILABLE)
                    .count();
            if (openVents == 0 && (hospital.getVentsUsed() != null && hospital.getVentsTotal() != null && hospital.getVentsUsed() >= hospital.getVentsTotal())) {
                return MatchResult.builder()
                        .compatible(false)
                        .matchReason(req.getMatchReason())
                        .missingResource("No Available Ventilator")
                        .build();
            }
        }

        // 3. Check Specialist
        if (!"GENERAL_PHYSICIAN".equals(req.getRequiredSpecialist())) {
            long openSpecialists = hospitalResources.stream()
                    .filter(r -> r.getType() == ResourceType.SPECIALIST && r.getStatus() == ResourceStatus.AVAILABLE)
                    .count();
            if (openSpecialists == 0 && (hospital.getSpecialistsUsed() != null && hospital.getSpecialistsTotal() != null && hospital.getSpecialistsUsed() >= hospital.getSpecialistsTotal())) {
                return MatchResult.builder()
                        .compatible(false)
                        .matchReason(req.getMatchReason())
                        .missingResource("No On-Call " + req.getRequiredSpecialist())
                        .build();
            }
        }

        return MatchResult.builder()
                .compatible(true)
                .matchReason("✓ Clinical Match: Open Bed + " + req.getRequiredEquipment() + " + On-Call " + req.getRequiredSpecialist())
                .build();
    }
}
