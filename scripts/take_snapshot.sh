#!/usr/bin/env bash
# scripts/take_snapshot.sh
# Automated crash-proof and power-cut snapshot utility for TriageNet.
# Usage: ./scripts/take_snapshot.sh "Step description"

set -euo pipefail

STEP_DESC="${1:-"Manual snapshot checkpoint"}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SNAPSHOT_TAG="snapshot-${TIMESTAMP}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$PROJECT_ROOT"

echo "================================================================="
echo "📸 TRIAGENET CRASH-PROOF STEP SNAPSHOT"
echo "Timestamp: $TIMESTAMP"
echo "Step:      $STEP_DESC"
echo "Tag:       $SNAPSHOT_TAG"
echo "================================================================="

# 1. Archive active Antigravity transcripts if present
mkdir -p .agents/sync/transcripts
BRAIN_DIR="${HOME}/.gemini/antigravity-cli/brain"
if [[ -d "$BRAIN_DIR" ]]; then
    # Find latest 2 transcripts
    find "$BRAIN_DIR" -name "transcript.jsonl" -type f 2>/dev/null | while read -r tf; do
        CID=$(echo "$tf" | awk -F'/brain/' '{print $2}' | cut -d'/' -f1)
        cp "$tf" ".agents/sync/transcripts/transcript_${CID}.jsonl" 2>/dev/null || true
    done
    echo "✔ Conversation transcripts archived in .agents/sync/transcripts/"
fi

# 2. Archive active Hermes sessions if SQLite db present
HERMES_DB="${HOME}/.hermes/state.db"
if [[ -f "$HERMES_DB" ]]; then
    python3 -c "
import sqlite3, json
try:
    conn = sqlite3.connect('$HERMES_DB')
    c = conn.cursor()
    sessions = []
    for row in c.execute('SELECT id, title, model, last_activity_at FROM sessions ORDER BY last_activity_at DESC LIMIT 10').fetchall():
        s_id, title, model, last_act = row
        msgs = c.execute('SELECT role, substr(content, 1, 300), timestamp FROM messages WHERE session_id=? ORDER BY timestamp ASC', (s_id,)).fetchall()
        sessions.append({'id': s_id, 'title': title, 'model': model, 'last_activity': last_act, 'messages_count': len(msgs)})
    with open('.agents/sync/hermes_sessions_summary.json', 'w') as f:
        json.dump(sessions, f, indent=2)
    print('✔ Hermes sessions snapshot saved to .agents/sync/hermes_sessions_summary.json')
except Exception as e:
    print('Hermes snapshot note:', e)
" || true
fi

# 3. Take database snapshot if PostgreSQL container is running
DB_BACKUP_NAME="triagenet_db_${TIMESTAMP}.sql.gz"
DB_BACKUP_PATH="backups/db/${DB_BACKUP_NAME}"
DB_STATUS="Not running (skipped)"
DB_SHA="N/A"

if docker ps --format '{{.Names}}' | grep -q "triagenet-db"; then
    mkdir -p backups/db
    bash scripts/backup_db.sh backups/db >/dev/null 2>&1 || true
    LATEST_DUMP=$(ls -t backups/db/triagenet_db_*.sql.gz 2>/dev/null | head -n 1 || true)
    if [[ -n "$LATEST_DUMP" && -f "$LATEST_DUMP" ]]; then
        DB_BACKUP_PATH="$LATEST_DUMP"
        DB_STATUS="Healthy (dump created)"
        if [[ -f "${LATEST_DUMP}.sha256" ]]; then
            DB_SHA=$(cut -d' ' -f1 "${LATEST_DUMP}.sha256")
        fi
        echo "✔ Database snapshot created: $DB_BACKUP_PATH"
    fi
fi

# 4. Check Container States
CONTAINERS_STATUS=$(docker compose -f docker/docker-compose.yml ps --format '{{.Service}}: {{.Status}}' 2>/dev/null | tr '\n' ', ' || echo "No docker compose active")

# 5. Git Commit & Tag Snapshot
git add -A
COMMIT_MSG="chore(snapshot): ${STEP_DESC} [${SNAPSHOT_TAG}]"
git commit -m "$COMMIT_MSG" --allow-empty >/dev/null
COMMIT_SHA=$(git rev-parse --short HEAD)
git tag -a "$SNAPSHOT_TAG" -m "Snapshot: ${STEP_DESC} at ${TIMESTAMP}"
echo "✔ Git commit $COMMIT_SHA created and tagged as $SNAPSHOT_TAG"

# 6. Append to SNAPSHOT_LEDGER.md
LEDGER_FILE=".agents/sync/SNAPSHOT_LEDGER.md"
if [[ ! -f "$LEDGER_FILE" ]]; then
    cat << 'EOF' > "$LEDGER_FILE"
# SNAPSHOT_LEDGER.md — TriageNet Crash & Power-Cut Recovery Checkpoints

> **Purpose**: Single chronological ledger of all saved steps. If an OS crash, VS Code freeze, or power outage occurs, locate the latest entry below to resume instantly.

| Timestamp | Step Description | Git Tag | Commit SHA | DB Snapshot | Containers |
| :--- | :--- | :--- | :--- | :--- | :--- |
EOF
fi

echo "| \`${TIMESTAMP}\` | ${STEP_DESC} | [\`${SNAPSHOT_TAG}\`](file://${PROJECT_ROOT}) | \`${COMMIT_SHA}\` | \`${DB_SHA:0:12}...\` | \`${CONTAINERS_STATUS}\` |" >> "$LEDGER_FILE"
echo "✔ Ledger updated in $LEDGER_FILE"

# Re-commit ledger
git add "$LEDGER_FILE"
git commit --amend --no-edit >/dev/null
COMMIT_SHA=$(git rev-parse --short HEAD)
git tag -f -a "$SNAPSHOT_TAG" -m "Snapshot: ${STEP_DESC} at ${TIMESTAMP}" >/dev/null

# 7. Push to GitHub remote for cloud offsite backup (survives local power cut / disk death)
if git remote | grep -q "origin"; then
    echo "Pushing snapshot to remote origin..."
    git push origin main --tags --quiet 2>/dev/null && echo "✔ Snapshot backed up to GitHub remote!" || echo "⚠ Remote push deferred (offline mode)"
fi

echo "================================================================="
echo "✅ SNAPSHOT COMPLETE: $SNAPSHOT_TAG ($COMMIT_SHA)"
echo "Resume command if machine crashes: ./scripts/restore_snapshot.sh $SNAPSHOT_TAG"
echo "================================================================="
