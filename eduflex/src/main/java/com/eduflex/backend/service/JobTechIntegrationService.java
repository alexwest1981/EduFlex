package com.eduflex.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobTechIntegrationService {

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Fetches current market demand (Yrkesbarometern) for a specific profession
     * code (SSYK) and region.
     * Currently implemented as a robust mock since the exact JobTech API endpoints
     * for Yrkesbarometern require specific taxonomy mapping.
     * 
     * @param ssykCode   Systematisk förteckning över yrken (e.g. "2512" for
     *                   Software Developers)
     * @param regionCode Länskod (e.g. "01" for Stockholm)
     * @return Map containing demand indicators (1-5 scale, 5 being huge shortage of
     *         workers)
     */
    @Cacheable(value = "jobDemandCache", key = "#ssykCode + '-' + #regionCode")
    public Map<String, Object> getDemandForProfession(String ssykCode, String regionCode) {
        log.info("Fetching JobTech Yrkesbarometern data for SSYK: {}, Region: {}", ssykCode, regionCode);

        // TODO: Replace with actual HTTPS WebClient call to:
        // https://jobtechdev.se/sv/components/yrkesbarometern

        Map<String, Object> demandData = new HashMap<>();
        demandData.put("ssyk", ssykCode);
        demandData.put("region", regionCode);

        // Mocked logic based on typical SSYK codes for IT/Healthcare (High demand) vs
        // Administration (Low/Medium)
        int currentDemandValue;
        int oneYearForecast;

        if (ssykCode == null) {
            currentDemandValue = 3;
            oneYearForecast = 3;
        } else if (ssykCode.startsWith("25") || ssykCode.startsWith("22") || ssykCode.startsWith("32")) {
            // IT & Healthcare (High demand - shortage of workers)
            currentDemandValue = 5;
            oneYearForecast = 5;
        } else if (ssykCode.startsWith("41") || ssykCode.startsWith("42")) {
            // Administration (Medium/Low demand)
            currentDemandValue = 2;
            oneYearForecast = 2;
        } else {
            // Randomish fallback for other professions
            currentDemandValue = new Random().nextInt(3) + 2; // 2-4
            oneYearForecast = currentDemandValue;
        }

        demandData.put("currentDemandIndicator", currentDemandValue); // 1 = Överskott, 3 = Balans, 5 = Stor Brist
        demandData.put("oneYearForecastIndicator", oneYearForecast);

        // Translate to human readable text
        demandData.put("currentDemandText", mapIndicatorToText(currentDemandValue));
        demandData.put("forecastText", mapIndicatorToText(oneYearForecast));

        return demandData;
    }

    private String mapIndicatorToText(int indicator) {
        return switch (indicator) {
            case 5 -> "Mycket stor brist på yrkesutövare";
            case 4 -> "Stor brist på yrkesutövare";
            case 3 -> "Balans";
            case 2 -> "Överskott på yrkesutövare";
            case 1 -> "Mycket stort överskott på yrkesutövare";
            default -> "Okänt läge";
        };
    }
}
