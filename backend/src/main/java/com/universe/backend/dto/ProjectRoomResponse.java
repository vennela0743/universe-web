package com.universe.backend.dto;

import java.time.Instant;
import java.util.List;

public class ProjectRoomResponse {

    private String id;
    private String opportunityId;
    private String title;
    private Instant createdAt;
    private List<RoomMemberResponse> members;

    public ProjectRoomResponse() {
    }

    public ProjectRoomResponse(String id, String opportunityId, String title, Instant createdAt, List<RoomMemberResponse> members) {
        this.id = id;
        this.opportunityId = opportunityId;
        this.title = title;
        this.createdAt = createdAt;
        this.members = members;
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public List<RoomMemberResponse> getMembers() {
        return members;
    }

    public void setMembers(List<RoomMemberResponse> members) {
        this.members = members;
    }
}
