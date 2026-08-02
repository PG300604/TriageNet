package com.triagenet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TriageNetApplication {

    public static void main(String[] args) {
        SpringApplication.run(TriageNetApplication.class, args);
    }
}
