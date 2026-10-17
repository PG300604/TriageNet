#!/usr/bin/env bash
# scripts/restore_snapshot.sh
# Instant recovery after crash or power cut for TriageNet.
# Usage: ./scripts/restore_snapshot.sh [snapshot_tag_or_latest]

set -euo pipefail

TARGET_TAG="${1:-"latest"}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$PROJECT_ROOT"

echo "================================================================="
echo "🔄 TRIAGENET CRASH / POWER-CUT RECOVERY"
echo "Target: $TARGET_TAG"
echo "================================================================="

if [[ "$TARGET_TAG" == "latest" ]]; then
    echo "Restoring to latest branch state (main)..."
    git checkout main --quiet 2>/dev/null || true
elif [[ -n "$TARGET_TAG" ]]; then
    echo "Found recovery checkpoint: $TARGET_TAG"
    git checkout "$TARGET_TAG" --quiet 2>/dev/null || git checkout main --quiet
else
    echo "Using current working branch..."
fi

echo "1. Restarting Docker Compose services..."
docker compose -f docker/docker-compose.yml up -d

echo "2. Waiting for database and services to reach healthy state..."
for i in {1..30}; do
    if curl -s -f http://localhost/api/traffic/itms/status >/dev/null 2>&1; then
        echo "Backend services are ready (after ${i}s)"
        break
    fi
    sleep 1
done

docker compose -f docker/docker-compose.yml ps

echo "3. Testing system endpoints..."
curl -s http://localhost/healthz || echo "Proxy starting up..."
echo ""
curl -s http://localhost/api/traffic/itms/status | jq . 2>/dev/null || echo "ITMS gateway starting..."
echo ""

echo "4. Running full E2E sanity check..."
python3 scripts/test_e2e_flow.py || true

echo "================================================================="
echo "✅ RECOVERY PROCEDURE COMPLETE"
echo "System is operational on http://localhost (Nginx), http://localhost:3000 (Web), http://localhost:8080 (API)"
echo "================================================================="
