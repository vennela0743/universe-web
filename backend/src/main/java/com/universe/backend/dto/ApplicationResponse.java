package com.universe.backend.dto;

import java.time.Instant;

public class ApplicationResponse {

    private String id;
    private String opportunityId;
    private String applicantUserId;
    private String applicantDisplayName;
    private String message;
    private String status;
    private Instant createdAt;
    private String projectRoomId;

    public ApplicationResponse() {
    }

    public ApplicationResponse(String id, String opportunityId, String applicantUserId, String applicantDisplayName,
                               String message, String status, Instant createdAt, String projectRoomId) {
        this.id = id;
        this.opportunityId = opportunityId;
        this.applicantUserId = applicantUserId;
        this.applicantDisplayName = applicantDisplayName;
        this.message = message;
        this.status = status;
        this.createdAt = createdAt;
        this.projectRoomId = projectRoomId;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOpportunityId() {
        return opportunityId;
    }

    public void setOpportunityId(String opportunityId) {
        this.opportunityId = opportunityId;
    }

    public String getApplicantUserId() {
        return applicantUserId;
    }

    public void setApplicantUserId(String applicantUserId) {
        this.applicantUserId = applicantUserId;
    }

    public String getApplicantDisplayName() {
        return applicantDisplayName;
    }

    public void setApplicantDisplayName(String applicantDisplayName) {
        this.applicantDisplayName = applicantDisplayName;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getProjectRoomId() {
        return projectRoomId;
    }

    public void setProjectRoomId(String projectRoomId) {
        this.projectRoomId = projectRoomId;
    }
}
