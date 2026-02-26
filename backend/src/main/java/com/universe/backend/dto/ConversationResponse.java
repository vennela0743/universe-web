package com.universe.backend.dto;

import java.time.Instant;
import java.util.List;

public class ConversationResponse {

    private String id;
    private List<ParticipantInfo> participants;
    private String lastMessageText;
    private Instant lastMessageAt;
    private Instant createdAt;

    public ConversationResponse() {
    }

    public ConversationResponse(String id, List<ParticipantInfo> participants, String lastMessageText,
                                 Instant lastMessageAt, Instant createdAt) {
        this.id = id;
        this.participants = participants;
        this.lastMessageText = lastMessageText;
        this.lastMessageAt = lastMessageAt;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public List<ParticipantInfo> getParticipants() {
        return participants;
    }

    public void setParticipants(List<ParticipantInfo> participants) {
        this.participants = participants;
    }

    public String getLastMessageText() {
        return lastMessageText;
    }

    public void setLastMessageText(String lastMessageText) {
        this.lastMessageText = lastMessageText;
    }

    public Instant getLastMessageAt() {
        return lastMessageAt;
    }

    public void setLastMessageAt(Instant lastMessageAt) {
        this.lastMessageAt = lastMessageAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public static class ParticipantInfo {
        private String userId;
        private String displayName;

        public ParticipantInfo() {
        }

        public ParticipantInfo(String userId, String displayName) {
            this.userId = userId;
            this.displayName = displayName;
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
    }
}
