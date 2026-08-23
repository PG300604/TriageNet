package com.triagenet.dto;

import com.triagenet.entity.RoleName;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_\\-+=\\[\\]{};:'\",.<>?/|`~]).{8,}$",
        message = "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character"
    )
    private String password;

    private UUID hospitalId;

    /**
     * SECURITY (V1, critical): clients must never choose their own role.
     * This field is ignored by AuthService.register(); new accounts are always
     * created as HOSPITAL_STAFF and roles are granted only via an admin flow.
     * Kept solely for request-compatibility; scheduled for removal in the API v2.
     */
    @Deprecated
    private RoleName role;
}
