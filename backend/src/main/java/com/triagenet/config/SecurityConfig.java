package com.triagenet.config;

import com.triagenet.service.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CsrfGuardFilter csrfGuardFilter;
    private final CustomUserDetailsService userDetailsService;
    private final Environment environment;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        boolean isDevOrTest = environment.acceptsProfiles(Profiles.of("dev", "test", "local"));

        if (isDevOrTest) {
            config.setAllowedOrigins(List.of(
                    "http://localhost:3000",
                    "http://127.0.0.1:3000",
                    "http://localhost:8080"
            ));
        } else {
            // SECURITY (V6): Strict exact origins without wildcards
            config.setAllowedOrigins(List.of(
                    "https://triagenet.vercel.app",
                    "https://triagenet.dev",
                    "https://triagenet.gov.in"
            ));
        }

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With", "X-CSRF-TOKEN"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        boolean isDevOrLocal = environment.acceptsProfiles(Profiles.of("dev", "local"));
        boolean isH2ConsoleEnabled = Boolean.TRUE.equals(environment.getProperty("spring.h2.console.enabled", Boolean.class, false));
        // SECURITY (V2): Allow H2 console ONLY in dev/local profile AND when explicitly enabled
        boolean allowH2Console = isDevOrLocal && isH2ConsoleEnabled;

        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .headers(headers -> {
                if (allowH2Console) {
                    headers.frameOptions(frame -> frame.sameOrigin());
                } else {
                    headers.frameOptions(frame -> frame.deny());
                }
                headers.httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true).maxAgeInSeconds(31536000));
                headers.cacheControl(Customizer.withDefaults());
            })
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(csrfGuardFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(auth -> {
                if (allowH2Console) {
                    auth.requestMatchers("/h2-console/**").permitAll();
                }
                auth.requestMatchers(
                    "/api/auth/**",
                    "/api/patients/score-vitals",
                    "/api/dashboard/**",
                    "/api/hospitals",
                    "/api/hospitals/**",
                    "/api/routing/optimal",
                    "/error"
                ).permitAll()
                .anyRequest().authenticated();
            });

        return http.build();
    }
}
