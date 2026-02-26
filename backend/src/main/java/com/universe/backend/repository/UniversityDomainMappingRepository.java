package com.universe.backend.repository;

import com.universe.backend.model.UniversityDomainMapping;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UniversityDomainMappingRepository extends MongoRepository<UniversityDomainMapping, String> {

    Optional<UniversityDomainMapping> findByDomain(String domain);

    boolean existsByDomain(String domain);
}
