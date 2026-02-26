package com.universe.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Email service for sending OTP codes.
 * Currently logs to console - can be upgraded to use SMTP/SendGrid/AWS SES later.
 */
@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Value("${universe.email.enabled:false}")
    private boolean emailEnabled;

    @Value("${universe.app-name:UniVerse}")
    private String appName;

    public void sendOtp(String toEmail, String otp, String purpose) {
        String subject;
        String body;

        if ("SIGNUP".equals(purpose)) {
            subject = appName + " - Verify your email";
            body = String.format(
                "Welcome to %s!\n\n" +
                "Your verification code is: %s\n\n" +
                "This code will expire in 10 minutes.\n\n" +
                "If you didn't request this, please ignore this email.",
                appName, otp
            );
        } else if ("PASSWORD_RESET".equals(purpose)) {
            subject = appName + " - Password Reset Code";
            body = String.format(
                "You requested a password reset for your %s account.\n\n" +
                "Your reset code is: %s\n\n" +
                "This code will expire in 10 minutes.\n\n" +
                "If you didn't request this, please ignore this email and your password will remain unchanged.",
                appName, otp
            );
        } else {
            subject = appName + " - Verification Code";
            body = String.format("Your verification code is: %s\n\nThis code will expire in 10 minutes.", otp);
        }

        if (emailEnabled) {
            // TODO: Implement actual email sending via SMTP/SendGrid/AWS SES
            // For now, just log it
            logger.info("EMAIL WOULD BE SENT TO: {}", toEmail);
            logger.info("Subject: {}", subject);
            logger.info("Body: {}", body);
        } else {
            // Development mode - print OTP to console prominently
            logger.info("\n" +
                "╔══════════════════════════════════════════════════════════╗\n" +
                "║                    OTP VERIFICATION                       ║\n" +
                "╠══════════════════════════════════════════════════════════╣\n" +
                "║  Email: {}\n" +
                "║  Purpose: {}\n" +
                "║  OTP Code: {}\n" +
                "╚══════════════════════════════════════════════════════════╝",
                toEmail, purpose, otp);
        }
    }
}
