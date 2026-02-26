package com.universe.backend.service;

import com.universe.backend.model.DailyMetrics;
import com.universe.backend.model.UniversitySpace;
import com.universe.backend.repository.DailyMetricsRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;

@Service
public class MetricsService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ISO_LOCAL_DATE;

    private final DailyMetricsRepository dailyMetricsRepository;
    private final UniversitySpaceService universitySpaceService;

    public MetricsService(DailyMetricsRepository dailyMetricsRepository,
                          UniversitySpaceService universitySpaceService) {
        this.dailyMetricsRepository = dailyMetricsRepository;
        this.universitySpaceService = universitySpaceService;
    }

    /**
     * Record one login for the given space for today.
     */
    public void recordLogin(String universitySpaceId) {
        if (universitySpaceId == null || universitySpaceId.isBlank()) return;
        String today = LocalDate.now().format(DATE_FMT);
        DailyMetrics m = dailyMetricsRepository.findByDateAndUniversitySpaceId(today, universitySpaceId)
                .orElseGet(() -> createNew(today, universitySpaceId));
        m.setLoginCount(m.getLoginCount() + 1);
        dailyMetricsRepository.save(m);
    }

    /**
     * Record one post created for the given space for today.
     */
    public void recordPostCreated(String universitySpaceId) {
        if (universitySpaceId == null || universitySpaceId.isBlank()) return;
        String today = LocalDate.now().format(DATE_FMT);
        DailyMetrics m = dailyMetricsRepository.findByDateAndUniversitySpaceId(today, universitySpaceId)
                .orElseGet(() -> createNew(today, universitySpaceId));
        m.setPostsCreatedCount(m.getPostsCreatedCount() + 1);
        dailyMetricsRepository.save(m);
    }

    /**
     * Get daily metrics for the last N days (space-scoped). Sorted by date desc, then space.
     */
    public List<DailyMetrics> getMetricsLastDays(int days) {
        LocalDate to = LocalDate.now();
        LocalDate from = to.minusDays(Math.max(1, days));
        String fromStr = from.format(DATE_FMT);
        String toStr = to.format(DATE_FMT);
        List<DailyMetrics> list = dailyMetricsRepository.findByDateBetween(fromStr, toStr);
        enrichSpaceNames(list);
        list.sort(Comparator.comparing(DailyMetrics::getDate).reversed()
                .thenComparing(DailyMetrics::getUniversitySpaceId));
        return list;
    }

    private DailyMetrics createNew(String date, String universitySpaceId) {
        DailyMetrics m = new DailyMetrics();
        m.setDate(date);
        m.setUniversitySpaceId(universitySpaceId);
        m.setLoginCount(0);
        m.setPostsCreatedCount(0);
        UniversitySpace space = universitySpaceService.findById(universitySpaceId);
        if (space != null) {
            m.setSpaceName(space.getName());
        }
        return m;
    }

    private void enrichSpaceNames(List<DailyMetrics> list) {
        for (DailyMetrics m : list) {
            if (m.getSpaceName() == null && m.getUniversitySpaceId() != null) {
                UniversitySpace space = universitySpaceService.findById(m.getUniversitySpaceId());
                if (space != null) {
                    m.setSpaceName(space.getName());
                }
            }
        }
    }
}
