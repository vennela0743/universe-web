package com.universe.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SendDMRequest {

    @NotBlank(message = "Message cannot be empty")
    @Size(max = 2000, message = "Message must be 2000 characters or less")
    private String content;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
