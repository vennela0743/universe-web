package com.universe.backend.controller;

import com.universe.backend.dto.*;
import com.universe.backend.service.ProService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/space/pro")
public class ProController {

    private final ProService proService;

    public ProController(ProService proService) {
        this.proService = proService;
    }

    @PostMapping("/opportunities")
    public ResponseEntity<OpportunityResponse> createOpportunity(@Valid @RequestBody CreateOpportunityRequest request) {
        String userId = getCurrentUserId();
        OpportunityResponse created = proService.createOpportunity(userId, request);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/opportunities")
    public ResponseEntity<List<OpportunityResponse>> listOpportunities(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) List<String> skills) {
        String userId = getCurrentUserId();
        List<OpportunityResponse> list = proService.listOpportunities(userId, type, skills);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/opportunities/{opportunityId}")
    public ResponseEntity<OpportunityResponse> getOpportunity(@PathVariable String opportunityId) {
        String userId = getCurrentUserId();
        OpportunityResponse opp = proService.getOpportunity(userId, opportunityId);
        return ResponseEntity.ok(opp);
    }

    @GetMapping("/applications/me")
    public ResponseEntity<List<ApplicationResponse>> listMyApplications() {
        String userId = getCurrentUserId();
        List<ApplicationResponse> list = proService.listMyApplications(userId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/opportunities/{opportunityId}/my-application")
    public ResponseEntity<ApplicationResponse> getMyApplication(@PathVariable String opportunityId) {
        String userId = getCurrentUserId();
        try {
            ApplicationResponse app = proService.getMyApplication(userId, opportunityId);
            return ResponseEntity.ok(app);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/opportunities/{opportunityId}/apply")
    public ResponseEntity<ApplicationResponse> apply(
            @PathVariable String opportunityId,
            @Valid @RequestBody ApplyRequest request) {
        String userId = getCurrentUserId();
        ApplicationResponse app = proService.apply(userId, opportunityId, request);
        return ResponseEntity.ok(app);
    }

    @GetMapping("/opportunities/{opportunityId}/applications")
    public ResponseEntity<List<ApplicationResponse>> listApplications(@PathVariable String opportunityId) {
        String userId = getCurrentUserId();
        List<ApplicationResponse> list = proService.listApplicationsForOpportunity(userId, opportunityId);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/applications/{applicationId}/accept")
    public ResponseEntity<ApplicationResponse> acceptApplication(@PathVariable String applicationId) {
        String userId = getCurrentUserId();
        try {
            ApplicationResponse app = proService.acceptApplication(userId, applicationId);
            return ResponseEntity.ok(app);
        } catch (IllegalArgumentException e) {
            if ("Application not found".equals(e.getMessage())) {
                return ResponseEntity.notFound().build();
            }
            if (e.getMessage().contains("owner") || e.getMessage().contains("pending")) {
                return ResponseEntity.status(403).build();
            }
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/applications/{applicationId}/decline")
    public ResponseEntity<ApplicationResponse> declineApplication(@PathVariable String applicationId) {
        String userId = getCurrentUserId();
        try {
            ApplicationResponse app = proService.declineApplication(userId, applicationId);
            return ResponseEntity.ok(app);
        } catch (IllegalArgumentException e) {
            if ("Application not found".equals(e.getMessage())) {
                return ResponseEntity.notFound().build();
            }
            if (e.getMessage().contains("owner") || e.getMessage().contains("pending")) {
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
