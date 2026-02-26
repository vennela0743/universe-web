package com.universe.backend.service;

import com.universe.backend.dto.CreateEventRequest;
import com.universe.backend.dto.EventResponse;
import com.universe.backend.model.Event;
import com.universe.backend.model.User;
import com.universe.backend.repository.EventRepository;
import com.universe.backend.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventService {

    private static final int MAX_EVENTS = 100;
    private static final String STATUS_APPROVED = "APPROVED";
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_REJECTED = "REJECTED";

    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public EventService(EventRepository eventRepository, UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    public List<EventResponse> listForCurrentUser(String userId, String typeFilter) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.getUniversitySpaceId() == null || user.getUniversitySpaceId().isBlank()) {
            return List.of();
        }
        String spaceId = user.getUniversitySpaceId();

        if (eventRepository.countByUniversitySpaceIdAndStatus(spaceId, STATUS_APPROVED) == 0) {
            seedDummyEvents(spaceId);
        }

        List<Event> list;
        if (typeFilter != null && !typeFilter.isBlank() && ("event".equalsIgnoreCase(typeFilter) || "hackathon".equalsIgnoreCase(typeFilter))) {
            list = eventRepository.findByUniversitySpaceIdAndStatusAndTypeOrderByStartTimeAsc(spaceId, STATUS_APPROVED, typeFilter.toLowerCase(), PageRequest.of(0, MAX_EVENTS));
        } else {
            list = eventRepository.findByUniversitySpaceIdAndStatusOrderByStartTimeAsc(spaceId, STATUS_APPROVED, PageRequest.of(0, MAX_EVENTS));
        }
        return list.stream().map(e -> toResponse(e, false)).collect(Collectors.toList());
    }

    public EventResponse createPending(String userId, CreateEventRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.getUniversitySpaceId() == null || user.getUniversitySpaceId().isBlank()) {
            throw new IllegalArgumentException("User has no university space assigned");
        }
        String type = request.getType() != null ? request.getType().toLowerCase().trim() : "";
        if (!"event".equals(type) && !"hackathon".equals(type)) {
            throw new IllegalArgumentException("Type must be event or hackathon");
        }
        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new IllegalArgumentException("Start and end time are required");
        }
        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        Event e = new Event();
        e.setUniversitySpaceId(user.getUniversitySpaceId());
        e.setTitle(request.getTitle().trim());
        e.setDescription(request.getDescription() != null ? request.getDescription().trim() : "");
        e.setType(type);
        e.setStartTime(request.getStartTime());
        e.setEndTime(request.getEndTime());
        e.setLocation(request.getLocation() != null ? request.getLocation().trim() : "");
        e.setOrganizerName(request.getOrganizerName() != null ? request.getOrganizerName().trim() : "");
        e.setStatus(STATUS_PENDING);
        e.setSubmittedByUserId(user.getId());
        e.setSubmittedByDisplayName(user.getDisplayName() != null ? user.getDisplayName() : "Anonymous");
        e.setSupportingDocuments(request.getSupportingDocuments() != null ? request.getSupportingDocuments().trim() : "");
        e.setCreatedAt(Instant.now());
        e = eventRepository.save(e);
        return toResponse(e, false);
    }

    public List<EventResponse> listPendingForAdmin(String userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!"ADMIN".equals(user.getRole())) {
            throw new IllegalArgumentException("Forbidden");
        }
        if (user.getUniversitySpaceId() == null || user.getUniversitySpaceId().isBlank()) {
            return List.of();
        }
        List<Event> list = eventRepository.findByUniversitySpaceIdAndStatusOrderByCreatedAtDesc(user.getUniversitySpaceId(), STATUS_PENDING, PageRequest.of(0, 100));
        return list.stream().map(e -> toResponse(e, true)).collect(Collectors.toList());
    }

    public EventResponse approve(String userId, String eventId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!"ADMIN".equals(user.getRole())) {
            throw new IllegalArgumentException("Forbidden");
        }
        Event e = eventRepository.findById(eventId).orElseThrow(() -> new IllegalArgumentException("Event not found"));
        if (!user.getUniversitySpaceId().equals(e.getUniversitySpaceId())) {
            throw new IllegalArgumentException("Forbidden");
        }
        if (!STATUS_PENDING.equals(e.getStatus())) {
            throw new IllegalArgumentException("Event is not pending");
        }
        e.setStatus(STATUS_APPROVED);
        eventRepository.save(e);
        return toResponse(e, false);
    }

    public EventResponse reject(String userId, String eventId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!"ADMIN".equals(user.getRole())) {
            throw new IllegalArgumentException("Forbidden");
        }
        Event e = eventRepository.findById(eventId).orElseThrow(() -> new IllegalArgumentException("Event not found"));
        if (!user.getUniversitySpaceId().equals(e.getUniversitySpaceId())) {
            throw new IllegalArgumentException("Forbidden");
        }
        if (!STATUS_PENDING.equals(e.getStatus())) {
            throw new IllegalArgumentException("Event is not pending");
        }
        e.setStatus(STATUS_REJECTED);
        eventRepository.save(e);
        return toResponse(e, false);
    }

    private void seedDummyEvents(String universitySpaceId) {
        Instant base = Instant.now().plus(1, ChronoUnit.DAYS);
        List<Event> events = List.of(
                event(universitySpaceId, "Campus Hackathon 2025", "Build something cool in 24 hours. Prizes for top teams. All skill levels welcome.", "hackathon",
                        base, base.plus(24, ChronoUnit.HOURS), "Main Campus – Tech Hub", "CS Department"),
                event(universitySpaceId, "Startup Pitch Night", "Pitch your idea to local investors. 5-minute slots, Q&A, and networking.", "event",
                        base.plus(3, ChronoUnit.DAYS), base.plus(3, ChronoUnit.DAYS).plus(3, ChronoUnit.HOURS), "Innovation Center", "Entrepreneurship Club"),
                event(universitySpaceId, "DevOps & Cloud Workshop", "Hands-on workshop on CI/CD and cloud deployment. Bring your laptop.", "event",
                        base.plus(5, ChronoUnit.DAYS), base.plus(5, ChronoUnit.DAYS).plus(2, ChronoUnit.HOURS), "Library Lab 2", "IT Services"),
                event(universitySpaceId, "AI/ML Hackathon", "Focus on ML models and AI apps. Datasets and APIs provided. Team size 2–4.", "hackathon",
                        base.plus(7, ChronoUnit.DAYS), base.plus(8, ChronoUnit.DAYS), "Engineering Block", "AI Society"),
                event(universitySpaceId, "Career Fair", "Meet recruiters from tech, finance, and consulting. Resume review and mock interviews.", "event",
                        base.plus(10, ChronoUnit.DAYS), base.plus(10, ChronoUnit.DAYS).plus(6, ChronoUnit.HOURS), "Student Center", "Career Office")
        );
        eventRepository.saveAll(events);
    }

    private Event event(String spaceId, String title, String description, String type, Instant start, Instant end, String location, String organizer) {
        Event e = new Event();
        e.setUniversitySpaceId(spaceId);
        e.setTitle(title);
        e.setDescription(description);
        e.setType(type);
        e.setStartTime(start);
        e.setEndTime(end);
        e.setLocation(location);
        e.setOrganizerName(organizer);
        e.setStatus(STATUS_APPROVED);
        e.setCreatedAt(Instant.now());
        return e;
    }

    private EventResponse toResponse(Event e, boolean includeSupportingDocs) {
        return new EventResponse(
                e.getId(), e.getTitle(), e.getDescription(), e.getType(),
                e.getStartTime(), e.getEndTime(), e.getLocation(), e.getOrganizerName(),
                e.getStatus(), e.getSubmittedByDisplayName(),
                includeSupportingDocs ? e.getSupportingDocuments() : null,
                e.getCreatedAt());
    }
}
