package com.universe.backend.repository;

import com.universe.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    long countByUniversitySpaceId(String universitySpaceId);

    boolean existsByUniversitySpaceIdAndRole(String universitySpaceId, String role);

    Optional<User> findFirstByUniversitySpaceIdOrderByCreatedAtAsc(String universitySpaceId);

    List<User> findByUniversitySpaceIdAndDisplayNameContainingIgnoreCase(String universitySpaceId, String query);

    List<User> findByUniversitySpaceId(String universitySpaceId);
}
