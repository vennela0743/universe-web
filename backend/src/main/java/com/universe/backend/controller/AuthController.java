package com.universe.backend.controller;

import com.universe.backend.dto.*;
import com.universe.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Step 1 of signup: Validates email and sends OTP
     */
    @PostMapping("/signup/initiate")
    public ResponseEntity<MessageResponse> initiateSignup(@Valid @RequestBody InitiateSignupRequest request) {
        try {
            authService.initiateSignup(request.getEmail(), request.getDisplayName(), request.getPassword());
            return ResponseEntity.ok(new MessageResponse("Verification code sent to your email"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Step 2 of signup: Verifies OTP and creates account
     */
    @PostMapping("/signup/verify")
    public ResponseEntity<?> verifySignup(@Valid @RequestBody VerifyOtpRequest request) {
        try {
            AuthResponse response = authService.verifySignupOtp(request.getEmail(), request.getOtp());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Legacy register endpoint - kept for backward compatibility
     * @deprecated Use /signup/initiate and /signup/verify instead
     */
    @Deprecated
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Step 1 of password reset: Sends OTP to email
     */
    @PostMapping("/password/forgot")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            authService.initiatePasswordReset(request.getEmail());
            return ResponseEntity.ok(new MessageResponse("Password reset code sent to your email"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Step 2 of password reset: Verifies OTP and resets password
     */
    @PostMapping("/password/reset")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            authService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
            return ResponseEntity.ok(new MessageResponse("Password reset successful"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Resends an OTP for signup or password reset
     */
    @PostMapping("/otp/resend")
    public ResponseEntity<MessageResponse> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        try {
            authService.resendOtp(request.getEmail(), request.getType());
            return ResponseEntity.ok(new MessageResponse("Verification code resent"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
