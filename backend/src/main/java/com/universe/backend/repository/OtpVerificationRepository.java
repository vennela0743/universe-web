package com.universe.backend.repository;

import com.universe.backend.model.OtpVerification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface OtpVerificationRepository extends MongoRepository<OtpVerification, String> {

    Optional<OtpVerification> findByEmailAndTypeAndUsedFalseOrderByCreatedAtDesc(String email, String type);

    void deleteByEmail(String email);

    void deleteByEmailAndType(String email, String type);
}
