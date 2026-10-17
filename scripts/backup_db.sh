#!/usr/bin/env bash
# scripts/backup_db.sh
# Production-grade PostgreSQL backup for TriageNet.
# Supports docker container (triagenet-db) or local postgres.
# Usage: ./scripts/backup_db.sh [backup_dir]

set -euo pipefail

# ------------------------------------------------------------------
# Config
# ------------------------------------------------------------------
BACKUP_DIR="${1:-${BACKUP_DIR:-/tmp/triagenet_backups}}"
DB_CONTAINER="${DB_CONTAINER:-triagenet-db}"
DB_NAME="${DB_NAME:-triagenet}"
DB_USER="${DB_USER:-triagenet}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_PASSWORD="${DB_PASSWORD:-}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/triagenet_db_${TIMESTAMP}.sql"
COMPRESSED_FILE="${BACKUP_FILE}.gz"
CHECKSUM_FILE="${COMPRESSED_FILE}.sha256"

# ------------------------------------------------------------------
# Logging
# ------------------------------------------------------------------
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------
require_dir() {
    if [[ ! -d "$BACKUP_DIR" ]]; then
        mkdir -p "$BACKUP_DIR"
        log "Created backup directory: $BACKUP_DIR"
    fi
}

# ------------------------------------------------------------------
# Backup execution
# ------------------------------------------------------------------
run_backup() {
    log "Starting TriageNet DB backup..."
    log "Target: container=${DB_CONTAINER}, db=${DB_NAME}, user=${DB_USER}, host=${DB_HOST}, port=${DB_PORT}"
    log "Backup file: $COMPRESSED_FILE"

    # Determine pg_dump source
    if command -v docker >/dev/null 2>&1 && docker ps --format '{{.Names}}' | grep -qE "^${DB_CONTAINER}$"; then
        log "Detected running docker container: ${DB_CONTAINER}"
        docker exec -e PGPASSWORD="${DB_PASSWORD}" "${DB_CONTAINER}" \
            pg_dump -U "${DB_USER}" -d "${DB_NAME}" -Fc --no-owner --no-privileges --clean \
            | gzip > "$COMPRESSED_FILE"
    else
        log "Using local/host pg_dump (container not found or docker unavailable)"
        if [[ -z "${DB_PASSWORD}" && -f ".env" ]]; then
            DB_PASSWORD=$(grep '^DB_PASSWORD=' .env 2>/dev/null | cut -d '=' -f2- | tr -d '"\' || true)
        fi
        export PGPASSWORD="${DB_PASSWORD:-}"
        pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
            --no-owner --no-privileges --clean | gzip > "$COMPRESSED_FILE"
    fi

    log "Compressed backup written: $COMPRESSED_FILE ($(du -h "$COMPRESSED_FILE" | cut -f1))"
}

# ------------------------------------------------------------------
# Checksum
# ------------------------------------------------------------------
compute_checksum() {
    sha256sum "$COMPRESSED_FILE" | awk '{print $1}' > "$CHECKSUM_FILE"
    log "SHA-256 checksum saved: $(cat "$CHECKSUM_FILE")"
    log "Checksum file: $CHECKSUM_FILE"
}

# ------------------------------------------------------------------
# Retention cleanup (older than RETENTION_DAYS)
# ------------------------------------------------------------------
cleanup_old_backups() {
    log "Running retention cleanup: removing backups older than ${RETENTION_DAYS} days..."
    local removed=0
    while IFS= read -r -d '' file; do
        rm -f "$file" "${file}.sha256"
        log "Removed old backup: $file"
        ((removed++)) || true
    done < <(find "$BACKUP_DIR" -maxdepth 1 -type f \( -name 'triagenet_db_*.sql.gz' -o -name 'triagenet_db_*.sql.gz.sha256' \) -mtime +"${RETENTION_DAYS}" -print0 2>/dev/null || true)
    if [[ $removed -gt 0 ]]; then
        log "Cleaned up ${removed} old backup file(s)."
    else
        log "No backups older than ${RETENTION_DAYS} days found."
    fi
}

# ------------------------------------------------------------------
# Main
# ------------------------------------------------------------------
main() {
    require_dir
    run_backup
    compute_checksum
    cleanup_old_backups
    log "Backup complete. File: $COMPRESSED_FILE | Checksum: $CHECKSUM_FILE"
}

main "$@"
