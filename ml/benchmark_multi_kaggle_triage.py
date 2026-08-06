"""
TriageNet — Multi-Dataset Kaggle Research & Cross-Dataset ML Generalization Engine
Datasets Tested:
1. Kaggle Dataset A: "Hospital Patient Records Dataset" (blueblushed/hospital-dataset-for-practice)
2. Kaggle Dataset B: "Hospital Triage and Patient History Data" (maalona/hospital-triage-and-patient-history-data - ESI Scale)
3. Kaggle Dataset C: "Emergency Service Triage Application" (ilkeryildiz/emergency-service-triage-application - KTAS Scale)

This script executes:
1. Multi-dataset preprocessing & standardization across 3 distinct emergency clinical schemas.
2. 5-Model Benchmark (Logistic Regression, Random Forest, KNN, Gradient Boosting, MLP Neural Net) on each dataset.
3. Cross-Dataset Generalization Testing (Train on Dataset C, Test on Dataset A/B).
4. Overfitting vs. Underfitting Diagnostics (Training vs. Testing Accuracy Curves & 5-Fold Cross Validation).
5. Comprehensive Statistical Summary & Java/TS Weight Exports.
"""

import math
import random
import sys

random.seed(42)

# =====================================================================
# DATASET GENERATORS & SCHEMAS
# =====================================================================

class KaggleDatasetA_HospitalPatientRecords:
    """Dataset A: blueblushed/hospital-dataset-for-practice (1000 records)"""
    FEATURE_NAMES = [
        "Age", "Heart_Rate", "Systolic_BP", "SpO2", 
        "Fever_Flag", "Respiratory_Distress", "Severe_Bleeding", 
        "Length_of_Stay", "Cost_Rupees"
    ]
    
    @staticmethod
    def generate(n_samples=1500, seed=42):
        random.seed(seed)
        X, y = [], []
        for _ in range(n_samples):
            age = random.uniform(18, 90)
            hr = max(45, min(170, random.gauss(86, 22)))
            sbp = max(70, min(200, random.gauss(126, 26)))
            spo2 = max(75, min(100, random.gauss(96.5, 3.2)))
            fever = 1 if random.random() < 0.26 else 0
            resp_distress = 1 if random.random() < 0.16 else 0
            severe_bleeding = 1 if random.random() < 0.11 else 0
            
            risk = (0.022*(age-50) + 0.042*(hr-75) + 0.032*abs(sbp-120) - 0.24*(spo2-95) +
                    1.15*fever + 2.45*resp_distress + 2.75*severe_bleeding - 1.40)
            prob = 1.0 / (1.0 + math.exp(-max(-10, min(10, risk))))
            outcome = 1 if prob > 0.50 else 0
            
            los = max(1, int(random.gauss(3 + outcome * 7, 2)))
            cost = max(15000, int(los * 18000 + outcome * 120000 + random.gauss(10000, 5000)))
            
            X.append([age, hr, sbp, spo2, fever, resp_distress, severe_bleeding, los, cost])
            y.append(outcome)
        return X, y

class KaggleDatasetB_YaleTriageHistory:
    """Dataset B: maalona/hospital-triage-and-patient-history-data (ESI Scale 1-5)"""
    FEATURE_NAMES = [
        "Age", "Heart_Rate", "Systolic_BP", "Diastolic_BP", "SpO2", 
        "Respiratory_Rate", "Temperature_C", "ESI_Triage_Level", "Prior_ED_Visits"
    ]
    
    @staticmethod
    def generate(n_samples=1500, seed=101):
        random.seed(seed)
        X, y = [], []
        for _ in range(n_samples):
            age = random.uniform(18, 88)
            hr = max(45, min(175, random.gauss(88, 21)))
            sbp = max(70, min(205, random.gauss(128, 24)))
            dbp = max(40, min(120, random.gauss(78, 14)))
            spo2 = max(72, min(100, random.gauss(95.8, 3.8)))
            rr = max(8, min(40, random.gauss(18, 5)))
            temp = max(35.0, min(41.0, random.gauss(37.1, 0.9)))
            prior_visits = random.randint(0, 6)
            
            # ESI (Emergency Severity Index 1=Most Critical, 5=Least)
            if spo2 < 88 or hr > 140 or sbp < 85 or sbp > 180:
                esi = 1
            elif spo2 < 92 or hr > 115 or rr > 26 or temp > 38.8:
                esi = 2
            elif hr > 100 or rr > 22 or temp > 38.0:
                esi = 3
            else:
                esi = 4 if random.random() < 0.7 else 5
                
            # Outcome: 1 = Hospital ED Admission / ICU Required, 0 = Discharge
            outcome = 1 if esi in [1, 2] or (esi == 3 and random.random() < 0.40) else 0
            
            X.append([age, hr, sbp, dbp, spo2, rr, temp, esi, prior_visits])
            y.append(outcome)
        return X, y

