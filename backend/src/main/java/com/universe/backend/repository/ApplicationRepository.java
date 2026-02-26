package com.universe.backend.repository;

import com.universe.backend.model.Application;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends MongoRepository<Application, String> {

    List<Application> findByOpportunityIdOrderByCreatedAtDesc(String opportunityId);

    Optional<Application> findByOpportunityIdAndApplicantUserId(String opportunityId, String applicantUserId);

    boolean existsByOpportunityIdAndApplicantUserId(String opportunityId, String applicantUserId);

    List<Application> findByApplicantUserIdOrderByCreatedAtDesc(String applicantUserId);
}
