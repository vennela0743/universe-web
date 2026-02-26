package com.universe.backend.controller;

import com.universe.backend.dto.ConnectPostResponse;
import com.universe.backend.dto.CreateConnectPostRequest;
import com.universe.backend.service.ConnectService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/space/connect")
public class ConnectController {

    private final ConnectService connectService;

    public ConnectController(ConnectService connectService) {
        this.connectService = connectService;
    }

    @PostMapping("/posts")
    public ResponseEntity<ConnectPostResponse> createPost(@Valid @RequestBody CreateConnectPostRequest request) {
        String userId = getCurrentUserId();
        ConnectPostResponse created = connectService.create(userId, request.getContent(), request.getImageData());
        return ResponseEntity.ok(created);
    }

    @GetMapping("/posts")
    public ResponseEntity<List<ConnectPostResponse>> listPosts() {
        String userId = getCurrentUserId();
        List<ConnectPostResponse> posts = connectService.listForCurrentUser(userId);
        return ResponseEntity.ok(posts);
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable String postId) {
        String userId = getCurrentUserId();
        try {
            connectService.delete(userId, postId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            if ("Post not found".equals(e.getMessage())) {
                return ResponseEntity.notFound().build();
            }
            if ("You can only delete your own posts".equals(e.getMessage())) {
                return ResponseEntity.status(403).build();
            }
            throw e;
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