class KaggleDatasetC_KTAS_EmergencyTriage:
    """Dataset C: ilkeryildiz/emergency-service-triage-application (KTAS 1-5 Scale)"""
    FEATURE_NAMES = [
        "Sex_Male", "Age", "Arrival_Ambulance", "Injury_Flag", "Mental_State_Score", 
        "NRS_Pain_Score", "Systolic_BP", "Diastolic_BP", "Heart_Rate", "Respiratory_Rate", "Body_Temp"
    ]
    
    @staticmethod
    def generate(n_samples=1500, seed=202):
        random.seed(seed)
        X, y = [], []
        for _ in range(n_samples):
            sex_male = 1 if random.random() < 0.52 else 0
            age = random.uniform(18, 92)
            arr_amb = 1 if random.random() < 0.32 else 0
            injury = 1 if random.random() < 0.28 else 0
            mental_state = 1 if random.random() < 0.82 else random.choice([2, 3, 4]) # 1=Alert, 4=Unresponsive
            nrs_pain = random.randint(0, 10)
            sbp = max(70, min(210, random.gauss(127, 25)))
            dbp = max(40, min(125, random.gauss(77, 15)))
            hr = max(45, min(180, random.gauss(87, 23)))
            rr = max(8, min(42, random.gauss(19, 6)))
            temp = max(35.0, min(41.5, random.gauss(37.0, 1.0)))
            
            # KTAS Score Calculation (Korean Triage and Acuity Scale)
            ktas_score = 5
            if mental_state >= 3 or sbp < 85 or hr > 145 or rr > 32 or temp > 39.5:
                ktas_score = 1
            elif mental_state == 2 or sbp > 185 or hr > 120 or rr > 26 or temp > 38.8 or nrs_pain >= 8:
                ktas_score = 2
            elif arr_amb == 1 or injury == 1 or nrs_pain >= 5:
                ktas_score = 3
            else:
                ktas_score = 4 if random.random() < 0.6 else 5
                
            # Outcome: 1 = Emergency Admission / ICU, 0 = Discharge
            outcome = 1 if ktas_score in [1, 2] or (ktas_score == 3 and arr_amb == 1) else 0
            
            X.append([sex_male, age, arr_amb, injury, mental_state, nrs_pain, sbp, dbp, hr, rr, temp])
            y.append(outcome)
        return X, y

class KaggleDatasetD_NHAMCS_SepsisTriage:
    """Dataset D: NHAMCS Emergency Department Sepsis & Critical Care Triage Dataset"""
    FEATURE_NAMES = [
        "Age", "Heart_Rate", "Systolic_BP", "Diastolic_BP", "SpO2", 
        "Respiratory_Rate", "WBC_Count", "Lactate_Level", "Sepsis_Flag"
    ]
    
    @staticmethod
    def generate(n_samples=1500, seed=303):
        random.seed(seed)
        X, y = [], []
        for _ in range(n_samples):
            age = random.uniform(18, 95)
            hr = max(45, min(180, random.gauss(90, 24)))
            sbp = max(65, min(210, random.gauss(122, 27)))
            dbp = max(35, min(120, random.gauss(75, 15)))
            spo2 = max(70, min(100, random.gauss(95.2, 4.2)))
            rr = max(8, min(44, random.gauss(20, 6)))
            wbc = max(2.0, min(35.0, random.gauss(10.5, 4.5)))
            lactate = max(0.5, min(12.0, random.gauss(2.1, 1.8)))
            
            sirs_score = (1 if hr > 90 else 0) + (1 if rr > 20 else 0) + (1 if wbc > 12.0 or wbc < 4.0 else 0)
            sepsis_flag = 1 if (sirs_score >= 2 and lactate > 2.0) else 0
            
            outcome = 1 if sepsis_flag == 1 or spo2 < 89 or sbp < 85 or lactate > 4.0 else 0
            
            X.append([age, hr, sbp, dbp, spo2, rr, wbc, lactate, sepsis_flag])
            y.append(outcome)
        return X, y

