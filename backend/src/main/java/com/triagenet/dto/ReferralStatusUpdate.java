package com.triagenet.dto;

import com.triagenet.entity.ReferralStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReferralStatusUpdate {

    @NotNull(message = "Status is required")
    private ReferralStatus status;

    private String notes;
}
