package com.triagenet.dto;

import com.triagenet.entity.RoleName;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    private String token;
    @Builder.Default
    private String type = "Bearer";
    private UUID id;
    private String name;
    private String email;
    private RoleName role;
    private UUID hospitalId;
    private String refreshToken;
    private boolean twoFactorRequired;
    private String challengeToken;
    private boolean shiftActive;
    private int shiftDurationHours;
    private boolean isScreenLocked;
}
