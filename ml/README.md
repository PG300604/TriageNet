# TriageNet — ML Component (Offline Model Training)

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

## Running the Training Script

```bash
python ml/train_severity_model.py
```

Outputs Java code snippets that can be pasted directly into `com.triagenet.engine.SeverityScorer`.
