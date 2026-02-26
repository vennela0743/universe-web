package com.universe.backend.repository;

import com.universe.backend.model.ProjectRoomMember;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRoomMemberRepository extends MongoRepository<ProjectRoomMember, String> {

    List<ProjectRoomMember> findByRoomIdOrderByJoinedAtAsc(String roomId);

    Optional<ProjectRoomMember> findByRoomIdAndUserId(String roomId, String userId);

    boolean existsByRoomIdAndUserId(String roomId, String userId);

    List<ProjectRoomMember> findByUserId(String userId);
}