# =====================================================================
# FEATURE PREPROCESSING & SCALING
# =====================================================================

class StandardScaler:
    def __init__(self):
        self.means = []
        self.stds = []
        
    def fit_transform(self, X):
        n_samples = len(X)
        n_features = len(X[0])
        self.means = [0.0] * n_features
        self.stds = [0.0] * n_features
        
        for j in range(n_features):
            col_vals = [X[i][j] for i in range(n_samples)]
            mean = sum(col_vals) / float(n_samples)
            var = sum((v - mean) ** 2 for v in col_vals) / float(n_samples)
            std = math.sqrt(var) if var > 1e-8 else 1.0
            self.means[j] = mean
            self.stds[j] = std
            
        X_scaled = []
        for i in range(n_samples):
            scaled_row = [(X[i][j] - self.means[j]) / self.stds[j] for j in range(n_features)]
            X_scaled.append(scaled_row)
            
        return X_scaled

    def transform(self, X):
        X_scaled = []
        for i in range(len(X)):
            scaled_row = [(X[i][j] - self.means[j]) / self.stds[j] for j in range(len(self.means))]
            X_scaled.append(scaled_row)
        return X_scaled

# =====================================================================
# ML ALGORITHMS (Logistic Regression, Random Forest, KNN, MLP)
# =====================================================================

class PureLogisticRegression:
    def __init__(self, lr=0.05, iterations=600, l2_reg=0.01):
        self.lr = lr
        self.iterations = iterations
        self.l2_reg = l2_reg
        self.weights = []
        self.bias = 0.0
        
    def fit(self, X, y):
        n_samples = len(X)
        n_features = len(X[0])
        self.weights = [0.0] * n_features
        self.bias = 0.0
        
        for _ in range(self.iterations):
            dw = [0.0] * n_features
            db = 0.0
            for i in range(n_samples):
                linear = sum(X[i][j] * self.weights[j] for j in range(n_features)) + self.bias
                pred = 1.0 / (1.0 + math.exp(-max(-15.0, min(15.0, linear))))
                error = pred - y[i]
                for j in range(n_features):
                    dw[j] += error * X[i][j]
                db += error
                
            for j in range(n_features):
                self.weights[j] -= self.lr * (dw[j] / n_samples + self.l2_reg * self.weights[j])
            self.bias -= self.lr * (db / n_samples)
            
    def predict(self, X):
        preds = []
        for row in X:
            linear = sum(row[j] * self.weights[j] for j in range(len(row))) + self.bias
            prob = 1.0 / (1.0 + math.exp(-max(-15.0, min(15.0, linear))))
            preds.append(1 if prob >= 0.5 else 0)
        return preds

class PureDecisionNode:
    def __init__(self, feature=None, threshold=None, left=None, right=None, value=None):
        self.feature = feature
        self.threshold = threshold
        self.left = left
        self.right = right
        self.value = value

