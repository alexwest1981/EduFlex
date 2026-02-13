package com.eduflex.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class RiskAnalysisScheduler {

    private static final Logger logger = LoggerFactory.getLogger(RiskAnalysisScheduler.class);
    private final PredictiveAnalysisService predictiveAnalysisService;

    public RiskAnalysisScheduler(PredictiveAnalysisService predictiveAnalysisService) {
        this.predictiveAnalysisService = predictiveAnalysisService;
    }

    // Run nightly at 02:00
    @Scheduled(cron = "0 0 2 * * *")
    public void runNightlyRiskAnalysis() {
        logger.info("Starting scheduled nightly predictive risk analysis...");
        try {
            predictiveAnalysisService.analyzeAllStudents();
            logger.info("Nightly risk analysis completed successfully.");
        } catch (Exception e) {
            logger.error("Nightly risk analysis failed: {}", e.getMessage());
        }
    }
}
