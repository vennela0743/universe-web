package com.universe.backend.controller;

import com.universe.backend.dto.ConversationResponse;
import com.universe.backend.dto.DirectMessageResponse;
import com.universe.backend.dto.SendDMRequest;
import com.universe.backend.dto.StartConversationRequest;
import com.universe.backend.dto.UserSearchResult;
import com.universe.backend.service.DMService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dm")
public class DMController {

    private final DMService dmService;

    public DMController(DMService dmService) {
        this.dmService = dmService;
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationResponse>> listConversations() {
        String userId = getCurrentUserId();
        List<ConversationResponse> conversations = dmService.listConversations(userId);
        return ResponseEntity.ok(conversations);
    }

    @PostMapping("/conversations")
    public ResponseEntity<ConversationResponse> startConversation(
            @Valid @RequestBody StartConversationRequest request) {
        String userId = getCurrentUserId();
        try {
            ConversationResponse conv = dmService.startOrGetConversation(
                    userId, request.getRecipientUserId(), request.getMessage());
            return ResponseEntity.ok(conv);
        } catch (IllegalArgumentException e) {
            if ("Recipient not found".equals(e.getMessage())) {
                return ResponseEntity.notFound().build();
            }
            if ("Cannot message users outside your university".equals(e.getMessage()) ||
                "Cannot message yourself".equals(e.getMessage())) {
                return ResponseEntity.badRequest().build();
            }
            throw e;
        }
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<DirectMessageResponse>> getMessages(
            @PathVariable String conversationId) {
        String userId = getCurrentUserId();
        try {
            List<DirectMessageResponse> messages = dmService.getMessages(userId, conversationId);
            return ResponseEntity.ok(messages);
        } catch (IllegalArgumentException e) {
            if ("Conversation not found".equals(e.getMessage())) {
                return ResponseEntity.notFound().build();
            }
            if ("Forbidden".equals(e.getMessage())) {
                return ResponseEntity.status(403).build();
            }
            throw e;
        }
    }

    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<DirectMessageResponse> sendMessage(
            @PathVariable String conversationId,
            @Valid @RequestBody SendDMRequest request) {
        String userId = getCurrentUserId();
        try {
            DirectMessageResponse message = dmService.sendMessage(userId, conversationId, request.getContent());
            return ResponseEntity.ok(message);
        } catch (IllegalArgumentException e) {
            if ("Conversation not found".equals(e.getMessage())) {
                return ResponseEntity.notFound().build();
            }
            if ("Forbidden".equals(e.getMessage())) {
                return ResponseEntity.status(403).build();
            }
            throw e;
        }
    }

    @GetMapping("/users/search")
    public ResponseEntity<List<UserSearchResult>> searchUsers(
            @RequestParam(required = false, defaultValue = "") String q) {
        String userId = getCurrentUserId();
        List<UserSearchResult> results = dmService.searchUsers(userId, q);
        return ResponseEntity.ok(results);
    }

    private static String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null) {
            throw new IllegalStateException("Not authenticated");
        }
        return (String) auth.getPrincipal();
    }
}
