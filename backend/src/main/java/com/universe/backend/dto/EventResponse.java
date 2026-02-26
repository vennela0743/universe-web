package com.universe.backend.dto;

import java.time.Instant;

public class EventResponse {

    private String id;
    private String title;
    private String description;
    private String type;
    private Instant startTime;
    private Instant endTime;
    private String location;
    private String organizerName;
    private String status;
    private String submittedByDisplayName;
    private String supportingDocuments; // only populated for admin pending list
    private Instant createdAt;

    public EventResponse() {
    }

    public EventResponse(String id, String title, String description, String type,
                         Instant startTime, Instant endTime, String location, String organizerName,
                         String status, String submittedByDisplayName, String supportingDocuments, Instant createdAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.type = type;
        this.startTime = startTime;
        this.endTime = endTime;
        this.location = location;
        this.organizerName = organizerName;
        this.status = status;
        this.submittedByDisplayName = submittedByDisplayName;
        this.supportingDocuments = supportingDocuments;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Instant getStartTime() { return startTime; }
    public void setStartTime(Instant startTime) { this.startTime = startTime; }
    public Instant getEndTime() { return endTime; }
    public void setEndTime(Instant endTime) { this.endTime = endTime; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getOrganizerName() { return organizerName; }
    public void setOrganizerName(String organizerName) { this.organizerName = organizerName; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getSubmittedByDisplayName() { return submittedByDisplayName; }
    public void setSubmittedByDisplayName(String submittedByDisplayName) { this.submittedByDisplayName = submittedByDisplayName; }
    public String getSupportingDocuments() { return supportingDocuments; }
    public void setSupportingDocuments(String supportingDocuments) { this.supportingDocuments = supportingDocuments; }
}
