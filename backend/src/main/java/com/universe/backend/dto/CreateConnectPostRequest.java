package com.universe.backend.dto;

import jakarta.validation.constraints.Size;

public class CreateConnectPostRequest {

    @Size(max = 500, message = "Post must be 500 characters or less")
    private String content;

    @Size(max = 5_000_000, message = "Image too large")
    private String imageData;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getImageData() {
        return imageData;
    }

    public void setImageData(String imageData) {
        this.imageData = imageData;
    }
}
