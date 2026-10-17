#!/usr/bin/env python3
"""Keep-alive health ping script for TriageNet.

Configurable via TARGET_URL (comma-separated URLs). Defaults to:
  - http://localhost/healthz
  - http://localhost/api/traffic/itms/status

Logs status code and latency with timeout and retry.
"""
import os
import sys
import time
import urllib.request
from urllib.error import URLError

DEFAULT_URLS = [
    "http://localhost/healthz",
    "http://localhost/api/traffic/itms/status",
]
TIMEOUT = int(os.getenv("PING_TIMEOUT", "10"))
RETRIES = int(os.getenv("PING_RETRIES", "3"))


def ping(url: str, timeout: int, retries: int) -> tuple[int, float]:
    last_exc = Exception("No attempts made")
    for attempt in range(1, retries + 1):
        start = time.perf_counter()
        try:
            req = urllib.request.Request(url, method="GET")
            req.add_header("User-Agent", "TriageNet-keep-alive/1.0")
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                latency = (time.perf_counter() - start) * 1000
                return resp.status, latency
        except Exception as exc:
            last_exc = exc
            latency = (time.perf_counter() - start) * 1000
            print(f"[{url}] attempt {attempt}/{retries} failed: {exc} (latency {latency:.2f}ms)")
            if attempt < retries:
                time.sleep(1)
    raise last_exc


def main():
    raw = os.getenv("TARGET_URL", "").strip()
    urls = [u.strip() for u in raw.split(",") if u.strip()] if raw else DEFAULT_URLS
    print(f"Keep-alive ping to {len(urls)} endpoint(s): {urls}")
    all_ok = True
    for url in urls:
        try:
            status, latency = ping(url, TIMEOUT, RETRIES)
            print(f"[OK] {url} -> HTTP {status} ({latency:.2f}ms)")
        except Exception as exc:
            print(f"[FAIL] {url} -> {exc}")
            all_ok = False
    sys.exit(0 if all_ok else 1)


if __name__ == "__main__":
    main()
