package com.triagenet.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {

    @NotBlank(message = "Official Staff ID or Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}
