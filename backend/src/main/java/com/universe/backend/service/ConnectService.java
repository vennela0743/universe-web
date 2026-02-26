package com.universe.backend.service;

import com.universe.backend.dto.ConnectPostResponse;
import com.universe.backend.model.ConnectPost;
import com.universe.backend.model.User;
import com.universe.backend.repository.ConnectPostRepository;
import com.universe.backend.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ConnectService {

    private static final int MAX_FEED_SIZE = 100;

    private final ConnectPostRepository connectPostRepository;
    private final UserRepository userRepository;
    private final MetricsService metricsService;

    public ConnectService(ConnectPostRepository connectPostRepository, UserRepository userRepository,
                          MetricsService metricsService) {
        this.connectPostRepository = connectPostRepository;
        this.userRepository = userRepository;
        this.metricsService = metricsService;
    }

    /**
     * Create a post in the current user's UniversitySpace. User must have a space assigned.
     * Either content or imageData must be provided.
     */
    public ConnectPostResponse create(String userId, String content, String imageData) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.getUniversitySpaceId() == null || user.getUniversitySpaceId().isBlank()) {
            throw new IllegalArgumentException("User has no university space assigned");
        }

        String trimmedContent = content != null ? content.trim() : "";
        boolean hasContent = !trimmedContent.isEmpty();
        boolean hasImage = imageData != null && !imageData.isBlank();

        if (!hasContent && !hasImage) {
            throw new IllegalArgumentException("Post must have text or an image");
        }

        ConnectPost post = new ConnectPost();
        post.setUniversitySpaceId(user.getUniversitySpaceId());
        post.setAuthorUserId(user.getId());
        post.setAuthorDisplayName(user.getDisplayName() != null ? user.getDisplayName() : "Anonymous");
        post.setContent(trimmedContent.isEmpty() ? null : trimmedContent);
        post.setImageUrl(hasImage ? imageData : null);
        post.setCreatedAt(Instant.now());
        post = connectPostRepository.save(post);

        metricsService.recordPostCreated(user.getUniversitySpaceId());

        return toResponse(post);
    }

    /**
     * List recent posts for the current user's UniversitySpace only. Newest first.
     */
    public List<ConnectPostResponse> listForCurrentUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.getUniversitySpaceId() == null || user.getUniversitySpaceId().isBlank()) {
            return List.of();
        }

        List<ConnectPost> posts = connectPostRepository.findByUniversitySpaceIdOrderByCreatedAtDesc(
                user.getUniversitySpaceId(),
                PageRequest.of(0, MAX_FEED_SIZE));

        return posts.stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * Delete a post. Only the author can delete their own post.
     */
    public void delete(String userId, String postId) {
        ConnectPost post = connectPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        if (!userId.equals(post.getAuthorUserId())) {
            throw new IllegalArgumentException("You can only delete your own posts");
        }
        connectPostRepository.delete(post);
    }

    private ConnectPostResponse toResponse(ConnectPost post) {
        return new ConnectPostResponse(
                post.getId(),
                post.getContent(),
                post.getImageUrl(),
                post.getAuthorDisplayName(),
                post.getAuthorUserId(),
                post.getCreatedAt());
    }
}
