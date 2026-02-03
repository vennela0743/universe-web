package com.universe.backend.service;

import com.universe.backend.dto.AuthRequest;
import com.universe.backend.dto.AuthResponse;
import com.universe.backend.dto.RegisterRequest;
import com.universe.backend.model.User;
import com.universe.backend.repository.UserRepository;
import com.universe.backend.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UniversityVerificationService universityVerification;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       UniversityVerificationService universityVerification) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.universityVerification = universityVerification;
    }

    public AuthResponse register(RegisterRequest request) {
        if (!universityVerification.isAllowedUniversityEmail(request.getEmail())) {
            throw new IllegalArgumentException("Only university email addresses are allowed (e.g. @university.edu)");
        }
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setDisplayName(request.getDisplayName().trim());
        user.setUniversityDomain(universityVerification.extractUniversityDomain(request.getEmail()));
        user.setVerified(true);
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());
        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, user.getEmail(), user.getDisplayName(), user.getId());
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.getEmail().trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, user.getEmail(), user.getDisplayName(), user.getId());
    }
}
