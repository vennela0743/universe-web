package com.universe.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class UniversityVerificationService {

    private final List<String> allowedDomains;

    public UniversityVerificationService(
            @Value("${universe.allowed-email-domains:edu,ac.in,ac.uk}") String allowedDomainsConfig) {
        this.allowedDomains = Arrays.stream(allowedDomainsConfig.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(s -> s.toLowerCase(Locale.ROOT).startsWith(".") ? s.toLowerCase(Locale.ROOT) : "." + s.toLowerCase(Locale.ROOT))
                .collect(Collectors.toList());
    }

    /**
     * Returns true if the email domain is allowed (e.g. user@university.edu -> .edu allowed).
     */
    public boolean isAllowedUniversityEmail(String email) {
        if (email == null || !email.contains("@")) {
            return false;
        }
        String domainPart = email.substring(email.indexOf("@") + 1).toLowerCase(Locale.ROOT);
        for (String allowed : allowedDomains) {
            if (domainPart.equals(allowed.substring(1)) || domainPart.endsWith(allowed)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Extract the university domain suffix for storage (e.g. university.edu -> edu).
     */
    public String extractUniversityDomain(String email) {
        if (email == null || !email.contains("@")) {
            return null;
        }
        return email.substring(email.indexOf("@") + 1).toLowerCase(Locale.ROOT);
    }
}
