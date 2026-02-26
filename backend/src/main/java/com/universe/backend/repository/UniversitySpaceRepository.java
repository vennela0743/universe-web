package com.universe.backend.repository;

import com.universe.backend.model.UniversitySpace;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UniversitySpaceRepository extends MongoRepository<UniversitySpace, String> {

    Optional<UniversitySpace> findByDomainIgnoreCase(String domain);
}
