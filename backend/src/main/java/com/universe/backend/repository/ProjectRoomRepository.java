package com.universe.backend.repository;

import com.universe.backend.model.ProjectRoom;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProjectRoomRepository extends MongoRepository<ProjectRoom, String> {

    List<ProjectRoom> findByUniversitySpaceIdOrderByCreatedAtDesc(String universitySpaceId);

    boolean existsByIdAndUniversitySpaceId(String id, String universitySpaceId);
}
