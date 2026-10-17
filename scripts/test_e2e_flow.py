#!/usr/bin/env python3
"""
TriageNet End-to-End Sanity Flow
Runs 8 automated checks against http://localhost and exits 0 only if all pass.
"""

import json
import sys
import time
import urllib.request
import urllib.error

try:
    import requests
    HAS_REQUESTS = True
except Exception:
    HAS_REQUESTS = False
    requests = None  # type: ignore

BASE = "http://localhost"
RESULTS = []


def call(url, method="GET", payload=None, headers=None):
    start = time.perf_counter()
    try:
        if HAS_REQUESTS:
            if payload is not None:
                if isinstance(payload, dict):
                    payload = json.dumps(payload)
                resp = requests.request(
                    method, url, data=payload,
                    headers={"Content-Type": "application/json", **(headers or {})},
                    timeout=10
                )
            else:
                resp = requests.request(method, url, headers=headers, timeout=10)
            latency = time.perf_counter() - start
            return resp.status_code, resp.headers, resp.text, latency
        else:
            data = None
            if payload is not None:
                if isinstance(payload, dict):
                    data = json.dumps(payload).encode("utf-8")
                else:
                    data = payload.encode("utf-8") if isinstance(payload, str) else payload
            req = urllib.request.Request(url, data=data, method=method)
            req.add_header("Content-Type", "application/json")
            if headers:
                for k, v in headers.items():
                    req.add_header(k, v)
            with urllib.request.urlopen(req, timeout=10) as resp:
                latency = time.perf_counter() - start
                body = resp.read().decode("utf-8", errors="replace")
                return resp.status, dict(resp.headers), body, latency
    except urllib.error.HTTPError as exc:
        latency = time.perf_counter() - start
        body = exc.read().decode("utf-8", errors="replace") if exc.fp else ""
        return exc.code, dict(exc.headers), body, latency
    except Exception as exc:
        latency = time.perf_counter() - start
        return None, {}, str(exc), latency


def record(step, name, url, ok, detail, latency, status_code=None):
    RESULTS.append({
        "step": step,
        "name": name,
        "url": url,
        "ok": ok,
        "detail": detail,
        "latency": latency,
        "status_code": status_code,
    })
    return ok


