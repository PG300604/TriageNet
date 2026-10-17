#!/usr/bin/env bash
# =============================================================================
# TriageNet — OCI Always Free ARM Staging Deployment Script
# =============================================================================
# Target: Oracle Cloud Infrastructure (OCI) Always Free Tier
#         4 ARM Ampere A1 OCPUs / 24 GB RAM / 200 GB Block Storage
# Stack:  PostgreSQL 16 + Redis 7 + Spring Boot 3.3.13 + Next.js 16.4.1
#         + Nginx reverse proxy with Certbot TLS (Let's Encrypt)
#
# Usage:
#   ./scripts/deploy.sh setup     — First-time server provisioning
#   ./scripts/deploy.sh deploy    — Build, push, and deploy the stack
#   ./scripts/deploy.sh ssl       — Obtain/renew Let's Encrypt TLS certificate
#   ./scripts/deploy.sh status    — Show running container health
#   ./scripts/deploy.sh logs      — Tail aggregated container logs
#   ./scripts/deploy.sh rollback  — Roll back to previous image tags
#   ./scripts/deploy.sh backup    — Backup PostgreSQL database
#   ./scripts/deploy.sh restore   — Restore PostgreSQL from backup
#   ./scripts/deploy.sh clean     — Prune unused Docker resources
#
# Prerequisites:
#   - SSH access to OCI ARM instance (key-based auth)
#   - Docker Engine 24+ and Docker Compose v2+ on the remote host
#   - A domain name pointed (A record) to the OCI instance public IP
#
# Environment Variables (set in .env or export before running):
#   DEPLOY_HOST       — SSH host (e.g. ubuntu@129.153.x.x)
#   DEPLOY_DIR        — Remote deployment directory (default: ~/triagenet)
#   DEPLOY_DOMAIN     — Production domain (e.g. triagenet.example.com)
#   DEPLOY_EMAIL      — Email for Let's Encrypt certificate registration
#   DEPLOY_SSH_KEY    — Path to SSH private key (default: ~/.ssh/oci_arm_key)
#   DOCKER_REGISTRY   — Container registry (default: ghcr.io/pg300604)
#   IMAGE_TAG         — Image tag (default: latest)
# =============================================================================

set -euo pipefail

# --- Color Output ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

log_info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
log_success() { echo -e "${GREEN}[OK]${NC}    $*"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; }
log_header()  { echo -e "\n${BOLD}══════════════════════════════════════════════${NC}"; echo -e "${BOLD}  $*${NC}"; echo -e "${BOLD}══════════════════════════════════════════════${NC}\n"; }

# --- Project Root Detection ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# --- Load .env if present ---
if [[ -f "${PROJECT_ROOT}/.env" ]]; then
    # shellcheck disable=SC1091
    set -a; source "${PROJECT_ROOT}/.env"; set +a
    log_info "Loaded environment from ${PROJECT_ROOT}/.env"
fi

# --- Configuration Defaults ---
DEPLOY_HOST="${DEPLOY_HOST:-}"
DEPLOY_DIR="${DEPLOY_DIR:-~/triagenet}"
DEPLOY_DOMAIN="${DEPLOY_DOMAIN:-}"
DEPLOY_EMAIL="${DEPLOY_EMAIL:-}"
DEPLOY_SSH_KEY="${DEPLOY_SSH_KEY:-${HOME}/.ssh/oci_arm_key}"
DOCKER_REGISTRY="${DOCKER_REGISTRY:-ghcr.io/pg300604}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
BACKUP_DIR="${PROJECT_ROOT}/backups"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"

# --- SSH Helper ---
ssh_cmd() {
    ssh -i "${DEPLOY_SSH_KEY}" -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10 "${DEPLOY_HOST}" "$@"
}

scp_cmd() {
    scp -i "${DEPLOY_SSH_KEY}" -o StrictHostKeyChecking=accept-new "$@"
}

# --- Validation ---
require_var() {
    local var_name="$1"
    local var_value="${!var_name:-}"
    if [[ -z "${var_value}" ]]; then
        log_error "Required variable ${var_name} is not set."
        log_error "Set it in .env or export ${var_name}=value before running this script."
        exit 1
    fi
}

require_deploy_vars() {
    require_var "DEPLOY_HOST"
}

require_ssl_vars() {
    require_var "DEPLOY_HOST"
    require_var "DEPLOY_DOMAIN"
    require_var "DEPLOY_EMAIL"
}

