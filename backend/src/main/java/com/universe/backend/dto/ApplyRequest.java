package com.universe.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ApplyRequest {

    @NotBlank(message = "Cover letter or pitch is required")
    @Size(max = 3000, message = "Cover letter must be 3000 characters or less")
    private String message;

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
