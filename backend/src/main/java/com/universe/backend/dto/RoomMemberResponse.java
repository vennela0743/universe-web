package com.universe.backend.dto;

import java.time.Instant;

public class RoomMemberResponse {

    private String userId;
    private String displayName;
    private Instant joinedAt;

    public RoomMemberResponse() {
    }

    public RoomMemberResponse(String userId, String displayName, Instant joinedAt) {
        this.userId = userId;
        this.displayName = displayName;
        this.joinedAt = joinedAt;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public Instant getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(Instant joinedAt) {
        this.joinedAt = joinedAt;
    }
}
