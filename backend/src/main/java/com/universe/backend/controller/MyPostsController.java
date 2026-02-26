package com.universe.backend.controller;

import com.universe.backend.dto.MessageResponse;
import com.universe.backend.dto.MyPostsResponse;
import com.universe.backend.service.MyPostsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/space/my-posts")
public class MyPostsController {

    private final MyPostsService myPostsService;

    public MyPostsController(MyPostsService myPostsService) {
        this.myPostsService = myPostsService;
    }

    @GetMapping
    public ResponseEntity<MyPostsResponse> getMyPosts() {
        String userId = getCurrentUserId();
        MyPostsResponse response = myPostsService.getMyPosts(userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/connect/{postId}")
    public ResponseEntity<MessageResponse> deleteConnectPost(@PathVariable String postId) {
        try {
            String userId = getCurrentUserId();
            myPostsService.deleteConnectPost(userId, postId);
            return ResponseEntity.ok(new MessageResponse("Post deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/opportunities/{opportunityId}")
    public ResponseEntity<MessageResponse> deleteOpportunity(@PathVariable String opportunityId) {
        try {
            String userId = getCurrentUserId();
            myPostsService.deleteOpportunity(userId, opportunityId);
            return ResponseEntity.ok(new MessageResponse("Opportunity deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/events/{eventId}")
    public ResponseEntity<MessageResponse> deleteEvent(@PathVariable String eventId) {
        try {
            String userId = getCurrentUserId();
            myPostsService.deleteEvent(userId, eventId);
            return ResponseEntity.ok(new MessageResponse("Event deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
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
