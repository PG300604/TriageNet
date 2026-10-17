package com.triagenet.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.StandardEnvironment;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class DatabaseUrlEnvironmentPostProcessorTest {

    @Test
    @DisplayName("Normalizes Render/Heroku postgresql:// URL with user, pass, host without explicit port")
    void shouldNormalizeRenderPostgresqlUrl() {
        ConfigurableEnvironment env = new StandardEnvironment();
        String renderUrl = "postgresql://triagenet:Lp8cVJR3aN24toKVPDwcZPUutYMxQf0v@dpg-db9mn8u1egvs73frmp6g-a/triagenet";
        env.getPropertySources().addFirst(new MapPropertySource("testSource", Map.of("SPRING_DATASOURCE_URL", renderUrl)));

        DatabaseUrlEnvironmentPostProcessor processor = new DatabaseUrlEnvironmentPostProcessor();
        processor.postProcessEnvironment(env, new SpringApplication());

        assertEquals("jdbc:postgresql://dpg-db9mn8u1egvs73frmp6g-a:5432/triagenet", env.getProperty("spring.datasource.url"));
        assertEquals("triagenet", env.getProperty("spring.datasource.username"));
        assertEquals("Lp8cVJR3aN24toKVPDwcZPUutYMxQf0v", env.getProperty("spring.datasource.password"));
    }

    @Test
    @DisplayName("Normalizes postgres:// protocol to jdbc:postgresql://")
    void shouldNormalizePostgresShortProtocol() {
        ConfigurableEnvironment env = new StandardEnvironment();
        String url = "postgres://app_user:secret@custom-host:6543/custom_db";
        env.getPropertySources().addFirst(new MapPropertySource("testSource", Map.of("DB_URL", url)));

        DatabaseUrlEnvironmentPostProcessor processor = new DatabaseUrlEnvironmentPostProcessor();
        processor.postProcessEnvironment(env, new SpringApplication());

        assertEquals("jdbc:postgresql://custom-host:6543/custom_db", env.getProperty("spring.datasource.url"));
        assertEquals("app_user", env.getProperty("spring.datasource.username"));
        assertEquals("secret", env.getProperty("spring.datasource.password"));
    }

    @Test
    @DisplayName("Leaves valid jdbc:postgresql:// URL unchanged")
    void shouldLeaveValidJdbcUrlUnchanged() {
        ConfigurableEnvironment env = new StandardEnvironment();
        String validUrl = "jdbc:postgresql://localhost:5432/triagenet";
        env.getPropertySources().addFirst(new MapPropertySource("testSource", Map.of("spring.datasource.url", validUrl)));

        DatabaseUrlEnvironmentPostProcessor processor = new DatabaseUrlEnvironmentPostProcessor();
        processor.postProcessEnvironment(env, new SpringApplication());

        assertEquals(validUrl, env.getProperty("spring.datasource.url"));
    }
}
