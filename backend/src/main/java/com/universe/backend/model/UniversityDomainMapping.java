package com.universe.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "university_domain_mappings")
public class UniversityDomainMapping {

    @Id
    private String id;

    @Indexed(unique = true)
    private String domain;

    private String universityName;

    private String shortName;

    private String state;

    private String country;

    public UniversityDomainMapping() {}

    public UniversityDomainMapping(String domain, String universityName, String shortName, String state) {
        this.domain = domain;
        this.universityName = universityName;
        this.shortName = shortName;
        this.state = state;
        this.country = "USA";
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public String getUniversityName() {
        return universityName;
    }

    public void setUniversityName(String universityName) {
        this.universityName = universityName;
    }

    public String getShortName() {
        return shortName;
    }

    public void setShortName(String shortName) {
        this.shortName = shortName;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }
}
