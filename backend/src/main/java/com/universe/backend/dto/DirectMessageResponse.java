package com.universe.backend.dto;

import java.time.Instant;

public class DirectMessageResponse {

    private String id;
    private String conversationId;
    private String senderUserId;
    private String senderDisplayName;
    private String content;
    private Instant createdAt;

    public DirectMessageResponse() {
    }

    public DirectMessageResponse(String id, String conversationId, String senderUserId,
                                  String senderDisplayName, String content, Instant createdAt) {
        this.id = id;
        this.conversationId = conversationId;
        this.senderUserId = senderUserId;
        this.senderDisplayName = senderDisplayName;
        this.content = content;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public String getSenderUserId() {
        return senderUserId;
    }

    public void setSenderUserId(String senderUserId) {
        this.senderUserId = senderUserId;
    }

    public String getSenderDisplayName() {
        return senderDisplayName;
    }

    public void setSenderDisplayName(String senderDisplayName) {
        this.senderDisplayName = senderDisplayName;
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
