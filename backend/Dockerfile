# Multi-stage Dockerfile for TriageNet Spring Boot Backend

# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17-alpine AS builder
WORKDIR /app
# Pre-fetch dependencies for Docker layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B || true
COPY src ./src
# Build application jar without running tests during image creation
RUN mvn clean package -DskipTests -B

# Stage 2: Runtime (Hardened Non-Root Container)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Security: Create non-root system group and user
RUN addgroup -g 1001 -S triagenet && \
    adduser -u 1001 -S triagenet -G triagenet

COPY --from=builder --chown=triagenet:triagenet /app/target/*.jar app.jar

USER 1001:1001

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -q -O - http://127.0.0.1:8080/api/dashboard/overview || exit 1

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
