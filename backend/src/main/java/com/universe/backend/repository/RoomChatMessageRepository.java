package com.universe.backend.repository;

import com.universe.backend.model.RoomChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface RoomChatMessageRepository extends MongoRepository<RoomChatMessage, String> {

    List<RoomChatMessage> findByRoomIdOrderByCreatedAtDesc(String roomId, Pageable pageable);

    List<RoomChatMessage> findByRoomIdOrderByCreatedAtAsc(String roomId, Pageable pageable);
}
