# Multi-stage Dockerfile for TriageNet Spring Boot Backend

# Stage 1: Build
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Build application jar without running tests during image creation
RUN ./mvnw package -DskipTests || mvn package -DskipTests

# Stage 2: Runtime (Hardened Non-Root Container)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Security: Create non-root system group and user
RUN addgroup -g 1001 -S triagenet && \
    adduser -u 1001 -S triagenet -G triagenet

COPY --from=builder --chown=triagenet:triagenet /app/target/*.jar app.jar

USER 1001:1001

EXPOSE 8080
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
