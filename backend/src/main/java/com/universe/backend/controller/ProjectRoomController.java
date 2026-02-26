package com.universe.backend.controller;

import com.universe.backend.dto.*;
import com.universe.backend.service.ProjectRoomService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/space/pro/rooms")
public class ProjectRoomController {

    private final ProjectRoomService projectRoomService;

    public ProjectRoomController(ProjectRoomService projectRoomService) {
        this.projectRoomService = projectRoomService;
    }

    @GetMapping
    public ResponseEntity<List<ProjectRoomResponse>> listMyRooms() {
        String userId = getCurrentUserId();
        List<ProjectRoomResponse> rooms = projectRoomService.listMyRooms(userId);
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<ProjectRoomResponse> getRoom(@PathVariable String roomId) {
        String userId = getCurrentUserId();
        try {
            ProjectRoomResponse room = projectRoomService.getRoom(userId, roomId);
            return ResponseEntity.ok(room);
        } catch (IllegalArgumentException e) {
            if ("Room not found".equals(e.getMessage())) {
                return ResponseEntity.notFound().build();
            }
            if (e.getMessage().contains("not a member")) {
                return ResponseEntity.status(403).build();
            }
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{roomId}/members")
    public ResponseEntity<List<RoomMemberResponse>> getMembers(@PathVariable String roomId) {
        String userId = getCurrentUserId();
        try {
            List<RoomMemberResponse> members = projectRoomService.getMembers(userId, roomId);
            return ResponseEntity.ok(members);
        } catch (IllegalArgumentException e) {
            if ("Room not found".equals(e.getMessage())) {
                return ResponseEntity.notFound().build();
            }
            if (e.getMessage().contains("not a member")) {
                return ResponseEntity.status(403).build();
            }
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{roomId}/chat")
    public ResponseEntity<List<RoomChatMessageResponse>> getChatMessages(@PathVariable String roomId) {
        String userId = getCurrentUserId();
        try {
            List<RoomChatMessageResponse> messages = projectRoomService.getChatMessages(userId, roomId);
            return ResponseEntity.ok(messages);
        } catch (IllegalArgumentException e) {
            if ("Room not found".equals(e.getMessage())) {
                return ResponseEntity.notFound().build();
            }
            if (e.getMessage().contains("not a member")) {
                return ResponseEntity.status(403).build();
            }
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{roomId}/chat")
    public ResponseEntity<RoomChatMessageResponse> sendChatMessage(
            @PathVariable String roomId,
            @Valid @RequestBody SendChatRequest request) {
        String userId = getCurrentUserId();
        try {
            RoomChatMessageResponse msg = projectRoomService.sendChatMessage(userId, roomId, request);
            return ResponseEntity.ok(msg);
        } catch (IllegalArgumentException e) {
            if ("Room not found".equals(e.getMessage())) {
                return ResponseEntity.notFound().build();
            }
            if (e.getMessage().contains("not a member")) {
                return ResponseEntity.status(403).build();
            }
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{roomId}/updates")
    public ResponseEntity<List<RoomUpdateResponse>> getUpdates(@PathVariable String roomId) {
        String userId = getCurrentUserId();
        try {
            List<RoomUpdateResponse> updates = projectRoomService.getUpdates(userId, roomId);
            return ResponseEntity.ok(updates);
        } catch (IllegalArgumentException e) {
            if ("Room not found".equals(e.getMessage())) {
                return ResponseEntity.notFound().build();
            }
            if (e.getMessage().contains("not a member")) {
                return ResponseEntity.status(403).build();
            }
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{roomId}/updates")
    public ResponseEntity<RoomUpdateResponse> postUpdate(
            @PathVariable String roomId,
            @Valid @RequestBody PostRoomUpdateRequest request) {
        String userId = getCurrentUserId();
        try {
            RoomUpdateResponse update = projectRoomService.postUpdate(userId, roomId, request);
            return ResponseEntity.ok(update);
        } catch (IllegalArgumentException e) {
            if ("Room not found".equals(e.getMessage())) {
                return ResponseEntity.notFound().build();
            }
            if (e.getMessage().contains("not a member")) {
                return ResponseEntity.status(403).build();
            }
            return ResponseEntity.badRequest().build();
        }
    }

    private static String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null) {
            throw new IllegalStateException("Not authenticated");
        }
        return (String) auth.getPrincipal();
    }
}
