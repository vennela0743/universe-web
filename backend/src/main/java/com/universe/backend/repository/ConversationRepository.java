package com.universe.backend.repository;

import com.universe.backend.model.Conversation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends MongoRepository<Conversation, String> {

    @Query("{ 'participantIds': ?0 }")
    List<Conversation> findByParticipantIdsContaining(String userId);

    List<Conversation> findByParticipantIdsContainingOrderByLastMessageAtDesc(String userId);

    @Query("{ 'participantIds': { $all: ?0 }, $expr: { $eq: [ { $size: '$participantIds' }, ?1 ] } }")
    Optional<Conversation> findByExactParticipants(List<String> participantIds, int size);
}
