package com.universe.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "events")
public class Event {

    @Id
    private String id;

    @Indexed
    private String universitySpaceId;

    private String title;
    private String description;
    private String type; // event, hackathon
    private Instant startTime;
    private Instant endTime;
    private String location;
    private String organizerName;
    private String status; // PENDING, APPROVED, REJECTED
    private String submittedByUserId;
    private String submittedByDisplayName;
    private String supportingDocuments; // required on submit; links or description
    private Instant createdAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUniversitySpaceId() {
        return universitySpaceId;
    }

    public void setUniversitySpaceId(String universitySpaceId) {
        this.universitySpaceId = universitySpaceId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }

    public Instant getEndTime() {
        return endTime;
    }

    public void setEndTime(Instant endTime) {
        this.endTime = endTime;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getOrganizerName() {
        return organizerName;
    }

    public void setOrganizerName(String organizerName) {
        this.organizerName = organizerName;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getSubmittedByUserId() { return submittedByUserId; }
    public void setSubmittedByUserId(String submittedByUserId) { this.submittedByUserId = submittedByUserId; }
    public String getSubmittedByDisplayName() { return submittedByDisplayName; }
    public void setSubmittedByDisplayName(String submittedByDisplayName) { this.submittedByDisplayName = submittedByDisplayName; }
    public String getSupportingDocuments() { return supportingDocuments; }
    public void setSupportingDocuments(String supportingDocuments) { this.supportingDocuments = supportingDocuments; }
}
