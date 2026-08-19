package com.plantcare.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlantResponseDTO {
    private Long id;
    private String name;
    private String species;
    private String category;
    private String description;
    private String sunlightRequirement;
    private Integer wateringFrequency;
    private LocalDate lastWateredDate;
    private LocalDate nextWateringDate;
    private String soilType;
    private String temperatureRange;
    private String humidityRequirement;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
