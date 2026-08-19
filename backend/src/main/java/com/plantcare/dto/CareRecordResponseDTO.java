package com.plantcare.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CareRecordResponseDTO {
    private Long id;
    private Long plantId;
    private String plantName;
    private String careType;
    private LocalDateTime careDate;
    private String notes;
}