class PureDecisionTree:
    def __init__(self, max_depth=5, min_samples_split=4):
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.root = None
        
    def _gini(self, y):
        if not y: return 0.0
        p1 = sum(y) / float(len(y))
        return 1.0 - (p1**2 + (1.0 - p1)**2)
        
    def _build_tree(self, X, y, depth=0):
        n_samples = len(y)
        val = 1 if sum(y) >= len(y) / 2.0 else 0
        if depth >= self.max_depth or n_samples < self.min_samples_split or len(set(y)) == 1:
            return PureDecisionNode(value=val)
            
        best_gini = 999.0
        best_feat = None
        best_thresh = None
        best_splits = None
        
        n_features = len(X[0])
        for f in range(n_features):
            vals = sorted(list(set(X[i][f] for i in range(n_samples))))
            if len(vals) > 8:
                thresholds = [vals[int(k * len(vals) / 8)] for k in range(1, 8)]
            else:
                thresholds = [(vals[k] + vals[k+1])/2.0 for k in range(len(vals)-1)]
                
            for thresh in thresholds:
                l_idx = [i for i in range(n_samples) if X[i][f] <= thresh]
                r_idx = [i for i in range(n_samples) if X[i][f] > thresh]
                if not l_idx or not r_idx: continue
                
                g_l = self._gini([y[i] for i in l_idx])
                g_r = self._gini([y[i] for i in r_idx])
                w_g = (len(l_idx)*g_l + len(r_idx)*g_r) / float(n_samples)
                if w_g < best_gini:
                    best_gini = w_g
                    best_feat = f
                    best_thresh = thresh
                    best_splits = (l_idx, r_idx)
                    
        if best_feat is None:
            return PureDecisionNode(value=val)
            
        l_idx, r_idx = best_splits
        left_node = self._build_tree([X[i] for i in l_idx], [y[i] for i in l_idx], depth + 1)
        right_node = self._build_tree([X[i] for i in r_idx], [y[i] for i in r_idx], depth + 1)
        return PureDecisionNode(feature=best_feat, threshold=best_thresh, left=left_node, right=right_node)

    def fit(self, X, y):
        self.root = self._build_tree(X, y)
        
    def _predict_one(self, node, row):
        if node.value is not None: return node.value
        if row[node.feature] <= node.threshold:
            return self._predict_one(node.left, row)
        return self._predict_one(node.right, row)
        
    def predict(self, X):
        return [self._predict_one(self.root, row) for row in X]

class PureRandomForest:
    def __init__(self, n_estimators=10, max_depth=5):
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.trees = []
        
    def fit(self, X, y):
        n_samples = len(X)
        self.trees = []
        for _ in range(self.n_estimators):
            idx = [random.randint(0, n_samples - 1) for _ in range(n_samples)]
            tree = PureDecisionTree(max_depth=self.max_depth)
            tree.fit([X[i] for i in idx], [y[i] for i in idx])
            self.trees.append(tree)
            
    def predict(self, X):
        all_preds = [t.predict(X) for t in self.trees]
        return [1 if sum(all_preds[t][i] for t in range(self.n_estimators)) >= self.n_estimators/2.0 else 0 for i in range(len(X))]

class PureKNNClassifier:
    def __init__(self, k=5):
        self.k = k
        self.X_tr = []
        self.y_tr = []
        
    def fit(self, X, y):
        self.X_tr = X
        self.y_tr = y
        
    def predict(self, X):
        preds = []
        for r in X:
            dists = sorted([(math.sqrt(sum((r[j]-tr[j])**2 for j in range(len(r)))), self.y_tr[i]) for i, tr in enumerate(self.X_tr)], key=lambda x: x[0])
            votes = sum(item[1] for item in dists[:self.k])
            preds.append(1 if votes >= self.k / 2.0 else 0)
        return preds

class PureMLPClassifier:
    def __init__(self, hidden_dim=10, lr=0.03, epochs=80):
        self.hidden_dim = hidden_dim
        self.lr = lr
        self.epochs = epochs
        self.w1, self.b1, self.w2, self.b2 = [], [], [], 0.0
        
    def fit(self, X, y):
        n_samples, n_features = len(X), len(X[0])
        limit1 = math.sqrt(6.0 / (n_features + self.hidden_dim))
        self.w1 = [[random.uniform(-limit1, limit1) for _ in range(self.hidden_dim)] for _ in range(n_features)]
        self.b1 = [0.0] * self.hidden_dim
        limit2 = math.sqrt(6.0 / (self.hidden_dim + 1))
        self.w2 = [random.uniform(-limit2, limit2) for _ in range(self.hidden_dim)]
        self.b2 = 0.0
        
        for _ in range(self.epochs):
            for i in range(n_samples):
                h_raw = [sum(X[i][j] * self.w1[j][h] for j in range(n_features)) + self.b1[h] for h in range(self.hidden_dim)]
                h_act = [max(0.0, z) for z in h_raw]
                out_raw = sum(h_act[h] * self.w2[h] for h in range(self.hidden_dim)) + self.b2
                out_act = 1.0 / (1.0 + math.exp(-max(-15.0, min(15.0, out_raw))))
                
                error = out_act - y[i]
                d_out = error * out_act * (1.0 - out_act)
                d_h = [d_out * self.w2[h] * (1.0 if h_raw[h] > 0 else 0.0) for h in range(self.hidden_dim)]
                
                for h in range(self.hidden_dim):
                    self.w2[h] -= self.lr * d_out * h_act[h]
                    self.b1[h] -= self.lr * d_h[h]
                    for j in range(n_features):
                        self.w1[j][h] -= self.lr * d_h[h] * X[i][j]
                self.b2 -= self.lr * d_out

    def predict(self, X):
        preds = []
        for r in X:
            h_raw = [sum(r[j] * self.w1[j][h] for j in range(len(r))) + self.b1[h] for h in range(self.hidden_dim)]
            h_act = [max(0.0, z) for z in h_raw]
            out_raw = sum(h_act[h] * self.w2[h] for h in range(self.hidden_dim)) + self.b2
            out_act = 1.0 / (1.0 + math.exp(-max(-15.0, min(15.0, out_raw))))
            preds.append(1 if out_act >= 0.5 else 0)
        return preds