# =============================================================================
# COMMAND: setup — First-time server provisioning
# =============================================================================
cmd_setup() {
    log_header "First-Time Server Setup"
    require_deploy_vars

    log_info "Connecting to ${DEPLOY_HOST}..."

    ssh_cmd bash -s <<'REMOTE_SETUP'
set -euo pipefail

echo "[1/6] Updating system packages..."
sudo apt-get update -qq && sudo apt-get upgrade -y -qq

echo "[2/6] Installing Docker Engine..."
if ! command -v docker &>/dev/null; then
    curl -fsSL https://get.docker.com | sudo sh
    sudo usermod -aG docker "$USER"
    echo "  Docker installed. You may need to reconnect for group changes."
else
    echo "  Docker already installed: $(docker --version)"
fi

echo "[3/6] Installing Docker Compose plugin..."
if ! docker compose version &>/dev/null; then
    sudo apt-get install -y -qq docker-compose-plugin
else
    echo "  Docker Compose already installed: $(docker compose version)"
fi

echo "[4/6] Installing Certbot for Let's Encrypt TLS..."
if ! command -v certbot &>/dev/null; then
    sudo apt-get install -y -qq certbot
else
    echo "  Certbot already installed: $(certbot --version)"
fi

echo "[5/6] Configuring firewall (iptables allow 80, 443, 22)..."
sudo iptables -C INPUT -p tcp --dport 80 -j ACCEPT 2>/dev/null || sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -C INPUT -p tcp --dport 443 -j ACCEPT 2>/dev/null || sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -C INPUT -p tcp --dport 22 -j ACCEPT 2>/dev/null || sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT

echo "[6/6] Creating deployment directory..."
mkdir -p ~/triagenet/backups ~/triagenet/certbot/conf ~/triagenet/certbot/www

echo ""
echo "=== Server setup complete ==="
echo "Docker:  $(docker --version 2>/dev/null || echo 'needs reconnect')"
echo "Compose: $(docker compose version 2>/dev/null || echo 'needs reconnect')"
echo "Certbot: $(certbot --version 2>/dev/null || echo 'not found')"
REMOTE_SETUP

    log_success "Server provisioning complete."
    log_info "If Docker was just installed, reconnect SSH for group changes: ssh -i ${DEPLOY_SSH_KEY} ${DEPLOY_HOST}"
}

# =============================================================================
# COMMAND: deploy — Build images, transfer configs, and launch stack
# =============================================================================
cmd_deploy() {
    log_header "Deploy TriageNet Stack"
    require_deploy_vars

    # --- Step 1: Build Docker images locally ---
    log_info "[1/5] Building Docker images (multi-platform ARM64)..."
    docker buildx build \
        --platform linux/arm64 \
        -t "${DOCKER_REGISTRY}/triagenet-backend:${IMAGE_TAG}" \
        -f "${PROJECT_ROOT}/backend/Dockerfile" \
        "${PROJECT_ROOT}/backend" \
        --load

    docker buildx build \
        --platform linux/arm64 \
        -t "${DOCKER_REGISTRY}/triagenet-frontend:${IMAGE_TAG}" \
        -f "${PROJECT_ROOT}/frontend/Dockerfile" \
        "${PROJECT_ROOT}/frontend" \
        --load

    log_success "Images built successfully."

    # --- Step 2: Push images to registry ---
    log_info "[2/5] Pushing images to ${DOCKER_REGISTRY}..."
    docker push "${DOCKER_REGISTRY}/triagenet-backend:${IMAGE_TAG}"
    docker push "${DOCKER_REGISTRY}/triagenet-frontend:${IMAGE_TAG}"
    log_success "Images pushed."

    # --- Step 3: Transfer deployment configs ---
    log_info "[3/5] Transferring deployment configs to ${DEPLOY_HOST}:${DEPLOY_DIR}..."
    ssh_cmd "mkdir -p ${DEPLOY_DIR}/docker"
    scp_cmd "${PROJECT_ROOT}/docker/docker-compose.yml" "${DEPLOY_HOST}:${DEPLOY_DIR}/docker/"
    scp_cmd "${PROJECT_ROOT}/docker/docker-compose.prod.yml" "${DEPLOY_HOST}:${DEPLOY_DIR}/docker/"
    scp_cmd "${PROJECT_ROOT}/.env" "${DEPLOY_HOST}:${DEPLOY_DIR}/"

    ssh_cmd "mkdir -p ${DEPLOY_DIR}/nginx"
    scp_cmd "${PROJECT_ROOT}/nginx/default.conf" "${DEPLOY_HOST}:${DEPLOY_DIR}/nginx/"

    if [[ -f "${PROJECT_ROOT}/nginx/ssl.conf" ]]; then
        scp_cmd "${PROJECT_ROOT}/nginx/ssl.conf" "${DEPLOY_HOST}:${DEPLOY_DIR}/nginx/"
    fi

    log_success "Configs transferred."

    # --- Step 4: Pull images and deploy on remote ---
    log_info "[4/5] Pulling images and launching stack on ${DEPLOY_HOST}..."
    ssh_cmd bash -s <<REMOTE_DEPLOY
set -euo pipefail
cd ${DEPLOY_DIR}

echo "Pulling latest images..."
docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml pull backend frontend 2>/dev/null || true

echo "Starting stack with zero-downtime rolling update..."
docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up -d --remove-orphans --build

echo "Waiting for services to become healthy (up to 90s)..."
TIMEOUT=90
ELAPSED=0
while [[ \$ELAPSED -lt \$TIMEOUT ]]; do
    HEALTHY=\$(docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml ps --format json 2>/dev/null | grep -c '"healthy"' || echo 0)
    TOTAL=\$(docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml ps --format json 2>/dev/null | wc -l || echo 0)
    echo "  [\${ELAPSED}s] Healthy containers: \${HEALTHY}/\${TOTAL}"
    if [[ \$HEALTHY -ge 3 ]]; then
        echo "  All critical services healthy!"
        break
    fi
    sleep 10
    ELAPSED=\$((ELAPSED + 10))
done

echo ""
echo "=== Container Status ==="
docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml ps
REMOTE_DEPLOY

    log_success "Stack deployed."

    # --- Step 5: Smoke test ---
    log_info "[5/5] Running smoke tests..."
    _smoke_test

    log_success "Deployment complete! 🚀"
}

