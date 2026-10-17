package com.triagenet.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AbdmProfileDto {
    private String abhaNumber;
    private String abhaAddress;
    private String fullName;
    private String gender;
    private String dateOfBirth;
    private String bloodGroup;
    private List<String> allergies;
    private List<String> chronicConditions;
    private String emergencyContact;
    private boolean verified;
}
