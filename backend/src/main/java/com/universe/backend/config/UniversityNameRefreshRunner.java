package com.universe.backend.config;

import com.universe.backend.service.UniversitySpaceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(2)
public class UniversityNameRefreshRunner implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(UniversityNameRefreshRunner.class);

    private final UniversitySpaceService universitySpaceService;

    public UniversityNameRefreshRunner(UniversitySpaceService universitySpaceService) {
        this.universitySpaceService = universitySpaceService;
    }

    @Override
    public void run(ApplicationArguments args) {
        logger.info("Refreshing university space names from domain mappings...");
        universitySpaceService.refreshAllUniversityNames();
        logger.info("University space names refresh complete");
    }
}
