#!/usr/bin/env python3
"""Verify system integrity across districts, env templates, and frontend routes."""

import json
import os
import sys

# Colors
PASS = "\033[92m[PASS]\033[0m"
FAIL = "\033[91m[FAIL]\033[0m"


def check_districts_parity():
    label = "Districts Parity"
    # Read districts from scripts/jharkhand-hospitals.json
    json_path = "scripts/jharkhand-hospitals.json"
    java_path = "backend/src/main/java/com/triagenet/service/HospitalSeedService.java"

    try:
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"{FAIL} {label}: Could not read {json_path}: {e}")
        return False

    districts_json = list(data.get("districts", {}).keys())
    count_json = len(districts_json)

    try:
        with open(java_path, "r", encoding="utf-8") as f:
            java_content = f.read()
    except Exception as e:
        print(f"{FAIL} {label}: Could not read {java_path}: {e}")
        return False

    # The Java service reads seed/jharkhand-hospitals.json and seeds districts.
    # Verify it references district seeding and the seed file.
    has_seed_ref = "jharkhand-hospitals.json" in java_content
    has_district_ref = "District" in java_content and "districtRepository" in java_content

    # Since the Java file reads from the JSON directly, check that there are
    # exactly 24 districts in JSON and the Java service handles district seeding.
    if count_json == 24 and has_seed_ref and has_district_ref:
        print(f"{PASS} {label}: {count_json} districts in JSON match HospitalSeedService.java (seed reference + district repository present).")
        return True
    else:
        details = []
        if count_json != 24:
            details.append(f"JSON has {count_json} districts (expected 24)")
        if not has_seed_ref:
            details.append("Java missing seed file reference")
        if not has_district_ref:
            details.append("Java missing District/districtRepository reference")
        print(f"{FAIL} {label}: {', '.join(details)}.")
        return False


def check_env_template_parity():
    label = "Env Template Parity"
    env_example_path = ".env.example"
    env_prod_path = ".env.production.example"

    def extract_keys(path):
        keys = set()
        try:
            with open(path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#"):
                        continue
                    if "=" in line:
                        key = line.split("=", 1)[0].strip()
                        if key:
                            keys.add(key)
        except Exception as e:
            print(f"{FAIL} {label}: Could not read {path}: {e}")
            return None
        return keys

    keys_example = extract_keys(env_example_path)
    keys_prod = extract_keys(env_prod_path)
    if keys_example is None or keys_prod is None:
        return False

    missing = keys_example - keys_prod
    if not missing:
        print(f"{PASS} {label}: All {len(keys_example)} keys from {env_example_path} present in {env_prod_path}.")
        return True
    else:
        missing_list = sorted(missing)
        print(f"{FAIL} {label}: {len(missing_list)} key(s) from {env_example_path} missing in {env_prod_path}: {', '.join(missing_list)}.")
        return False


def check_route_integrity():
    label = "Route Integrity"
    expected_routes = [
        "/",
        "/login",
        "/dashboard",
        "/ambulance",
        "/portal",
        "/simulator",
        "/downloads",
        "/onboarding",
        "/control",
        "/recovery",
    ]
    missing = []
    for route in expected_routes:
        if route == "/":
            file_path = os.path.join("frontend", "app", "page.tsx")
        else:
            sub = route.lstrip("/")
            file_path = os.path.join("frontend", "app", sub, "page.tsx")
        if not os.path.isfile(file_path):
            missing.append(route)

    if not missing:
        print(f"{PASS} {label}: All {len(expected_routes)} expected routes exist under frontend/app/.")
        return True
    else:
        print(f"{FAIL} {label}: Missing routes: {', '.join(missing)}.")
        return False


def main():
    results = []
    results.append(check_districts_parity())
    results.append(check_env_template_parity())
    results.append(check_route_integrity())

    print("-" * 50)
    all_pass = all(results)
    if all_pass:
        print("Overall: All checks passed.")
    else:
        failed = sum(1 for r in results if not r)
        print(f"Overall: {failed} check(s) failed.")

    sys.exit(0 if all_pass else 1)


if __name__ == "__main__":
    main()
