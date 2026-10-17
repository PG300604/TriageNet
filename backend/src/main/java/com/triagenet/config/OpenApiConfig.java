package com.triagenet.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "TriageNet Statewide Healthcare Resource Allocation & Routing API",
        version = "1.0.0",
        description = "REST API specification for state-wide triage, Hungarian resource matching, Dijkstra routing, and 108 ambulance referrals across Jharkhand.",
        contact = @Contact(
            name = "Priyanshu Ghosh",
            url = "https://github.com/PG300604/TriageNet"
        )
    ),
    security = @SecurityRequirement(name = "bearerAuth")
)
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT"
)
public class OpenApiConfig {
}
