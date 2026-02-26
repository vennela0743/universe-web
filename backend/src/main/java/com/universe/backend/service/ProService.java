package com.universe.backend.service;

import com.universe.backend.dto.*;
import com.universe.backend.model.*;
import com.universe.backend.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProService {

    private static final int MAX_OPPORTUNITIES = 100;
    private static final List<String> VALID_TYPES = List.of("hackathon", "project", "research");

    private final OpportunityRepository opportunityRepository;
    private final ApplicationRepository applicationRepository;
    private final ProjectRoomRepository projectRoomRepository;
    private final ProjectRoomMemberRepository projectRoomMemberRepository;
    private final UserRepository userRepository;

    public ProService(OpportunityRepository opportunityRepository,
                      ApplicationRepository applicationRepository,
                      ProjectRoomRepository projectRoomRepository,
                      ProjectRoomMemberRepository projectRoomMemberRepository,
                      UserRepository userRepository) {
        this.opportunityRepository = opportunityRepository;
        this.applicationRepository = applicationRepository;
        this.projectRoomRepository = projectRoomRepository;
        this.projectRoomMemberRepository = projectRoomMemberRepository;
        this.userRepository = userRepository;
    }

    public OpportunityResponse createOpportunity(String userId, CreateOpportunityRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.getUniversitySpaceId() == null || user.getUniversitySpaceId().isBlank()) {
            throw new IllegalArgumentException("User has no university space assigned");
        }
        String type = request.getType() != null ? request.getType().toLowerCase().trim() : "";
        if (!VALID_TYPES.contains(type)) {
            throw new IllegalArgumentException("Type must be hackathon, project, or research");
        }

        Opportunity opp = new Opportunity();
        opp.setUniversitySpaceId(user.getUniversitySpaceId());
        opp.setOwnerUserId(user.getId());
        opp.setOwnerDisplayName(user.getDisplayName() != null ? user.getDisplayName() : "Anonymous");
        opp.setTitle(request.getTitle().trim());
        opp.setType(type);
        opp.setSkillsNeeded(request.getSkillsNeeded() != null ? request.getSkillsNeeded() : List.of());
        opp.setDuration(request.getDuration() != null ? request.getDuration().trim() : "");
        opp.setCommitment(request.getCommitment() != null ? request.getCommitment().trim() : "");
        opp.setDescription(request.getDescription() != null ? request.getDescription().trim() : "");
        opp.setCreatedAt(Instant.now());
        opp = opportunityRepository.save(opp);
        return toOpportunityResponse(opp);
    }

    public List<OpportunityResponse> listOpportunities(String userId, String typeFilter, List<String> skillsFilter) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.getUniversitySpaceId() == null || user.getUniversitySpaceId().isBlank()) {
            return List.of();
        }
        String spaceId = user.getUniversitySpaceId();
        List<Opportunity> list;
        if (typeFilter != null && !typeFilter.isBlank() && VALID_TYPES.contains(typeFilter.toLowerCase())) {
            list = opportunityRepository.findByUniversitySpaceIdAndTypeOrderByCreatedAtDesc(
                    spaceId, typeFilter.toLowerCase(), PageRequest.of(0, MAX_OPPORTUNITIES));
        } else {
            list = opportunityRepository.findByUniversitySpaceIdOrderByCreatedAtDesc(
                    spaceId, PageRequest.of(0, MAX_OPPORTUNITIES));
        }
        List<OpportunityResponse> result = list.stream().map(this::toOpportunityResponse).collect(Collectors.toList());
        if (skillsFilter != null && !skillsFilter.isEmpty()) {
            List<String> lower = skillsFilter.stream().map(s -> s.toLowerCase().trim()).toList();
            result = result.stream()
                    .filter(o -> o.getSkillsNeeded() != null && o.getSkillsNeeded().stream()
                            .anyMatch(s -> lower.contains(s.toLowerCase())))
                    .collect(Collectors.toList());
        }
        return result;
    }

    public OpportunityResponse getOpportunity(String userId, String opportunityId) {
        Opportunity opp = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new IllegalArgumentException("Opportunity not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.getUniversitySpaceId() == null || !user.getUniversitySpaceId().equals(opp.getUniversitySpaceId())) {
            throw new IllegalArgumentException("Opportunity not found");
        }
        return toOpportunityResponse(opp);
    }

    public ApplicationResponse apply(String userId, String opportunityId, ApplyRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.getUniversitySpaceId() == null || user.getUniversitySpaceId().isBlank()) {
            throw new IllegalArgumentException("User has no university space assigned");
        }
        Opportunity opp = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new IllegalArgumentException("Opportunity not found"));
        if (!opp.getUniversitySpaceId().equals(user.getUniversitySpaceId())) {
            throw new IllegalArgumentException("Opportunity not found");
        }
        if (opp.getOwnerUserId().equals(userId)) {
            throw new IllegalArgumentException("You cannot apply to your own opportunity");
        }
        if (applicationRepository.existsByOpportunityIdAndApplicantUserId(opportunityId, userId)) {
            throw new IllegalArgumentException("You have already applied");
        }

        Application app = new Application();
        app.setOpportunityId(opportunityId);
        app.setUniversitySpaceId(opp.getUniversitySpaceId());
        app.setApplicantUserId(user.getId());
        app.setApplicantDisplayName(user.getDisplayName() != null ? user.getDisplayName() : "Anonymous");
        app.setMessage(request.getMessage().trim());
        app.setStatus("PENDING");
        app.setCreatedAt(Instant.now());
        app = applicationRepository.save(app);
        return toApplicationResponse(app);
    }

    public ApplicationResponse getMyApplication(String userId, String opportunityId) {
        Application app = applicationRepository.findByOpportunityIdAndApplicantUserId(opportunityId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));
        return toApplicationResponse(app);
    }

    public List<ApplicationResponse> listMyApplications(String userId) {
        return applicationRepository.findByApplicantUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toApplicationResponse)
                .collect(Collectors.toList());
    }

    public List<ApplicationResponse> listApplicationsForOpportunity(String userId, String opportunityId) {
        Opportunity opp = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new IllegalArgumentException("Opportunity not found"));
        if (!opp.getOwnerUserId().equals(userId)) {
            throw new IllegalArgumentException("Only the opportunity owner can view applications");
        }
        return applicationRepository.findByOpportunityIdOrderByCreatedAtDesc(opportunityId).stream()
                .map(this::toApplicationResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ApplicationResponse acceptApplication(String userId, String applicationId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));
        Opportunity opp = opportunityRepository.findById(app.getOpportunityId())
                .orElseThrow(() -> new IllegalArgumentException("Opportunity not found"));
        if (!opp.getOwnerUserId().equals(userId)) {
            throw new IllegalArgumentException("Only the opportunity owner can accept applications");
        }
        if (!"PENDING".equals(app.getStatus())) {
            throw new IllegalArgumentException("Application is no longer pending");
        }

        User owner = userRepository.findById(opp.getOwnerUserId()).orElseThrow();
        User applicant = userRepository.findById(app.getApplicantUserId()).orElseThrow();

        ProjectRoom room = new ProjectRoom();
        room.setUniversitySpaceId(opp.getUniversitySpaceId());
        room.setOpportunityId(opp.getId());
        room.setTitle(opp.getTitle());
        room.setCreatedAt(Instant.now());
        room = projectRoomRepository.save(room);

        addRoomMember(room.getId(), owner.getId(), owner.getDisplayName() != null ? owner.getDisplayName() : "Owner");
        addRoomMember(room.getId(), applicant.getId(), applicant.getDisplayName() != null ? applicant.getDisplayName() : "Member");

        app.setStatus("ACCEPTED");
        app.setProcessedAt(Instant.now());
        app.setProjectRoomId(room.getId());
        applicationRepository.save(app);

        return toApplicationResponse(app);
    }

    public ApplicationResponse declineApplication(String userId, String applicationId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));
        Opportunity opp = opportunityRepository.findById(app.getOpportunityId())
                .orElseThrow(() -> new IllegalArgumentException("Opportunity not found"));
        if (!opp.getOwnerUserId().equals(userId)) {
            throw new IllegalArgumentException("Only the opportunity owner can decline applications");
        }
        if (!"PENDING".equals(app.getStatus())) {
            throw new IllegalArgumentException("Application is no longer pending");
        }
        app.setStatus("DECLINED");
        app.setProcessedAt(Instant.now());
        applicationRepository.save(app);
        return toApplicationResponse(app);
    }

    private void addRoomMember(String roomId, String userId, String displayName) {
        ProjectRoomMember m = new ProjectRoomMember();
        m.setRoomId(roomId);
        m.setUserId(userId);
        m.setDisplayName(displayName != null ? displayName : "Member");
        m.setJoinedAt(Instant.now());
        projectRoomMemberRepository.save(m);
    }

    private OpportunityResponse toOpportunityResponse(Opportunity o) {
        return new OpportunityResponse(
                o.getId(), o.getOwnerUserId(), o.getOwnerDisplayName(), o.getTitle(),
                o.getType(), o.getSkillsNeeded(), o.getDuration(), o.getCommitment(),
                o.getDescription(), o.getCreatedAt());
    }

    private ApplicationResponse toApplicationResponse(Application a) {
        return new ApplicationResponse(
                a.getId(), a.getOpportunityId(), a.getApplicantUserId(), a.getApplicantDisplayName(),
                a.getMessage(), a.getStatus(), a.getCreatedAt(), a.getProjectRoomId());
    }
}
