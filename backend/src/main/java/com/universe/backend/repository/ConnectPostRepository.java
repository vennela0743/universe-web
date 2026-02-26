package com.universe.backend.repository;

import com.universe.backend.model.ConnectPost;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ConnectPostRepository extends MongoRepository<ConnectPost, String> {

    List<ConnectPost> findByUniversitySpaceIdOrderByCreatedAtDesc(String universitySpaceId, Pageable pageable);

    List<ConnectPost> findByAuthorUserIdOrderByCreatedAtDesc(String authorUserId, Pageable pageable);
}
