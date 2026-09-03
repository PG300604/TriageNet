package com.triagenet.dto;

import com.triagenet.entity.RoleName;
import com.triagenet.entity.StaffUser;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private UUID id;
    private String name;
    private String email;
    private String staffId;
    private StaffUser.UserStatus status;
    private RoleName role;
    private UUID hospitalId;
    private LocalDateTime createdAt;
    private String totpSecret;
    private String qrUri;
    private String recoveryMnemonic;
    private java.util.List<String> backupCodes;

    public static UserDto fromEntity(StaffUser user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .staffId(user.getStaffId())
                .status(user.getStatus())
                .role(user.getRole() != null ? user.getRole().getName() : null)
                .hospitalId(user.getHospitalId())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
