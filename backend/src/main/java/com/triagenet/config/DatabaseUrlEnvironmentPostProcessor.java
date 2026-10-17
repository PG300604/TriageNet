package com.triagenet.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

/**
 * Normalizes cloud database URLs (Render, Heroku, Supabase, Fly.io) to standard PostgreSQL JDBC URLs.
 * Automatically intercepts 'postgresql://' or 'postgres://' connection strings, converts them to
 * 'jdbc:postgresql://host:port/database', and safely extracts credentials if present.
 */
@Order(Ordered.HIGHEST_PRECEDENCE)
public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String[] candidateKeys = {
            "spring.datasource.url",
            "SPRING_DATASOURCE_URL",
            "DB_URL",
            "DATABASE_URL"
        };

        for (String key : candidateKeys) {
            String rawUrl = environment.getProperty(key);
            if (rawUrl != null && !rawUrl.isBlank()) {
                String clean = rawUrl.trim();
                boolean hadJdbc = clean.startsWith("jdbc:");
                if (hadJdbc) {
                    clean = clean.substring(5);
                }

                if (clean.startsWith("postgres://")) {
                    clean = "postgresql://" + clean.substring(11);
                }

                // If it is a postgresql URI (e.g. postgresql://user:pass@host/db or postgresql://host/db)
                if (clean.startsWith("postgresql://")) {
                    try {
                        URI uri = URI.create(clean);
                        String host = uri.getHost();
                        if (host == null || host.isBlank()) {
                            continue;
                        }
                        int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                        String path = uri.getPath();
                        if (path == null || path.isBlank() || path.equals("/")) {
                            path = "/triagenet";
                        }

                        String cleanJdbcUrl = "jdbc:postgresql://" + host + ":" + port + path;

                        Map<String, Object> props = new HashMap<>();
                        props.put("spring.datasource.url", cleanJdbcUrl);
                        props.put("DB_URL", cleanJdbcUrl);

                        String userInfo = uri.getUserInfo();
                        if (userInfo != null && !userInfo.isBlank()) {
                            String[] parts = userInfo.split(":", 2);
                            if (parts.length > 0 && !parts[0].isEmpty() && environment.getProperty("spring.datasource.username") == null) {
                                props.put("spring.datasource.username", parts[0]);
                                props.put("DB_USER", parts[0]);
                            }
                            if (parts.length > 1 && !parts[1].isEmpty() && environment.getProperty("spring.datasource.password") == null) {
                                props.put("spring.datasource.password", parts[1]);
                                props.put("DB_PASSWORD", parts[1]);
                            }
                        }

                        environment.getPropertySources().addFirst(
                            new MapPropertySource("cloudDatabaseUrlNormalizer", props)
                        );
                        break;
                    } catch (Exception ignored) {
                    }
                }
            }
        }
    }
}
