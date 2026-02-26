package com.universe.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public class CreateOpportunityRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200)
    private String title;

    @NotBlank(message = "Type is required")
    private String type; // hackathon, project, research

    private List<String> skillsNeeded;

    @Size(max = 100)
    private String duration;

    @Size(max = 100)
    private String commitment;

    @Size(max = 2000)
    private String description;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<String> getSkillsNeeded() {
        return skillsNeeded;
    }

    public void setSkillsNeeded(List<String> skillsNeeded) {
        this.skillsNeeded = skillsNeeded;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getCommitment() {
        return commitment;
    }

    public void setCommitment(String commitment) {
        this.commitment = commitment;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
