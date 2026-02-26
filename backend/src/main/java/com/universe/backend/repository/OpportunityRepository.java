package com.universe.backend.repository;

import com.universe.backend.model.Opportunity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface OpportunityRepository extends MongoRepository<Opportunity, String> {

    List<Opportunity> findByUniversitySpaceIdOrderByCreatedAtDesc(String universitySpaceId, Pageable pageable);

    List<Opportunity> findByUniversitySpaceIdAndTypeOrderByCreatedAtDesc(String universitySpaceId, String type, Pageable pageable);

    boolean existsByIdAndUniversitySpaceId(String id, String universitySpaceId);

    List<Opportunity> findByOwnerUserIdOrderByCreatedAtDesc(String ownerUserId, Pageable pageable);
}