def main():
    all_ok = True

    # 1. Healthcheck
    code, _, body, lat = call(f"{BASE}/healthz")
    ok = (code == 200) and ("ok" in body.lower() or "healthy" in body.lower() or code is not None)
    all_ok &= record(1, "Healthcheck", f"{BASE}/healthz", ok, f"status={code}", lat, code)

    # 2. State Overview (asserts 111 hospitals seeded)
    code, _, body, lat = call(f"{BASE}/api/dashboard/state-overview")
    try:
        data = json.loads(body) if body else {}
        hospitals = data.get("totalHospitals", data.get("totalHospitals", 0))
    except Exception:
        data = {}
        hospitals = 0
    ok = (code == 200) and (hospitals == 111)
    all_ok &= record(2, "State Overview", f"{BASE}/api/dashboard/state-overview", ok,
                     f"hospitals={hospitals} (expect 111)", lat, code)

    # 3. Scoring Engine
    vitals = {
        "spo2": 94.0,
        "heartRate": 115.0,
        "systolicBp": 135.0,
        "diastolicBp": 85.0,
        "temperature": 38.2,
        "respRate": 22.0,
        "age": 62,
    }
    code, _, body, lat = call(f"{BASE}/api/patients/score-vitals", method="POST", payload=vitals)
    try:
        result = json.loads(body) if body else {}
        score = result.get("score")
    except Exception:
        score = None
    ok = (code == 200) and (score is not None)
    all_ok &= record(3, "Scoring Engine", f"{BASE}/api/patients/score-vitals", ok,
                     f"score={score}", lat, code)

    # 4. ITMS Traffic Gateway
    code, _, body, lat = call(f"{BASE}/api/traffic/itms/status")
    ok = False
    if code == 200:
        try:
            itms = json.loads(body)
            ok = itms.get("status") == "CONNECTED"
        except Exception:
            ok = "CONNECTED" in body
    all_ok &= record(4, "ITMS Traffic Gateway", f"{BASE}/api/traffic/itms/status", ok,
                     f"status={body[:120] if body else 'empty'}", lat, code)

    # 5. Traffic Preemption
    preempt_payload = {
        "ambulanceNumber": "JH-108-001",
        "destinationHospitalName": "RIMS Ranchi",
        "corridorName": "NH-33 Green Corridor",
        "currentLat": 23.3441,
        "currentLng": 85.3096,
        "speedKmph": 72.0,
        "priorityTier": "CODE_RED_CRITICAL",
        "acuityScore": 92.5,
    }
    code, _, body, lat = call(f"{BASE}/api/traffic/preemption/activate", method="POST", payload=preempt_payload)
    active_ok = False
    if code == 200:
        try:
            status_dto = json.loads(body)
            active_ok = status_dto.get("active") is True or status_dto.get("status") == "ACTIVE" or "ACTIVE" in body
        except Exception:
            active_ok = "ACTIVE" in body or "corridor" in body.lower()
    all_ok &= record(5, "Traffic Preemption (activate)", f"{BASE}/api/traffic/preemption/activate", active_ok,
                     f"activated={active_ok} code={code}", lat, code)

    # Verify corridor active
    code, _, body, lat = call(f"{BASE}/api/traffic/preemption/corridors")
    corridor_active = False
    if code == 200:
        try:
            corridors = json.loads(body)
            corridor_active = len(corridors) > 0 if isinstance(corridors, list) else "JH-108-001" in body
        except Exception:
            corridor_active = len(body) > 10
    # Release
    code_rel, _, body_rel, lat_rel = call(f"{BASE}/api/traffic/preemption/JH-108-001/release", method="POST")
    release_ok = (code_rel == 200)
    # Combine step 5: activate + verify + release
    ok5 = active_ok and corridor_active and release_ok
    # Overwrite the last record entry for step 5 with combined result
    RESULTS[-1] = {
        "step": 5,
        "name": "Traffic Preemption",
        "url": f"{BASE}/api/traffic/preemption/activate + release",
        "ok": ok5,
        "detail": f"activate={active_ok} corridor_active={corridor_active} release={release_ok}",
        "latency": lat + lat_rel,
        "status_code": code,
    }
    all_ok = all(r["ok"] for r in RESULTS)

    # 6. ABDM Integration
    code, _, body, lat = call(
        f"{BASE}/api/abdm/verify-abha?abhaNumber=12-3456-7890-1234",
        method="POST"
    )
    ok = False
    name = ""
    try:
        profile = json.loads(body)
        name = profile.get("fullName", "")
        ok = (code == 200) and ("Birsa" in name) and profile.get("verified") is True
    except Exception:
        ok = (code == 200) and ("Birsa" in body)
    # Overwrite previous step if it was overwritten incorrectly; just append fresh
    all_ok &= record(6, "ABDM Integration", f"{BASE}/api/abdm/verify-abha", ok,
                     f"profile_name={name or body[:80]}", lat, code)

    # Recalc
    all_ok = all(r["ok"] for r in RESULTS)

    # 7. IoT Oxygen Telemetry
    telemetry_payload = {
        "hospitalId": "11111111-1111-1111-1111-111111111111",
        "psaOxygenPurity": 99.2,
        "lmoTankPressureBar": 14.5,
        "flowRateLpm": 15.0,
        "capacityPercent": 78.5,
    }
    code, _, body, lat = call(f"{BASE}/api/iot/oxygen-telemetry", method="POST", payload=telemetry_payload)
    ok = (code in (200, 201))
    all_ok &= record(7, "IoT Oxygen Telemetry", f"{BASE}/api/iot/oxygen-telemetry", ok,
                     f"status={code}", lat, code)
    all_ok = all(r["ok"] for r in RESULTS)

    # 8. Mobile OTA Version
    code, _, body, lat = call(f"{BASE}/api/app/version")
    try:
        ver_data = json.loads(body)
        version = ver_data.get("latestVersion", ver_data.get("version", ""))
    except Exception:
        version = ""
    ok = (code == 200) and (version == "1.3.0")
    all_ok &= record(8, "Mobile OTA Version", f"{BASE}/api/app/version", ok,
                     f"version={version or body[:80]}", lat, code)

    # Final summary
    all_ok = all(r["ok"] for r in RESULTS)
    print("=" * 72)
    print("TRIAGENET END-TO-END SANITY FLOW SUMMARY")
    print("=" * 72)
    print(f"{'#':>3} {'Check':<28} {'Status':>6} {'Latency(s)':>11} {'Detail':<30}")
    print("-" * 72)
    for r in RESULTS:
        status = "PASS" if r["ok"] else "FAIL"
        detail = r["detail"][:28] if len(r["detail"]) > 28 else r["detail"]
        print(f"{r['step']:>3} {r['name']:<28} {status:>6} {r['latency']:>11.3f} {detail:<30}")
    print("-" * 72)
    passed = sum(1 for r in RESULTS if r["ok"])
    total = len(RESULTS)
    print(f"Result: {passed}/{total} passed")
    print("=" * 72)
    sys.exit(0 if all_ok else 1)


if __name__ == "__main__":
    main()
