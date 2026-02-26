package com.universe.backend.service;

import com.universe.backend.model.OtpVerification;
import com.universe.backend.repository.OtpVerificationRepository;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Service
public class OtpService {

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 10;
    private static final SecureRandom random = new SecureRandom();

    private final OtpVerificationRepository otpRepository;
    private final EmailService emailService;

    public OtpService(OtpVerificationRepository otpRepository, EmailService emailService) {
        this.otpRepository = otpRepository;
        this.emailService = emailService;
    }

    public String generateOtp() {
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }

    public void createAndSendSignupOtp(String email, String displayName, String passwordHash) {
        // Delete any existing OTPs for this email/type
        otpRepository.deleteByEmailAndType(email.toLowerCase(), "SIGNUP");

        String otp = generateOtp();

        OtpVerification verification = new OtpVerification();
        verification.setEmail(email.toLowerCase());
        verification.setOtp(otp);
        verification.setType("SIGNUP");
        verification.setDisplayName(displayName);
        verification.setPasswordHash(passwordHash);
        verification.setCreatedAt(Instant.now());
        verification.setExpiresAt(Instant.now().plus(OTP_EXPIRY_MINUTES, ChronoUnit.MINUTES));
        verification.setUsed(false);

        otpRepository.save(verification);

        emailService.sendOtp(email, otp, "SIGNUP");
    }

    public void createAndSendPasswordResetOtp(String email) {
        // Delete any existing OTPs for this email/type
        otpRepository.deleteByEmailAndType(email.toLowerCase(), "PASSWORD_RESET");

        String otp = generateOtp();

        OtpVerification verification = new OtpVerification();
        verification.setEmail(email.toLowerCase());
        verification.setOtp(otp);
        verification.setType("PASSWORD_RESET");
        verification.setCreatedAt(Instant.now());
        verification.setExpiresAt(Instant.now().plus(OTP_EXPIRY_MINUTES, ChronoUnit.MINUTES));
        verification.setUsed(false);

        otpRepository.save(verification);

        emailService.sendOtp(email, otp, "PASSWORD_RESET");
    }

    public Optional<OtpVerification> verifyOtp(String email, String otp, String type) {
        Optional<OtpVerification> verificationOpt = otpRepository
                .findByEmailAndTypeAndUsedFalseOrderByCreatedAtDesc(email.toLowerCase(), type);

        if (verificationOpt.isEmpty()) {
            return Optional.empty();
        }

        OtpVerification verification = verificationOpt.get();

        // Check if expired
        if (Instant.now().isAfter(verification.getExpiresAt())) {
            return Optional.empty();
        }

        // Check if OTP matches
        if (!verification.getOtp().equals(otp)) {
            return Optional.empty();
        }

        // Mark as used
        verification.setUsed(true);
        otpRepository.save(verification);

        return Optional.of(verification);
    }

    public void resendOtp(String email, String type) {
        Optional<OtpVerification> existing = otpRepository
                .findByEmailAndTypeAndUsedFalseOrderByCreatedAtDesc(email.toLowerCase(), type);

        if (existing.isEmpty()) {
            throw new IllegalArgumentException("No pending verification found. Please start over.");
        }

        OtpVerification verification = existing.get();

        // Generate new OTP
        String newOtp = generateOtp();
        verification.setOtp(newOtp);
        verification.setCreatedAt(Instant.now());
        verification.setExpiresAt(Instant.now().plus(OTP_EXPIRY_MINUTES, ChronoUnit.MINUTES));
        otpRepository.save(verification);

        emailService.sendOtp(email, newOtp, type);
    }
}
