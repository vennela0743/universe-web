package com.universe.backend.service;

import com.universe.backend.dto.ConnectPostResponse;
import com.universe.backend.dto.EventResponse;
import com.universe.backend.dto.MyPostsResponse;
import com.universe.backend.dto.OpportunityResponse;
import com.universe.backend.model.ConnectPost;
import com.universe.backend.model.Event;
import com.universe.backend.model.Opportunity;
import com.universe.backend.model.User;
import com.universe.backend.repository.ConnectPostRepository;
import com.universe.backend.repository.EventRepository;
import com.universe.backend.repository.OpportunityRepository;
import com.universe.backend.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MyPostsService {

    private static final int MAX_ITEMS = 50;

    private final UserRepository userRepository;
    private final ConnectPostRepository connectPostRepository;
    private final OpportunityRepository opportunityRepository;
    private final EventRepository eventRepository;

    public MyPostsService(UserRepository userRepository,
                          ConnectPostRepository connectPostRepository,
                          OpportunityRepository opportunityRepository,
                          EventRepository eventRepository) {
        this.userRepository = userRepository;
        this.connectPostRepository = connectPostRepository;
        this.opportunityRepository = opportunityRepository;
        this.eventRepository = eventRepository;
    }

    public MyPostsResponse getMyPosts(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<ConnectPostResponse> connectPosts = connectPostRepository
                .findByAuthorUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, MAX_ITEMS))
                .stream()
                .map(this::toConnectPostResponse)
                .collect(Collectors.toList());

        List<OpportunityResponse> opportunities = opportunityRepository
                .findByOwnerUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, MAX_ITEMS))
                .stream()
                .map(this::toOpportunityResponse)
                .collect(Collectors.toList());

        List<EventResponse> events = eventRepository
                .findBySubmittedByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, MAX_ITEMS))
                .stream()
                .map(this::toEventResponse)
                .collect(Collectors.toList());

        return new MyPostsResponse(connectPosts, opportunities, events);
    }

    public void deleteConnectPost(String userId, String postId) {
        ConnectPost post = connectPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        
        if (!post.getAuthorUserId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own posts");
        }
        
        connectPostRepository.delete(post);
    }

    public void deleteOpportunity(String userId, String opportunityId) {
        Opportunity opp = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new IllegalArgumentException("Opportunity not found"));
        
        if (!opp.getOwnerUserId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own opportunities");
        }
        
        opportunityRepository.delete(opp);
    }

    public void deleteEvent(String userId, String eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
        
        if (!event.getSubmittedByUserId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own events");
        }
        
        eventRepository.delete(event);
    }

    private ConnectPostResponse toConnectPostResponse(ConnectPost post) {
        return new ConnectPostResponse(
                post.getId(),
                post.getAuthorUserId(),
                post.getAuthorDisplayName(),
                post.getContent(),
                post.getImageUrl(),
                post.getCreatedAt()
        );
    }

    private OpportunityResponse toOpportunityResponse(Opportunity opp) {
        return new OpportunityResponse(
                opp.getId(),
                opp.getOwnerUserId(),
                opp.getOwnerDisplayName(),
                opp.getTitle(),
                opp.getType(),
                opp.getSkillsNeeded(),
                opp.getDuration(),
                opp.getCommitment(),
                opp.getDescription(),
                opp.getCreatedAt()
        );
    }

    private EventResponse toEventResponse(Event event) {
        return new EventResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getType(),
                event.getStartTime(),
                event.getEndTime(),
                event.getLocation(),
                event.getOrganizerName(),
                event.getStatus(),
                event.getSubmittedByDisplayName(),
                event.getSupportingDocuments(),
                event.getCreatedAt()
        );
    }
}
