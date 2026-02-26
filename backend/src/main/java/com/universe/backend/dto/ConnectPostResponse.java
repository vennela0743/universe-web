package com.universe.backend.dto;

import java.time.Instant;

public class ConnectPostResponse {

    private String id;
    private String content;
    private String imageUrl;
    private String authorDisplayName;
    private String authorUserId;
    private Instant createdAt;

    public ConnectPostResponse() {
    }

    public ConnectPostResponse(String id, String content, String imageUrl, String authorDisplayName, String authorUserId, Instant createdAt) {
        this.id = id;
        this.content = content;
        this.imageUrl = imageUrl;
        this.authorDisplayName = authorDisplayName;
        this.authorUserId = authorUserId;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getAuthorDisplayName() {
        return authorDisplayName;
    }

    public void setAuthorDisplayName(String authorDisplayName) {
        this.authorDisplayName = authorDisplayName;
    }

    public String getAuthorUserId() {
        return authorUserId;
    }

    public void setAuthorUserId(String authorUserId) {
        this.authorUserId = authorUserId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
