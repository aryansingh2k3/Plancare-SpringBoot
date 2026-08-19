package com.plantcare.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CareRecordRequestDTO {

    @NotBlank(message = "Care type is required")
    private String careType;

    @NotNull(message = "Care date is required")
    private LocalDateTime careDate;

    private String notes;
}
