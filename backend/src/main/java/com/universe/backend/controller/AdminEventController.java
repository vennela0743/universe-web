package com.universe.backend.controller;

import com.universe.backend.dto.EventResponse;
import com.universe.backend.service.EventService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/events")
public class AdminEventController {

    private final EventService eventService;

    public AdminEventController(EventService eventService) {
        this.eventService = eventService;
    }

    private static String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null) {
            throw new IllegalStateException("Not authenticated");
        }
        return (String) auth.getPrincipal();
    }

    @GetMapping("/pending")
    public ResponseEntity<?> listPending() {
        String userId = getCurrentUserId();
        try {
            List<EventResponse> list = eventService.listPendingForAdmin(userId);
            return ResponseEntity.ok(list);
        } catch (IllegalArgumentException e) {
            if ("Forbidden".equals(e.getMessage())) {
                return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
            }
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{eventId}/approve")
    public ResponseEntity<?> approve(@PathVariable String eventId) {
        String userId = getCurrentUserId();
        try {
            EventResponse event = eventService.approve(userId, eventId);
            return ResponseEntity.ok(event);
        } catch (IllegalArgumentException e) {
            if ("Forbidden".equals(e.getMessage())) {
                return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
            }
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{eventId}/reject")
    public ResponseEntity<?> reject(@PathVariable String eventId) {
        String userId = getCurrentUserId();
        try {
            EventResponse event = eventService.reject(userId, eventId);
            return ResponseEntity.ok(event);
        } catch (IllegalArgumentException e) {
            if ("Forbidden".equals(e.getMessage())) {
                return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
            }
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
