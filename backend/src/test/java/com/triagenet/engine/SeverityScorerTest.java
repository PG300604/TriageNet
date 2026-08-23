package com.triagenet.engine;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SeverityScorerTest {

    private SeverityScorer scorer;

    @BeforeEach
    void setUp() {
        scorer = new SeverityScorer();
    }

    @Test
    void testNormalVitalsProducesLowRiskScore() {
        SeverityScorer.ClinicalVitals normal = SeverityScorer.ClinicalVitals.builder()
                .spo2(98.0)
                .heartRate(72.0)
                .systolicBp(120.0)
                .diastolicBp(80.0)
                .temperature(37.0)
                .respRate(16.0)
                .age(30)
                .build();

        SeverityScorer.SeverityResult result = scorer.computeSeverity(normal);

        assertNotNull(result);
        assertTrue(result.getScore() >= 10.0 && result.getScore() < 50.0, "Score should be Low Risk");
        assertEquals("LOW_RISK", result.getRiskTier());
        assertFalse(result.isSepsisWarning());
    }

    @Test
    void testSevereSpO2DropProducesHighRiskAndSepsisAlert() {
        SeverityScorer.ClinicalVitals severe = SeverityScorer.ClinicalVitals.builder()
                .spo2(72.0)
                .heartRate(125.0)
                .systolicBp(95.0)
                .diastolicBp(60.0)
                .temperature(37.5)
                .respRate(28.0)
                .age(68)
                .build();

        SeverityScorer.SeverityResult result = scorer.computeSeverity(severe);

        assertNotNull(result);
        assertTrue(result.getScore() >= 80.0, "Score should be High Risk (>= 80)");
        assertEquals("HIGH_RISK", result.getRiskTier());
        assertTrue(result.isSepsisWarning(), "Sepsis alert should trigger for SpO2 < 90 & HR > 110");
        assertTrue(result.getTopFactor().contains("SpO2"), "Top factor should identify SpO2 Drop");
    }

    @Test
    void testSanitizedVitalsClampsImpossibleValues() {
        SeverityScorer.ClinicalVitals absurd = SeverityScorer.ClinicalVitals.builder()
                .spo2(-500.0)
                .heartRate(99999.0)
                .systolicBp(-10.0)
                .diastolicBp(1000.0)
                .temperature(15.0)
                .respRate(300.0)
                .age(999)
                .build();

        SeverityScorer.ClinicalVitals clean = absurd.sanitized();
        assertEquals(SeverityScorer.ClinicalVitals.SPO2_MIN, clean.getSpo2());
        assertEquals(SeverityScorer.ClinicalVitals.HR_MAX, clean.getHeartRate());
        assertEquals(SeverityScorer.ClinicalVitals.SBP_MIN, clean.getSystolicBp());
        assertEquals(SeverityScorer.ClinicalVitals.DBP_MAX, clean.getDiastolicBp());
        assertEquals(SeverityScorer.ClinicalVitals.TEMP_MIN, clean.getTemperature());
        assertEquals(SeverityScorer.ClinicalVitals.RESP_MAX, clean.getRespRate());
        assertEquals(SeverityScorer.ClinicalVitals.AGE_MAX, clean.getAge());

        SeverityScorer.SeverityResult result = scorer.computeSeverity(absurd);
        assertNotNull(result);
        assertTrue(result.getScore() <= 100.0 && result.getScore() >= 10.0, "Score should remain bounded [10, 100]");
    }
}
