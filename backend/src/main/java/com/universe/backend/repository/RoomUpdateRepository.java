package com.universe.backend.repository;

import com.universe.backend.model.RoomUpdate;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface RoomUpdateRepository extends MongoRepository<RoomUpdate, String> {

    List<RoomUpdate> findByRoomIdOrderByCreatedAtDesc(String roomId, Pageable pageable);
}
