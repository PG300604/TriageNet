package com.triagenet.engine;

import com.triagenet.entity.Patient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Java implementation of the ML Logistic Regression Severity Model.
 * Calculates dynamic patient severity scores (0–100), risk tiers, sepsis warning alerts,
 * and explainable risk factor attributions derived from clinical vital signs.
 */
@Component
public class SeverityScorer {

    // Model weights trained in ml/train_severity_model.py
    private static final double W_SPO2 = 0.145;
    private static final double W_HR = 0.042;
    private static final double W_TEMP = 0.350;
    private static final double W_SYS_BP = 0.021;
    private static final double W_RESP_RATE = 0.065;
    private static final double W_AGE = 0.012;
    private static final double BIAS = 2.500;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClinicalVitals {
        @Builder.Default
        private double spo2 = 98.0;
        @Builder.Default
        private double heartRate = 75.0;
        @Builder.Default
        private double systolicBp = 120.0;
        @Builder.Default
        private double diastolicBp = 80.0;
        @Builder.Default
        private double temperature = 37.0;
        @Builder.Default
        private double respRate = 16.0;
        @Builder.Default
        private int age = 45;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeverityResult {
        private double score; // 0.0 to 100.0
        private String riskTier; // HIGH_RISK, MODERATE_RISK, LOW_RISK
        private boolean sepsisWarning;
        private String topFactor;
        private Map<String, Double> factorContributions;
    }

    public SeverityResult computeSeverity(ClinicalVitals vitals) {
        double spo2Dev = Math.max(0, (98.0 - vitals.getSpo2()) * 1.5);
        double hrDev = Math.abs(vitals.getHeartRate() - 75.0) * 0.8;
        double tempDev = Math.abs(vitals.getTemperature() - 37.0) * 10.0;
        double bpDev = Math.abs(vitals.getSystolicBp() - 120.0) * 0.5;
        double respDev = Math.abs(vitals.getRespRate() - 16.0) * 1.2;
        double ageDev = vitals.getAge() / 100.0;

        double cSpo2 = spo2Dev * W_SPO2;
        double cHr = hrDev * W_HR;
        double cTemp = tempDev * W_TEMP;
        double cBp = bpDev * W_SYS_BP;
        double cResp = respDev * W_RESP_RATE;
        double cAge = ageDev * W_AGE;

        double z = cSpo2 + cHr + cTemp + cBp + cResp + cAge + BIAS;
        double rawScore = Math.min(100.0, Math.max(10.0, Math.round((z * 10.0) * 10.0) / 10.0));

        // Risk Tier
        String riskTier;
        if (rawScore >= 80.0) {
            riskTier = "HIGH_RISK";
        } else if (rawScore >= 50.0) {
            riskTier = "MODERATE_RISK";
        } else {
            riskTier = "LOW_RISK";
        }

        // Sepsis Early Warning
        boolean sepsis = vitals.getSpo2() < 90.0 && vitals.getHeartRate() > 110.0;

        // Top contributing factor
        Map<String, Double> contribs = new HashMap<>();
        contribs.put("SpO2 Drop", cSpo2);
        contribs.put("Tachycardia / HR", cHr);
        contribs.put("Fever / Temp", cTemp);
        contribs.put("Blood Pressure", cBp);
        contribs.put("Tachypnea / Resp", cResp);

        String topFactor = contribs.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(e -> String.format("%s (%.1f%%)", e.getKey(), (e.getValue() / Math.max(0.001, z)) * 100))
                .orElse("General Baseline Triage");

        return SeverityResult.builder()
                .score(rawScore)
                .riskTier(riskTier)
                .sepsisWarning(sepsis)
                .topFactor(topFactor)
                .factorContributions(contribs)
                .build();
    }

    public SeverityResult computeSeverityFromPatient(Patient patient) {
        ClinicalVitals vitals = ClinicalVitals.builder()
                .spo2(patient.getSpo2() != null ? patient.getSpo2() : 98.0)
                .heartRate(patient.getHeartRate() != null ? patient.getHeartRate() : 75.0)
                .systolicBp(patient.getSystolicBp() != null ? patient.getSystolicBp() : 120.0)
                .age(patient.getAge() != null ? patient.getAge() : 45)
                .build();
        return computeSeverity(vitals);
    }
}
