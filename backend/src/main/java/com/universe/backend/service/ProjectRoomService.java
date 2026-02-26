package com.universe.backend.service;

import com.universe.backend.dto.*;
import com.universe.backend.model.*;
import com.universe.backend.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectRoomService {

    private static final int MAX_CHAT = 100;
    private static final int MAX_UPDATES = 50;

    private final ProjectRoomRepository projectRoomRepository;
    private final ProjectRoomMemberRepository projectRoomMemberRepository;
    private final RoomChatMessageRepository roomChatMessageRepository;
    private final RoomUpdateRepository roomUpdateRepository;
    private final UserRepository userRepository;

    public ProjectRoomService(ProjectRoomRepository projectRoomRepository,
                              ProjectRoomMemberRepository projectRoomMemberRepository,
                              RoomChatMessageRepository roomChatMessageRepository,
                              RoomUpdateRepository roomUpdateRepository,
                              UserRepository userRepository) {
        this.projectRoomRepository = projectRoomRepository;
        this.projectRoomMemberRepository = projectRoomMemberRepository;
        this.roomChatMessageRepository = roomChatMessageRepository;
        this.roomUpdateRepository = roomUpdateRepository;
        this.userRepository = userRepository;
    }

    public ProjectRoomResponse getRoom(String userId, String roomId) {
        ensureMember(userId, roomId);
        ProjectRoom room = projectRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
        List<RoomMemberResponse> members = projectRoomMemberRepository.findByRoomIdOrderByJoinedAtAsc(roomId).stream()
                .map(m -> new RoomMemberResponse(m.getUserId(), m.getDisplayName(), m.getJoinedAt()))
                .collect(Collectors.toList());
        return new ProjectRoomResponse(room.getId(), room.getOpportunityId(), room.getTitle(), room.getCreatedAt(), members);
    }

    public List<ProjectRoomResponse> listMyRooms(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.getUniversitySpaceId() == null || user.getUniversitySpaceId().isBlank()) {
            return List.of();
        }
        List<String> roomIds = projectRoomMemberRepository.findByUserId(userId).stream()
                .map(ProjectRoomMember::getRoomId)
                .distinct()
                .toList();
        return roomIds.stream()
                .map(rid -> projectRoomRepository.findById(rid).orElse(null))
                .filter(r -> r != null && user.getUniversitySpaceId().equals(r.getUniversitySpaceId()))
                .map(r -> {
                    List<RoomMemberResponse> members = projectRoomMemberRepository.findByRoomIdOrderByJoinedAtAsc(r.getId()).stream()
                            .map(m -> new RoomMemberResponse(m.getUserId(), m.getDisplayName(), m.getJoinedAt()))
                            .collect(Collectors.toList());
                    return new ProjectRoomResponse(r.getId(), r.getOpportunityId(), r.getTitle(), r.getCreatedAt(), members);
                })
                .collect(Collectors.toList());
    }

    public List<RoomMemberResponse> getMembers(String userId, String roomId) {
        ensureMember(userId, roomId);
        return projectRoomMemberRepository.findByRoomIdOrderByJoinedAtAsc(roomId).stream()
                .map(m -> new RoomMemberResponse(m.getUserId(), m.getDisplayName(), m.getJoinedAt()))
                .collect(Collectors.toList());
    }

    public List<RoomChatMessageResponse> getChatMessages(String userId, String roomId) {
        ensureMember(userId, roomId);
        List<RoomChatMessage> messages = roomChatMessageRepository.findByRoomIdOrderByCreatedAtAsc(roomId, PageRequest.of(0, MAX_CHAT));
        return messages.stream().map(this::toChatResponse).collect(Collectors.toList());
    }

    public RoomChatMessageResponse sendChatMessage(String userId, String roomId, SendChatRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        ensureMember(userId, roomId);
        RoomChatMessage msg = new RoomChatMessage();
        msg.setRoomId(roomId);
        msg.setAuthorUserId(user.getId());
        msg.setAuthorDisplayName(user.getDisplayName() != null ? user.getDisplayName() : "Anonymous");
        msg.setContent(request.getContent().trim());
        msg.setCreatedAt(Instant.now());
        msg = roomChatMessageRepository.save(msg);
        return toChatResponse(msg);
    }

    public List<RoomUpdateResponse> getUpdates(String userId, String roomId) {
        ensureMember(userId, roomId);
        List<RoomUpdate> updates = roomUpdateRepository.findByRoomIdOrderByCreatedAtDesc(roomId, PageRequest.of(0, MAX_UPDATES));
        return updates.stream().map(this::toUpdateResponse).collect(Collectors.toList());
    }

    public RoomUpdateResponse postUpdate(String userId, String roomId, PostRoomUpdateRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        ensureMember(userId, roomId);
        RoomUpdate update = new RoomUpdate();
        update.setRoomId(roomId);
        update.setAuthorUserId(user.getId());
        update.setAuthorDisplayName(user.getDisplayName() != null ? user.getDisplayName() : "Anonymous");
        update.setContent(request.getContent().trim());
        update.setCreatedAt(Instant.now());
        update = roomUpdateRepository.save(update);
        return toUpdateResponse(update);
    }

    private void ensureMember(String userId, String roomId) {
        ProjectRoom room = projectRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.getUniversitySpaceId() == null || !user.getUniversitySpaceId().equals(room.getUniversitySpaceId())) {
            throw new IllegalArgumentException("Room not found");
        }
        if (!projectRoomMemberRepository.existsByRoomIdAndUserId(roomId, userId)) {
            throw new IllegalArgumentException("You are not a member of this room");
        }
    }

    private RoomChatMessageResponse toChatResponse(RoomChatMessage m) {
        return new RoomChatMessageResponse(m.getId(), m.getAuthorUserId(), m.getAuthorDisplayName(), m.getContent(), m.getCreatedAt());
    }

    private RoomUpdateResponse toUpdateResponse(RoomUpdate u) {
        return new RoomUpdateResponse(u.getId(), u.getAuthorUserId(), u.getAuthorDisplayName(), u.getContent(), u.getCreatedAt());
    }
}
