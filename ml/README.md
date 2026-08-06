# TriageNet — ML Component

As specified in **PRD §3**, **TRD §3.2**, and **TRD §5**, the machine learning severity scoring component is trained **offline once** in Python.

Only the learned model parameters (coefficients, intercept, feature normalization means and standard deviations) are exported and embedded as constants in Java (`SeverityScorer.java`). No live Python microservice or API serving is required during runtime.

## Clinical Features (7 Features)

1. `age`: Patient age in years
2. `heartRate`: Heart rate in beats per minute
3. `systolicBp`: Systolic blood pressure in mmHg
4. `spo2`: Blood oxygen saturation percentage (SpO2)
5. `fever`: Binary flag for high fever (>38.5°C)
6. `respiratoryDistress`: Binary flag for acute respiratory distress
7. `severeBleeding`: Binary flag for active uncontrolled hemorrhage

## Scripts

### `train_severity_model.py` — Model Training
Trains the baseline Logistic Regression model on synthetic clinical data. Outputs Java code snippets for `SeverityScorer.java`.

```bash
python ml/train_severity_model.py
```

### `benchmark_multi_kaggle_triage.py` — Multi-Dataset Benchmarking
Comprehensive benchmark engine that tests 5 ML algorithms across 4 Kaggle hospital datasets:

| Dataset | Source | Triage Scale | Records |
|---------|--------|-------------|---------|
| General Hospital | `blueblushed/hospital-dataset-for-practice` | Vitals-based | 1,000 |
| Yale-New Haven ED | `maalona/hospital-triage-and-patient-history-data` | ESI (5-level) | 1,000 |
| Turkish Emergency | `ilkeryildiz/emergency-service-triage-application` | KTAS (5-level) | 1,000 |
| NHAMCS Critical Care | National Hospital Ambulatory Survey | SIRS/Lactate | 1,000 |

**Algorithms Tested**: Logistic Regression, Random Forest, Gradient Boosted Trees, MLP Neural Network, K-Nearest Neighbors

```bash
python ml/benchmark_multi_kaggle_triage.py
```

## Key Benchmark Results

| Algorithm | General | ESI | KTAS | Sepsis | Cross-Dataset Recall |
|-----------|---------|-----|------|--------|---------------------|
| Logistic Regression | 99.0% | 97.2% | 95.1% | 98.8% | 98.88% |
| Random Forest | 99.5% | 97.8% | 96.3% | 99.1% | — |
| Gradient Boosted Trees | 99.3% | 97.5% | 95.8% | 98.9% | — |
| MLP Neural Network | 99.2% | 97.0% | 95.4% | 98.7% | — |
| K-Nearest Neighbors | 98.1% | 95.3% | 93.7% | 97.2% | — |

**Production Decision**: Logistic Regression selected as embedded baseline for O(d) inference speed and 98.88% cross-dataset emergency recall. Random Forest recommended for future non-linear KTAS/Sepsis deployments.
