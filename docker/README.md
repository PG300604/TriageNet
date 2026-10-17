# TriageNet — Multi-Container Docker Infrastructure

This package encapsulates the production-grade multi-container topology for TriageNet.

## Containers Architecture

1. **`frontend` (`triagenet-frontend`)**: Next.js 16.4.1 (React 19 SSR, Turbopack, standalone container).
2. **`backend` (`triagenet-backend`)**: Spring Boot 3.3.13 (Temurin JDK 17, Virtual Threads, multi-stage build).
3. **`postgres` (`triagenet-db`)**: PostgreSQL 16 Alpine with PostGIS extension for GIS highway routing.
4. **`redis` (`triagenet-redis`)**: Redis 7.2 Alpine with Append-Only File (AOF) durability for sub-50ms GPS telemetry.
5. **`nginx` (`triagenet-proxy`)**: Nginx Alpine reverse proxy handling TLS termination, rate limiting, and STOMP WebSocket pass-through.

## Quick Start (Development & Local Run)

From the repository root:
```bash
docker compose -f docker/docker-compose.yml up -d
```
Or directly from the `docker/` directory:
```bash
cd docker
docker compose up -d
```

## Production Deployment (OCI / Cloud Native)

```bash
docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up -d
```

## Logs & Service Health

```bash
docker compose -f docker/docker-compose.yml ps
docker compose -f docker/docker-compose.yml logs -f
```