# =============================================================================
# COMMAND: ssl — Obtain or renew Let's Encrypt TLS certificate
# =============================================================================
cmd_ssl() {
    log_header "TLS Certificate (Let's Encrypt)"
    require_ssl_vars

    log_info "Obtaining TLS certificate for ${DEPLOY_DOMAIN}..."

    ssh_cmd bash -s <<REMOTE_SSL
set -euo pipefail

echo "[1/3] Stopping Nginx temporarily for standalone verification..."
docker stop triagenet-proxy 2>/dev/null || true

echo "[2/3] Running Certbot standalone challenge..."
sudo certbot certonly \
    --standalone \
    --non-interactive \
    --agree-tos \
    --email "${DEPLOY_EMAIL}" \
    --domains "${DEPLOY_DOMAIN}" \
    --cert-path "${DEPLOY_DIR}/certbot/conf" \
    || {
        echo "Certbot failed. Restarting Nginx on port 80..."
        cd ${DEPLOY_DIR}
        docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up -d nginx
        exit 1
    }

echo "[3/3] Copying certificates and restarting Nginx with TLS..."
sudo cp /etc/letsencrypt/live/${DEPLOY_DOMAIN}/fullchain.pem ${DEPLOY_DIR}/certbot/conf/
sudo cp /etc/letsencrypt/live/${DEPLOY_DOMAIN}/privkey.pem ${DEPLOY_DIR}/certbot/conf/
sudo chown \$(whoami):\$(whoami) ${DEPLOY_DIR}/certbot/conf/*.pem

cd ${DEPLOY_DIR}
docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up -d nginx

echo ""
echo "=== TLS Certificate Info ==="
sudo certbot certificates --domain ${DEPLOY_DOMAIN}
REMOTE_SSL

    log_success "TLS certificate obtained for ${DEPLOY_DOMAIN}"
    log_info "Auto-renewal is handled by certbot's systemd timer. Verify: ssh ${DEPLOY_HOST} 'sudo systemctl status certbot.timer'"
}

# =============================================================================
# COMMAND: status — Show container health
# =============================================================================
cmd_status() {
    log_header "Container Status"
    require_deploy_vars

    ssh_cmd bash -s <<REMOTE_STATUS
set -euo pipefail
cd ${DEPLOY_DIR}

echo "=== Docker Compose Status ==="
docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml ps

echo ""
echo "=== Resource Usage ==="
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.PIDs}}"

echo ""
echo "=== Disk Usage ==="
df -h / | head -2
echo ""
docker system df
REMOTE_STATUS
}

# =============================================================================
# COMMAND: logs — Tail aggregated container logs
# =============================================================================
cmd_logs() {
    log_header "Container Logs (Ctrl+C to exit)"
    require_deploy_vars

    local service="${2:-}"
    if [[ -n "${service}" ]]; then
        ssh_cmd "cd ${DEPLOY_DIR} && docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml logs -f --tail=100 ${service}"
    else
        ssh_cmd "cd ${DEPLOY_DIR} && docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml logs -f --tail=50"
    fi
}

# =============================================================================
# COMMAND: rollback — Roll back to previous image tag
# =============================================================================
cmd_rollback() {
    log_header "Rollback Deployment"
    require_deploy_vars

    local rollback_tag="${2:-previous}"
    log_warn "Rolling back to tag: ${rollback_tag}"

    ssh_cmd bash -s <<REMOTE_ROLLBACK
set -euo pipefail
cd ${DEPLOY_DIR}

echo "Stopping current stack..."
docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml down

echo "Restarting with tag: ${rollback_tag}..."
IMAGE_TAG=${rollback_tag} docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up -d

echo ""
echo "=== Rollback Status ==="
docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml ps
REMOTE_ROLLBACK

    log_success "Rollback to '${rollback_tag}' complete."
}

# =============================================================================
# COMMAND: backup — Backup PostgreSQL database
# =============================================================================
cmd_backup() {
    log_header "Database Backup"
    require_deploy_vars

    mkdir -p "${BACKUP_DIR}"
    local backup_file="triagenet_backup_${TIMESTAMP}.sql.gz"

    log_info "Creating PostgreSQL dump on ${DEPLOY_HOST}..."

    ssh_cmd bash -s <<REMOTE_BACKUP
set -euo pipefail
cd ${DEPLOY_DIR}

docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml exec -T postgres \
    pg_dump -U \${DB_USER:-triagenet} -d \${DB_NAME:-triagenet} --clean --if-exists \
    | gzip > ${DEPLOY_DIR}/backups/${backup_file}

ls -lh ${DEPLOY_DIR}/backups/${backup_file}
echo "Remote backup created: ${DEPLOY_DIR}/backups/${backup_file}"
REMOTE_BACKUP

    log_info "Downloading backup to local ${BACKUP_DIR}/${backup_file}..."
    scp_cmd "${DEPLOY_HOST}:${DEPLOY_DIR}/backups/${backup_file}" "${BACKUP_DIR}/${backup_file}"

    log_success "Backup saved: ${BACKUP_DIR}/${backup_file}"
    log_info "Size: $(ls -lh "${BACKUP_DIR}/${backup_file}" | awk '{print $5}')"
}

# =============================================================================
# COMMAND: restore — Restore PostgreSQL from backup
# =============================================================================
cmd_restore() {
    log_header "Database Restore"
    require_deploy_vars

    local backup_file="${2:-}"
    if [[ -z "${backup_file}" ]]; then
        log_error "Usage: ./scripts/deploy.sh restore <backup_file.sql.gz>"
        log_info "Available backups:"
        ls -lht "${BACKUP_DIR}"/*.sql.gz 2>/dev/null || echo "  No local backups found."
        exit 1
    fi

    if [[ ! -f "${backup_file}" ]]; then
        backup_file="${BACKUP_DIR}/${backup_file}"
    fi

    if [[ ! -f "${backup_file}" ]]; then
        log_error "Backup file not found: ${backup_file}"
        exit 1
    fi

    log_warn "This will OVERWRITE the production database. Proceed? [y/N]"
    read -r confirm
    if [[ "${confirm}" != "y" && "${confirm}" != "Y" ]]; then
        log_info "Restore cancelled."
        exit 0
    fi

    log_info "Uploading backup to ${DEPLOY_HOST}..."
    scp_cmd "${backup_file}" "${DEPLOY_HOST}:${DEPLOY_DIR}/backups/restore.sql.gz"

    ssh_cmd bash -s <<'REMOTE_RESTORE'
set -euo pipefail
cd ~/triagenet

echo "Restoring database from backup..."
gunzip -c backups/restore.sql.gz | docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml exec -T postgres \
    psql -U "${DB_USER:-triagenet}" -d "${DB_NAME:-triagenet}"

echo "Cleaning up..."
rm -f backups/restore.sql.gz

echo "=== Restore complete ==="
REMOTE_RESTORE

    log_success "Database restored from ${backup_file}"
}

# =============================================================================
# COMMAND: clean — Prune unused Docker resources
# =============================================================================
cmd_clean() {
    log_header "Clean Docker Resources"
    require_deploy_vars

    ssh_cmd bash -s <<'REMOTE_CLEAN'
set -euo pipefail

echo "=== Before Cleanup ==="
docker system df

echo ""
echo "Pruning unused images, containers, networks, and build cache..."
docker system prune -af --volumes 2>/dev/null || docker system prune -af

echo ""
echo "=== After Cleanup ==="
docker system df
REMOTE_CLEAN

    log_success "Docker resources cleaned."
}

# =============================================================================
# INTERNAL: Smoke Tests
# =============================================================================
_smoke_test() {
    log_info "Smoke testing endpoints..."

    local base_url
    if [[ -n "${DEPLOY_DOMAIN:-}" ]]; then
        base_url="https://${DEPLOY_DOMAIN}"
    else
        local host_ip
        host_ip=$(echo "${DEPLOY_HOST}" | cut -d@ -f2)
        base_url="http://${host_ip}"
    fi

    local endpoints=("/healthz" "/api/dashboard/state-overview" "/")
    local all_ok=true

    for endpoint in "${endpoints[@]}"; do
        local url="${base_url}${endpoint}"
        local http_code
        http_code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 15 "${url}" 2>/dev/null || echo "000")

        if [[ "${http_code}" == "200" ]]; then
            log_success "  ${endpoint} → HTTP ${http_code}"
        elif [[ "${http_code}" == "000" ]]; then
            log_warn "  ${endpoint} → Connection failed (may need TLS or DNS)"
            all_ok=false
        else
            log_warn "  ${endpoint} → HTTP ${http_code}"
            all_ok=false
        fi
    done

    if ${all_ok}; then
        log_success "All smoke tests passed!"
    else
        log_warn "Some smoke tests failed. Check container logs with: ./scripts/deploy.sh logs"
    fi
}

# =============================================================================
# COMMAND: help — Usage information
# =============================================================================
cmd_help() {
    cat <<EOF

${BOLD}TriageNet Deployment Script${NC}
  Automated deployment to OCI Always Free ARM (4 OCPU / 24 GB RAM)

${BOLD}Usage:${NC}
  ./scripts/deploy.sh <command> [args]

${BOLD}Commands:${NC}
  ${GREEN}setup${NC}      First-time server provisioning (Docker, Certbot, firewall)
  ${GREEN}deploy${NC}     Build ARM64 images, push, and deploy the full stack
  ${GREEN}ssl${NC}        Obtain/renew Let's Encrypt TLS certificate
  ${GREEN}status${NC}     Show running container health and resource usage
  ${GREEN}logs${NC}       Tail aggregated container logs (optionally: logs <service>)
  ${GREEN}rollback${NC}   Roll back to a previous image tag (rollback <tag>)
  ${GREEN}backup${NC}     Backup PostgreSQL database (compressed)
  ${GREEN}restore${NC}    Restore PostgreSQL from a backup file
  ${GREEN}clean${NC}      Prune unused Docker resources on the remote host

${BOLD}Required Environment Variables:${NC}
  DEPLOY_HOST      SSH target (e.g. ubuntu@129.153.x.x)
  DEPLOY_DOMAIN    Production domain for TLS (e.g. triagenet.example.com)
  DEPLOY_EMAIL     Email for Let's Encrypt registration

${BOLD}Optional Environment Variables:${NC}
  DEPLOY_DIR       Remote directory (default: ~/triagenet)
  DEPLOY_SSH_KEY   SSH key path (default: ~/.ssh/oci_arm_key)
  DOCKER_REGISTRY  Registry prefix (default: ghcr.io/pg300604)
  IMAGE_TAG        Image tag (default: latest)

${BOLD}Examples:${NC}
  DEPLOY_HOST=ubuntu@129.153.1.2 ./scripts/deploy.sh setup
  DEPLOY_HOST=ubuntu@129.153.1.2 ./scripts/deploy.sh deploy
  ./scripts/deploy.sh status
  ./scripts/deploy.sh logs backend
  ./scripts/deploy.sh backup

EOF
}

# =============================================================================
# ENTRYPOINT
# =============================================================================
main() {
    local command="${1:-help}"

    case "${command}" in
        setup)    cmd_setup ;;
        deploy)   cmd_deploy ;;
        ssl)      cmd_ssl ;;
        status)   cmd_status "$@" ;;
        logs)     cmd_logs "$@" ;;
        rollback) cmd_rollback "$@" ;;
        backup)   cmd_backup ;;
        restore)  cmd_restore "$@" ;;
        clean)    cmd_clean ;;
        help|--help|-h)  cmd_help ;;
        *)
            log_error "Unknown command: ${command}"
            cmd_help
            exit 1
            ;;
    esac
}

main "$@"
