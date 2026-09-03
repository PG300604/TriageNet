package com.triagenet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

public class ShiftAuthDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TwoFactorSetupResponse {
        private String secret;
        private String qrUri;
        private String recoveryMnemonic;
        private List<String> backupCodes;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TwoFactorConfirmRequest {
        @NotBlank(message = "Verification code is required")
        @Pattern(regexp = "^\\d{6}$", message = "Verification code must be 6 digits")
        private String code;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TwoFactorVerifyRequest {
        @NotBlank(message = "Challenge token is required")
        private String challengeToken;

        @NotBlank(message = "Code is required")
        private String code;

        private int shiftDurationHours = 8;

        @Pattern(regexp = "^\\d{4}$", message = "Shift PIN must be exactly 4 digits")
        private String shiftPin = "1234";
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShiftUnlockRequest {
        @NotBlank(message = "Shift PIN is required")
        @Pattern(regexp = "^\\d{4}$", message = "Shift PIN must be exactly 4 digits")
        private String pin;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ShiftStatusResponse {
        private boolean shiftActive;
        private boolean isLocked;
        private int durationHours;
        private LocalDateTime startedAt;
        private LocalDateTime expiresAt;
        private long remainingMinutes;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MnemonicRecoveryRequest {
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "12-word mnemonic phrase is required")
        private String mnemonic;

        @NotBlank(message = "New password is required")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_\\-+=\\[\\]{};:'\",.<>?/|`~]).{8,}$",
                message = "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 digit, and 1 special symbol"
        )
        private String newPassword;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BackupCodeRecoveryRequest {
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "Backup code is required")
        private String backupCode;

        @NotBlank(message = "New password is required")
        private String newPassword;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CmoEscrowApprovalRequest {
        @NotBlank(message = "Target staff email is required")
        private String targetStaffEmail;

        @NotBlank(message = "Reason for emergency bypass is required")
        private String escrowReason;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StaffStatusDto {
        private String staffId;
        private String name;
        private String status;
        private String hospitalName;
        private String role;
        private LocalDateTime registeredAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PendingStaffDto {
        private String id;
        private String staffId;
        private String name;
        private String email;
        private String role;
        private String hospitalId;
        private String hospitalName;
        private String status;
        private LocalDateTime createdAt;
    }
}