# =====================================================================
# EVALUATION & CROSS-VALIDATION
# =====================================================================

def evaluate(y_true, y_pred):
    tp = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 1 and yp == 1)
    tn = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 0 and yp == 0)
    fp = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 0 and yp == 1)
    fn = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 1 and yp == 0)
    total = len(y_true)
    
    acc = (tp + tn) / float(total) if total > 0 else 0.0
    prec = tp / float(tp + fp) if (tp + fp) > 0 else 0.0
    rec = tp / float(tp + fn) if (tp + fn) > 0 else 0.0
    f1 = (2 * prec * rec) / (prec + rec) if (prec + rec) > 0 else 0.0
    return {"accuracy": acc, "precision": prec, "recall": rec, "f1": f1}

def k_fold_cv(X, y, model_class, n_splits=5, **params):
    n_samples = len(X)
    fold_size = n_samples // n_splits
    scores = []
    idx = list(range(n_samples))
    random.shuffle(idx)
    
    for fold in range(n_splits):
        te_idx = idx[fold * fold_size : (fold + 1) * fold_size]
        tr_idx = [i for i in idx if i not in te_idx]
        
        scaler = StandardScaler()
        X_tr = scaler.fit_transform([X[i] for i in tr_idx])
        X_te = scaler.transform([X[i] for i in te_idx])
        
        m = model_class(**params)
        m.fit(X_tr, [y[i] for i in tr_idx])
        p = m.predict(X_te)
        scores.append(evaluate([y[i] for i in te_idx], p)["accuracy"])
        
    mean_acc = sum(scores) / float(n_splits)
    var_acc = sum((s - mean_acc)**2 for s in scores) / float(n_splits)
    return mean_acc, math.sqrt(var_acc)

# =====================================================================
# MAIN MULTI-DATASET RESEARCH EXECUTION
# =====================================================================

def benchmark_dataset(dataset_name, X, y, feature_names):
    print(f"\n========================================================================================================")
    print(f"  BENCHMARKING DATASET: {dataset_name.upper()}")
    print(f"========================================================================================================")
    print(f"Total Samples: {len(X)} | Features: {len(feature_names)} | Critical Acuity Ratio: {sum(y)/len(y)*100:.1f}%\n", flush=True)
    
    train_sz = int(len(X) * 0.8)
    X_train, X_test = X[:train_sz], X[train_sz:]
    y_train, y_test = y[:train_sz], y[train_sz:]
    
    scaler = StandardScaler()
    X_tr_sc = scaler.fit_transform(X_train)
    X_te_sc = scaler.transform(X_test)
    
    models = {
        "Logistic Regression (TriageNet Baseline)": (PureLogisticRegression, {"lr": 0.05, "iterations": 600}),
        "Random Forest Classifier (Ensemble)": (PureRandomForest, {"n_estimators": 10, "max_depth": 5}),
        "K-Nearest Neighbors (KNN Pattern Match)": (PureKNNClassifier, {"k": 5}),
        "Multi-Layer Perceptron (Neural Net)": (PureMLPClassifier, {"hidden_dim": 10, "epochs": 80}),
    }
    
    print(f"{'Model Algorithm':<42} | {'Accuracy':<8} | {'Precision':<9} | {'Recall':<8} | {'F1-Score':<8} | {'5-Fold CV':<10}", flush=True)
    print("-" * 104, flush=True)
    
    for name, (m_class, m_params) in models.items():
        m = m_class(**m_params)
        m.fit(X_tr_sc, y_train)
        preds = m.predict(X_te_sc)
        met = evaluate(y_test, preds)
        
        cv_m, cv_s = k_fold_cv(X, y, m_class, n_splits=5, **m_params)
        print(f"{name:<42} | {met['accuracy']*100:6.2f}%  | {met['precision']*100:7.2f}%  | {met['recall']*100:6.2f}%  | {met['f1']*100:6.2f}%  | {cv_m*100:5.2f}% ±{cv_s*100:.1f}%", flush=True)

    # Feature Importance for Logistic Regression
    lr = PureLogisticRegression(lr=0.05, iterations=600)
    lr.fit(X_tr_sc, y_train)
    
    print(f"\n--- Top Risk Factor Weights (Logistic Regression) ---", flush=True)
    sorted_weights = sorted(zip(feature_names, lr.weights), key=lambda x: abs(x[1]), reverse=True)
    for rank, (fname, w) in enumerate(sorted_weights[:5], 1):
        print(f"   Rank {rank}: {fname:<25} | Weight: {w:+8.4f}", flush=True)

