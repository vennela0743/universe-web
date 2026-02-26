package com.universe.backend.repository;

import com.universe.backend.model.Event;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface EventRepository extends MongoRepository<Event, String> {

    List<Event> findByUniversitySpaceIdOrderByStartTimeAsc(String universitySpaceId, Pageable pageable);

    List<Event> findByUniversitySpaceIdAndTypeOrderByStartTimeAsc(String universitySpaceId, String type, Pageable pageable);

    List<Event> findByUniversitySpaceIdAndStatusOrderByStartTimeAsc(String universitySpaceId, String status, Pageable pageable);

    List<Event> findByUniversitySpaceIdAndStatusAndTypeOrderByStartTimeAsc(String universitySpaceId, String status, String type, Pageable pageable);

    List<Event> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    List<Event> findByUniversitySpaceIdAndStatusOrderByCreatedAtDesc(String universitySpaceId, String status, Pageable pageable);

    long countByUniversitySpaceId(String universitySpaceId);

    long countByUniversitySpaceIdAndStatus(String universitySpaceId, String status);

    List<Event> findBySubmittedByUserIdOrderByCreatedAtDesc(String submittedByUserId, Pageable pageable);
}
