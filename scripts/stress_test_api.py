#!/usr/bin/env python3
"""
TriageNet Stress / Rate-Limit API Validation Script
Benchmarks healthz + ITMS status endpoints and verifies RateLimitingFilter.
"""

import sys
import time
import statistics

import urllib.request
import urllib.error

try:
    import requests
    HAS_REQUESTS = True
except Exception:
    HAS_REQUESTS = False
    requests = None  # type: ignore

HEALTHZ_URL = "http://localhost/healthz"
ITMS_STATUS_URL = "http://localhost/api/traffic/itms/status"
DASHBOARD_URL = "http://localhost/api/dashboard/state-overview"
PING_COUNT = 10


def fetch_url(url, method="GET"):
    """Fetch a URL and return (status_code, headers_dict, body_str, latency_sec)."""
    start = time.perf_counter()
    if HAS_REQUESTS:
        try:
            resp = requests.request(method, url, timeout=10)  # type: ignore
            latency = time.perf_counter() - start
            return resp.status_code, dict(resp.headers), resp.text, latency
        except Exception as exc:
            latency = time.perf_counter() - start
            return None, {}, str(exc), latency
    else:
        try:
            req = urllib.request.Request(url, method=method)
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


def benchmark(url, label, pings=PING_COUNT):
    latencies = []
    errors = 0
    for i in range(pings):
        code, headers, body, latency = fetch_url(url)
        if code is not None:
            latencies.append(latency)
        else:
            errors += 1
    if latencies:
        avg_lat = statistics.mean(latencies)
        min_lat = min(latencies)
        max_lat = max(latencies)
    else:
        avg_lat = min_lat = max_lat = 0.0
    return {
        "label": label,
        "pings": pings,
        "errors": errors,
        "avg": avg_lat,
        "min": min_lat,
        "max": max_lat,
        "ok": errors == 0,
    }


def trigger_rate_limit():
    results = {
        "triggered": False,
        "status": None,
        "retry_after": None,
        "limit_header": None,
        "remaining_header": None,
        "requests_made": 0,
    }
    # Rapid-fire requests until 429 appears
    for i in range(500):
        code, headers, body, latency = fetch_url(DASHBOARD_URL)
        results["requests_made"] += 1
        if code == 429:
            results["triggered"] = True
            results["status"] = code
            # Headers may be case-insensitive
            for k, v in headers.items():
                kl = k.lower()
                if kl == "retry-after":
                    results["retry_after"] = v
                elif kl == "x-ratelimit-limit":
                    results["limit_header"] = v
                elif kl == "x-ratelimit-remaining":
                    results["remaining_header"] = v
            if results["retry_after"] is None:
                # Sometimes urllib returns header keys in Title-Case or lower; scan values manually
                for k, v in headers.items():
                    if "retry" in k.lower():
                        results["retry_after"] = v
            break
        elif code is None:
            # connection error; continue briefly
            pass
    return results


def format_table(benchmarks, rate_limit_result):
    lines = []
    lines.append("=" * 78)
    lines.append("TRIAGENET STRESS TEST RESULTS")
    lines.append("=" * 78)
    lines.append("")
    lines.append(f"{'Endpoint':<45} {'Pings':>6} {'Errors':>7} {'Min(s)':>10} {'Max(s)':>10} {'Avg(s)':>10} {'Status':>8}")
    lines.append("-" * 78)
    for b in benchmarks:
        status = "PASS" if b["ok"] else "FAIL"
        lines.append(
            f"{b['label']:<45} {b['pings']:>6} {b['errors']:>7} "
            f"{b['min']:>10.4f} {b['max']:>10.4f} {b['avg']:>10.4f} {status:>8}"
        )
    lines.append("-" * 78)
    lines.append("")
    lines.append("RATE LIMIT VALIDATION (RateLimitingFilter)")
    lines.append("-" * 78)
    lines.append(f"  Target endpoint        : {DASHBOARD_URL}")
    lines.append(f"  Requests made          : {rate_limit_result['requests_made']}")
    lines.append(f"  HTTP 429 triggered     : {'YES' if rate_limit_result['triggered'] else 'NO'}")
    lines.append(f"  HTTP status            : {rate_limit_result['status']}")
    lines.append(f"  Retry-After header     : {rate_limit_result['retry_after']}")
    lines.append(f"  X-RateLimit-Limit      : {rate_limit_result['limit_header']}")
    lines.append(f"  X-RateLimit-Remaining  : {rate_limit_result['remaining_header']}")
    lines.append("")
    if rate_limit_result["triggered"] and rate_limit_result["status"] == 429:
        checks = []
        if rate_limit_result["retry_after"] is not None:
            checks.append("Retry-After OK")
        else:
            checks.append("Retry-After MISSING")
        if rate_limit_result["limit_header"] is not None:
            checks.append("X-RateLimit-Limit OK")
        else:
            checks.append("X-RateLimit-Limit MISSING")
        if rate_limit_result["remaining_header"] is not None:
            checks.append("X-RateLimit-Remaining OK")
        else:
            checks.append("X-RateLimit-Remaining MISSING")
        lines.append(f"  Header verification    : {', '.join(checks)}")
        lines.append(f"  RateLimitFilter status: PASS" if all("OK" in c for c in checks) else f"  RateLimitFilter status: FAIL")
    else:
        lines.append("  RateLimitFilter status: FAIL (429 not triggered)")
    lines.append("=" * 78)
    return "\n".join(lines)


def main():
    print("Starting TriageNet stress + rate-limit validation...")
    print(f"Using endpoint: {HEALTHZ_URL} | {ITMS_STATUS_URL} | {DASHBOARD_URL}\n")

    benchmarks = [
        benchmark(HEALTHZ_URL, "GET /healthz"),
        benchmark(ITMS_STATUS_URL, "GET /api/traffic/itms/status"),
    ]

    rate_result = trigger_rate_limit()

    summary = format_table(benchmarks, rate_result)
    print(summary)

    # Exit with non-zero if anything failed
    all_ok = all(b["ok"] for b in benchmarks) and rate_result["triggered"]
    sys.exit(0 if all_ok else 1)


if __name__ == "__main__":
    main()
