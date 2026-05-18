package com.chan.med0515;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class Med0515Application {

    public static void main(String[] args) {
        SpringApplication.run(Med0515Application.class, args);
    }

}
