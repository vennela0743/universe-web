package com.universe.backend.repository;

import com.universe.backend.model.DirectMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface DirectMessageRepository extends MongoRepository<DirectMessage, String> {

    List<DirectMessage> findByConversationIdOrderByCreatedAtDesc(String conversationId, Pageable pageable);

    List<DirectMessage> findByConversationIdOrderByCreatedAtAsc(String conversationId);
}
