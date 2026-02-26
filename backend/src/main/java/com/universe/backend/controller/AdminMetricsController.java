package com.universe.backend.controller;

import com.universe.backend.model.DailyMetrics;
import com.universe.backend.service.MetricsService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminMetricsController {

    private final MetricsService metricsService;
    private final String adminApiKey;

    public AdminMetricsController(MetricsService metricsService,
                                  @Value("${universe.admin-api-key:}") String adminApiKey) {
        this.metricsService = metricsService;
        this.adminApiKey = adminApiKey;
    }

    /**
     * GET /api/admin/metrics?days=30
     * Requires X-Admin-Key header (or admin-api-key set in config). Returns 403 if key missing or invalid.
     */
    @GetMapping("/metrics")
    public ResponseEntity<?> getMetrics(
            @RequestHeader(value = "X-Admin-Key", required = false) String headerKey,
            @RequestParam(value = "days", defaultValue = "30") int days) {

        if (adminApiKey == null || adminApiKey.isBlank()) {
            return ResponseEntity.status(503).body(Map.of("error", "Metrics endpoint not configured (set ADMIN_API_KEY)"));
        }
        if (headerKey == null || !adminApiKey.equals(headerKey.trim())) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }

        int safeDays = Math.min(90, Math.max(1, days));
        List<DailyMetrics> metrics = metricsService.getMetricsLastDays(safeDays);
        return ResponseEntity.ok(metrics);
    }
}
