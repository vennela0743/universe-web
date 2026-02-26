package com.universe.backend.service;

import com.universe.backend.model.UniversitySpace;
import com.universe.backend.repository.UniversitySpaceRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class UniversitySpaceService {

    private final UniversitySpaceRepository universitySpaceRepository;
    private final UniversityDomainMappingService domainMappingService;

    public UniversitySpaceService(UniversitySpaceRepository universitySpaceRepository,
                                   UniversityDomainMappingService domainMappingService) {
        this.universitySpaceRepository = universitySpaceRepository;
        this.domainMappingService = domainMappingService;
    }

    /**
     * Find an existing UniversitySpace by domain, or create one if missing.
     * One Space per domain.
     */
    public UniversitySpace findOrCreateByDomain(String domain) {
        if (domain == null || domain.isBlank()) {
            throw new IllegalArgumentException("Domain is required");
        }
        String normalizedDomain = domain.trim().toLowerCase();
        return universitySpaceRepository.findByDomainIgnoreCase(normalizedDomain)
                .orElseGet(() -> {
                    UniversitySpace space = new UniversitySpace();
                    space.setDomain(normalizedDomain);
                    space.setName(domainMappingService.getUniversityName(normalizedDomain));
                    space.setCreatedAt(Instant.now());
                    return universitySpaceRepository.save(space);
                });
    }

    public UniversitySpace findById(String id) {
        return universitySpaceRepository.findById(id).orElse(null);
    }

    /**
     * Updates the name of an existing university space using the domain mapping.
     * Call this to refresh the name after adding new mappings.
     */
    public void refreshUniversityName(String spaceId) {
        UniversitySpace space = universitySpaceRepository.findById(spaceId).orElse(null);
        if (space != null) {
            String newName = domainMappingService.getUniversityName(space.getDomain());
            if (!newName.equals(space.getName())) {
                space.setName(newName);
                universitySpaceRepository.save(space);
            }
        }
    }

    /**
     * Refreshes all university space names from the domain mappings.
     */
    public void refreshAllUniversityNames() {
        universitySpaceRepository.findAll().forEach(space -> {
            String newName = domainMappingService.getUniversityName(space.getDomain());
            if (!newName.equals(space.getName())) {
                space.setName(newName);
                universitySpaceRepository.save(space);
            }
        });
    }
}
