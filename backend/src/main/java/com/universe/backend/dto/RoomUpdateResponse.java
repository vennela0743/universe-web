package com.universe.backend.dto;

import java.time.Instant;

public class RoomUpdateResponse {

    private String id;
    private String authorUserId;
    private String authorDisplayName;
    private String content;
    private Instant createdAt;

    public RoomUpdateResponse() {
    }

    public RoomUpdateResponse(String id, String authorUserId, String authorDisplayName, String content, Instant createdAt) {
        this.id = id;
        this.authorUserId = authorUserId;
        this.authorDisplayName = authorDisplayName;
        this.content = content;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getAuthorUserId() {
        return authorUserId;
    }

    public void setAuthorUserId(String authorUserId) {
        this.authorUserId = authorUserId;
    }

    public String getAuthorDisplayName() {
        return authorDisplayName;
    }

    public void setAuthorDisplayName(String authorDisplayName) {
        this.authorDisplayName = authorDisplayName;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
