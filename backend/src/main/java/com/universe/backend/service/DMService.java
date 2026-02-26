package com.universe.backend.service;

import com.universe.backend.dto.ConversationResponse;
import com.universe.backend.dto.DirectMessageResponse;
import com.universe.backend.dto.UserSearchResult;
import com.universe.backend.model.Conversation;
import com.universe.backend.model.DirectMessage;
import com.universe.backend.model.User;
import com.universe.backend.repository.ConversationRepository;
import com.universe.backend.repository.DirectMessageRepository;
import com.universe.backend.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class DMService {

    private static final int MAX_MESSAGES = 100;
    private static final int MAX_SEARCH_RESULTS = 20;

    private final ConversationRepository conversationRepository;
    private final DirectMessageRepository directMessageRepository;
    private final UserRepository userRepository;

    public DMService(ConversationRepository conversationRepository,
                     DirectMessageRepository directMessageRepository,
                     UserRepository userRepository) {
        this.conversationRepository = conversationRepository;
        this.directMessageRepository = directMessageRepository;
        this.userRepository = userRepository;
    }

    public List<ConversationResponse> listConversations(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Conversation> conversations = conversationRepository
                .findByParticipantIdsContainingOrderByLastMessageAtDesc(userId);

        Set<String> allParticipantIds = conversations.stream()
                .flatMap(c -> c.getParticipantIds().stream())
                .collect(Collectors.toSet());

        Map<String, User> usersById = userRepository.findAllById(allParticipantIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        return conversations.stream()
                .map(c -> toConversationResponse(c, usersById))
                .collect(Collectors.toList());
    }

    public ConversationResponse startOrGetConversation(String userId, String recipientUserId, String initialMessage) {
        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        User recipient = userRepository.findById(recipientUserId)
                .orElseThrow(() -> new IllegalArgumentException("Recipient not found"));

        if (!sender.getUniversitySpaceId().equals(recipient.getUniversitySpaceId())) {
            throw new IllegalArgumentException("Cannot message users outside your university");
        }

        if (userId.equals(recipientUserId)) {
            throw new IllegalArgumentException("Cannot message yourself");
        }

        List<String> participantIds = new ArrayList<>();
        participantIds.add(userId);
        participantIds.add(recipientUserId);
        Collections.sort(participantIds);

        Conversation conversation = conversationRepository
                .findByExactParticipants(participantIds, 2)
                .orElseGet(() -> {
                    Conversation newConv = new Conversation();
                    newConv.setParticipantIds(participantIds);
                    newConv.setUniversitySpaceId(sender.getUniversitySpaceId());
                    newConv.setCreatedAt(Instant.now());
                    return conversationRepository.save(newConv);
                });

        if (initialMessage != null && !initialMessage.isBlank()) {
            sendMessageInternal(conversation, sender, initialMessage.trim());
        }

        Map<String, User> usersById = Map.of(
                sender.getId(), sender,
                recipient.getId(), recipient
        );

        return toConversationResponse(conversation, usersById);
    }

    public List<DirectMessageResponse> getMessages(String userId, String conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        if (!conversation.getParticipantIds().contains(userId)) {
            throw new IllegalArgumentException("Forbidden");
        }

        List<DirectMessage> messages = directMessageRepository
                .findByConversationIdOrderByCreatedAtAsc(conversationId);

        return messages.stream()
                .map(this::toMessageResponse)
                .collect(Collectors.toList());
    }

    public DirectMessageResponse sendMessage(String userId, String conversationId, String content) {
        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        if (!conversation.getParticipantIds().contains(userId)) {
            throw new IllegalArgumentException("Forbidden");
        }

        return sendMessageInternal(conversation, sender, content.trim());
    }

    private DirectMessageResponse sendMessageInternal(Conversation conversation, User sender, String content) {
        DirectMessage message = new DirectMessage();
        message.setConversationId(conversation.getId());
        message.setSenderUserId(sender.getId());
        message.setSenderDisplayName(sender.getDisplayName() != null ? sender.getDisplayName() : "Anonymous");
        message.setContent(content);
        message.setCreatedAt(Instant.now());
        message = directMessageRepository.save(message);

        conversation.setLastMessageText(truncate(content, 100));
        conversation.setLastMessageAt(message.getCreatedAt());
        conversationRepository.save(conversation);

        return toMessageResponse(message);
    }

    public List<UserSearchResult> searchUsers(String userId, String query) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (currentUser.getUniversitySpaceId() == null) {
            return List.of();
        }

        List<User> results;
        if (query == null || query.isBlank()) {
            results = userRepository.findByUniversitySpaceId(currentUser.getUniversitySpaceId());
        } else {
            results = userRepository.findByUniversitySpaceIdAndDisplayNameContainingIgnoreCase(
                    currentUser.getUniversitySpaceId(), query.trim());
        }

        return results.stream()
                .filter(u -> !u.getId().equals(userId))
                .limit(MAX_SEARCH_RESULTS)
                .map(u -> new UserSearchResult(u.getId(), u.getDisplayName(), maskEmail(u.getEmail())))
                .collect(Collectors.toList());
    }

    private ConversationResponse toConversationResponse(Conversation c, Map<String, User> usersById) {
        List<ConversationResponse.ParticipantInfo> participants = c.getParticipantIds().stream()
                .map(id -> {
                    User u = usersById.get(id);
                    String name = u != null ? u.getDisplayName() : "Unknown";
                    return new ConversationResponse.ParticipantInfo(id, name);
                })
                .collect(Collectors.toList());

        return new ConversationResponse(
                c.getId(),
                participants,
                c.getLastMessageText(),
                c.getLastMessageAt(),
                c.getCreatedAt()
        );
    }

    private DirectMessageResponse toMessageResponse(DirectMessage m) {
        return new DirectMessageResponse(
                m.getId(),
                m.getConversationId(),
                m.getSenderUserId(),
                m.getSenderDisplayName(),
                m.getContent(),
                m.getCreatedAt()
        );
    }

    private static String truncate(String text, int maxLen) {
        if (text == null) return null;
        if (text.length() <= maxLen) return text;
        return text.substring(0, maxLen - 3) + "...";
    }

    private static String maskEmail(String email) {
        if (email == null) return null;
        int atIndex = email.indexOf('@');
        if (atIndex <= 1) return email;
        return email.charAt(0) + "***" + email.substring(atIndex);
    }
}
