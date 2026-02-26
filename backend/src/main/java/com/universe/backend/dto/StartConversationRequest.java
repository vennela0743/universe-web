package com.universe.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class StartConversationRequest {

    @NotBlank(message = "Recipient user ID is required")
    private String recipientUserId;

    private String message;

    public String getRecipientUserId() {
        return recipientUserId;
    }

    public void setRecipientUserId(String recipientUserId) {
        this.recipientUserId = recipientUserId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
