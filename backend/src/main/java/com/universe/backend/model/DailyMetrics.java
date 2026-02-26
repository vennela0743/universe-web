package com.universe.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Simple daily counters per University Space. One document per (date, space).
 */
@Document(collection = "daily_metrics")
@CompoundIndex(name = "date_space", def = "{ 'date' : 1, 'universitySpaceId' : 1 }", unique = true)
public class DailyMetrics {

    @Id
    private String id;

    private String date; // YYYY-MM-DD
    private String universitySpaceId;
    private String spaceName;
    private long loginCount;
    private long postsCreatedCount;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getUniversitySpaceId() {
        return universitySpaceId;
    }

    public void setUniversitySpaceId(String universitySpaceId) {
        this.universitySpaceId = universitySpaceId;
    }

    public String getSpaceName() {
        return spaceName;
    }

    public void setSpaceName(String spaceName) {
        this.spaceName = spaceName;
    }

    public long getLoginCount() {
        return loginCount;
    }

    public void setLoginCount(long loginCount) {
        this.loginCount = loginCount;
    }

    public long getPostsCreatedCount() {
        return postsCreatedCount;
    }

    public void setPostsCreatedCount(long postsCreatedCount) {
        this.postsCreatedCount = postsCreatedCount;
    }
}
