package com.universe.backend.dto;

import java.util.List;

public class MyPostsResponse {

    private List<ConnectPostResponse> connectPosts;
    private List<OpportunityResponse> opportunities;
    private List<EventResponse> events;

    public MyPostsResponse() {}

    public MyPostsResponse(List<ConnectPostResponse> connectPosts, 
                           List<OpportunityResponse> opportunities,
                           List<EventResponse> events) {
        this.connectPosts = connectPosts;
        this.opportunities = opportunities;
        this.events = events;
    }

    public List<ConnectPostResponse> getConnectPosts() {
        return connectPosts;
    }

    public void setConnectPosts(List<ConnectPostResponse> connectPosts) {
        this.connectPosts = connectPosts;
    }

    public List<OpportunityResponse> getOpportunities() {
        return opportunities;
    }

    public void setOpportunities(List<OpportunityResponse> opportunities) {
        this.opportunities = opportunities;
    }

    public List<EventResponse> getEvents() {
        return events;
    }

    public void setEvents(List<EventResponse> events) {
        this.events = events;
    }
}
