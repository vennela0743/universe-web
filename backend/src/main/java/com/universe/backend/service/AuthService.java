package com.universe.backend.service;

import com.universe.backend.dto.AuthRequest;
import com.universe.backend.dto.AuthResponse;
import com.universe.backend.dto.RegisterRequest;
import com.universe.backend.model.OtpVerification;
import com.universe.backend.model.UniversitySpace;
import com.universe.backend.model.User;
import com.universe.backend.repository.UserRepository;
import com.universe.backend.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UniversityVerificationService universityVerification;
    private final UniversitySpaceService universitySpaceService;
    private final MetricsService metricsService;
    private final OtpService otpService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       UniversityVerificationService universityVerification,
                       UniversitySpaceService universitySpaceService,
                       MetricsService metricsService,
                       OtpService otpService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.universityVerification = universityVerification;
        this.universitySpaceService = universitySpaceService;
        this.metricsService = metricsService;
        this.otpService = otpService;
    }

    /**
     * Initiates signup by validating the email and sending an OTP.
     * Does not create the user yet - waits for OTP verification.
     */
    public void initiateSignup(String email, String displayName, String password) {
        email = email.trim().toLowerCase();

        // Validate .edu email
        if (!universityVerification.isAllowedUniversityEmail(email)) {
            throw new IllegalArgumentException("Only .edu email addresses are allowed");
        }

        // Check if email already exists
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        // Hash the password and store temporarily with OTP
        String passwordHash = passwordEncoder.encode(password);

        // Send OTP
        otpService.createAndSendSignupOtp(email, displayName.trim(), passwordHash);
    }

    /**
     * Verifies the signup OTP and creates the user account.
     */
    public AuthResponse verifySignupOtp(String email, String otp) {
        email = email.trim().toLowerCase();

        Optional<OtpVerification> verificationOpt = otpService.verifyOtp(email, otp, "SIGNUP");

        if (verificationOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid or expired OTP");
        }

        OtpVerification verification = verificationOpt.get();

        // Double-check email doesn't exist (race condition prevention)
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        // Create the user
        String domain = universityVerification.extractUniversityDomain(email);
        UniversitySpace space = universitySpaceService.findOrCreateByDomain(domain);

        long existingInSpace = userRepository.countByUniversitySpaceId(space.getId());
        String role = existingInSpace == 0 ? "ADMIN" : "STUDENT";

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(verification.getPasswordHash());
        user.setDisplayName(verification.getDisplayName());
        user.setUniversityDomain(domain);
        user.setUniversitySpaceId(space.getId());
        user.setRole(role);
        user.setVerified(true);
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());
        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return buildAuthResponse(token, user, space);
    }

    /**
     * Legacy register method - kept for backward compatibility but now requires .edu email.
     * Consider deprecating in favor of the OTP flow.
     */
    @Deprecated
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (!universityVerification.isAllowedUniversityEmail(email)) {
            throw new IllegalArgumentException("Only .edu email addresses are allowed");
        }
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        String domain = universityVerification.extractUniversityDomain(email);
        UniversitySpace space = universitySpaceService.findOrCreateByDomain(domain);

        long existingInSpace = userRepository.countByUniversitySpaceId(space.getId());
        String role = existingInSpace == 0 ? "ADMIN" : "STUDENT";

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setDisplayName(request.getDisplayName().trim());
        user.setUniversityDomain(domain);
        user.setUniversitySpaceId(space.getId());
        user.setRole(role);
        user.setVerified(true);
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());
        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return buildAuthResponse(token, user, space);
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.getEmail().trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        boolean needsSave = false;

        if (user.getUniversitySpaceId() == null && user.getUniversityDomain() != null) {
            UniversitySpace space = universitySpaceService.findOrCreateByDomain(user.getUniversityDomain());
            user.setUniversitySpaceId(space.getId());
            needsSave = true;
        }

        if (user.getRole() == null || user.getRole().isBlank()) {
            String spaceId = user.getUniversitySpaceId();
            if (spaceId != null && !userRepository.existsByUniversitySpaceIdAndRole(spaceId, "ADMIN")) {
                User oldest = userRepository.findFirstByUniversitySpaceIdOrderByCreatedAtAsc(spaceId).orElse(null);
                if (oldest != null && oldest.getId().equals(user.getId())) {
                    user.setRole("ADMIN");
                } else {
                    user.setRole("STUDENT");
                }
            } else {
                user.setRole("STUDENT");
            }
            needsSave = true;
        }

        if (needsSave) {
            user.setUpdatedAt(Instant.now());
            user = userRepository.save(user);
        }

        UniversitySpace space = user.getUniversitySpaceId() != null
                ? universitySpaceService.findById(user.getUniversitySpaceId())
                : null;

        if (space != null) {
            metricsService.recordLogin(space.getId());
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return buildAuthResponse(token, user, space);
    }

    /**
     * Initiates password reset by sending an OTP to the email.
     */
    public void initiatePasswordReset(String email) {
        email = email.trim().toLowerCase();

        // Check if user exists
        if (!userRepository.existsByEmailIgnoreCase(email)) {
            // Don't reveal if email exists or not for security
            // But still need to handle gracefully - we'll just not send anything
            // For now, let's be transparent for development
            throw new IllegalArgumentException("No account found with this email");
        }

        otpService.createAndSendPasswordResetOtp(email);
    }

    /**
     * Resets the password after OTP verification.
     */
    public void resetPassword(String email, String otp, String newPassword) {
        email = email.trim().toLowerCase();

        Optional<OtpVerification> verificationOpt = otpService.verifyOtp(email, otp, "PASSWORD_RESET");

        if (verificationOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid or expired OTP");
        }

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("No account found with this email"));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
    }

    /**
     * Resends an OTP for signup or password reset.
     */
    public void resendOtp(String email, String type) {
        otpService.resendOtp(email, type);
    }

    private AuthResponse buildAuthResponse(String token, User user, UniversitySpace space) {
        String spaceId = space != null ? space.getId() : null;
        String spaceName = space != null ? space.getName() : null;
        String spaceDomain = space != null ? space.getDomain() : null;
        String role = user.getRole() != null ? user.getRole() : "STUDENT";
        return new AuthResponse(token, user.getEmail(), user.getDisplayName(), user.getId(),
                spaceId, spaceName, spaceDomain, role);
    }
}