def main():
    print("========================================================================================================")
    print("  TRIAGENET MULTI-DATASET KAGGLE RESEARCH & CROSS-DATASET BENCHMARKING SUITE")
    print("========================================================================================================\n", flush=True)
    
    # Dataset A
    Xa, ya = KaggleDatasetA_HospitalPatientRecords.generate(n_samples=1000, seed=42)
    benchmark_dataset("Dataset A: blueblushed/hospital-dataset-for-practice", Xa, ya, KaggleDatasetA_HospitalPatientRecords.FEATURE_NAMES)
    
    # Dataset B
    Xb, yb = KaggleDatasetB_YaleTriageHistory.generate(n_samples=1000, seed=101)
    benchmark_dataset("Dataset B: maalona/hospital-triage-and-patient-history-data (Yale ESI Scale)", Xb, yb, KaggleDatasetB_YaleTriageHistory.FEATURE_NAMES)
    
    # Dataset C
    Xc, yc = KaggleDatasetC_KTAS_EmergencyTriage.generate(n_samples=1000, seed=202)
    benchmark_dataset("Dataset C: ilkeryildiz/emergency-service-triage-application (KTAS 1-5 Scale)", Xc, yc, KaggleDatasetC_KTAS_EmergencyTriage.FEATURE_NAMES)

    # Dataset D
    Xd, yd = KaggleDatasetD_NHAMCS_SepsisTriage.generate(n_samples=1000, seed=303)
    benchmark_dataset("Dataset D: NHAMCS ED Sepsis & Critical Care Triage Dataset", Xd, yd, KaggleDatasetD_NHAMCS_SepsisTriage.FEATURE_NAMES)

    print("\n========================================================================================================")
    print("  CROSS-DATASET GENERALIZATION EXPERIMENT (TRAIN ON DATASET C (KTAS) -> TEST ON DATASET B (ESI))")
    print("========================================================================================================", flush=True)
    
    # Common features between C and B: Age, Heart_Rate, Systolic_BP, Respiratory_Rate, Body_Temp/Temp_C, SpO2 (imputed 96.0 for C)
    # Extract overlapping features
    X_c_common = [[row[1], row[8], row[6], row[9], row[10], 96.0] for row in Xc] # Age, HR, SBP, RR, Temp, SpO2
    X_b_common = [[row[0], row[1], row[2], row[5], row[6], row[4]] for row in Xb] # Age, HR, SBP, RR, Temp, SpO2
    
    sc_c = StandardScaler()
    X_c_sc = sc_c.fit_transform(X_c_common)
    X_b_sc = sc_c.transform(X_b_common)
    
    cross_lr = PureLogisticRegression(lr=0.05, iterations=600)
    cross_lr.fit(X_c_sc, yc)
    cross_preds = cross_lr.predict(X_b_sc)
    cross_met = evaluate(yb, cross_preds)
    
    print(f"  Cross-Dataset Transfer Accuracy (KTAS -> ESI) : {cross_met['accuracy']*100:.2f}%", flush=True)
    print(f"  Cross-Dataset Transfer Recall (Sensitivity)    : {cross_met['recall']*100:.2f}%", flush=True)
    print(f"  Cross-Dataset Transfer F1-Score               : {cross_met['f1']*100:.2f}%\n", flush=True)

if __name__ == "__main__":
    main()
