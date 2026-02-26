package com.universe.backend.dto;

import java.time.Instant;
import java.util.List;

public class OpportunityResponse {

    private String id;
    private String ownerUserId;
    private String ownerDisplayName;
    private String title;
    private String type;
    private List<String> skillsNeeded;
    private String duration;
    private String commitment;
    private String description;
    private Instant createdAt;

    public OpportunityResponse() {
    }

    public OpportunityResponse(String id, String ownerUserId, String ownerDisplayName, String title,
                               String type, List<String> skillsNeeded, String duration, String commitment,
                               String description, Instant createdAt) {
        this.id = id;
        this.ownerUserId = ownerUserId;
        this.ownerDisplayName = ownerDisplayName;
        this.title = title;
        this.type = type;
        this.skillsNeeded = skillsNeeded;
        this.duration = duration;
        this.commitment = commitment;
        this.description = description;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOwnerUserId() {
        return ownerUserId;
    }

    public void setOwnerUserId(String ownerUserId) {
        this.ownerUserId = ownerUserId;
    }

    public String getOwnerDisplayName() {
        return ownerDisplayName;
    }

    public void setOwnerDisplayName(String ownerDisplayName) {
        this.ownerDisplayName = ownerDisplayName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<String> getSkillsNeeded() {
        return skillsNeeded;
    }

    public void setSkillsNeeded(List<String> skillsNeeded) {
        this.skillsNeeded = skillsNeeded;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getCommitment() {
        return commitment;
    }

    public void setCommitment(String commitment) {
        this.commitment = commitment;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
