package com.universe.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "applications")
public class Application {

    @Id
    private String id;

    @Indexed
    private String opportunityId;

    @Indexed
    private String universitySpaceId;

    @Indexed
    private String applicantUserId;
    private String applicantDisplayName;
    private String message;
    private String status; // PENDING, ACCEPTED, DECLINED
    private Instant createdAt;
    private Instant processedAt;
    private String projectRoomId; // set when accepted

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

    public String getUniversitySpaceId() {
        return universitySpaceId;
    }

    public void setUniversitySpaceId(String universitySpaceId) {
        this.universitySpaceId = universitySpaceId;
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

    public Instant getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(Instant processedAt) {
        this.processedAt = processedAt;
    }

    public String getProjectRoomId() {
        return projectRoomId;
    }

    public void setProjectRoomId(String projectRoomId) {
        this.projectRoomId = projectRoomId;
    }
}
