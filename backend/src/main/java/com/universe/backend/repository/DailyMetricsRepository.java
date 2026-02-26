package com.universe.backend.repository;

import com.universe.backend.model.DailyMetrics;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface DailyMetricsRepository extends MongoRepository<DailyMetrics, String> {

    Optional<DailyMetrics> findByDateAndUniversitySpaceId(String date, String universitySpaceId);

    List<DailyMetrics> findByDateBetween(String from, String to);
}
