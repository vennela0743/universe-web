package com.universe.backend.dto;

public class AuthResponse {

    private String token;
    private String email;
    private String displayName;
    private String userId;
    private String universitySpaceId;
    private String universitySpaceName;
    private String universitySpaceDomain;
    private String role;

    public AuthResponse() {
    }

    public AuthResponse(String token, String email, String displayName, String userId,
                        String universitySpaceId, String universitySpaceName, String universitySpaceDomain, String role) {
        this.token = token;
        this.email = email;
        this.displayName = displayName;
        this.userId = userId;
        this.universitySpaceId = universitySpaceId;
        this.universitySpaceName = universitySpaceName;
        this.universitySpaceDomain = universitySpaceDomain;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUniversitySpaceId() {
        return universitySpaceId;
    }

    public void setUniversitySpaceId(String universitySpaceId) {
        this.universitySpaceId = universitySpaceId;
    }

    public String getUniversitySpaceName() {
        return universitySpaceName;
    }

    public void setUniversitySpaceName(String universitySpaceName) {
        this.universitySpaceName = universitySpaceName;
    }

    public String getUniversitySpaceDomain() {
        return universitySpaceDomain;
    }

    public void setUniversitySpaceDomain(String universitySpaceDomain) {
        this.universitySpaceDomain = universitySpaceDomain;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
