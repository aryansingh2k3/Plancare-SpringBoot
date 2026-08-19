package com.plantcare.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlantRequestDTO {

    @NotBlank(message = "Plant name is required")
    private String name;

    @NotBlank(message = "Plant species is required")
    private String species;

    private String category;
    private String description;
    private String sunlightRequirement;

    @NotNull(message = "Watering frequency is required")
    @Min(value = 1, message = "Watering frequency must be at least 1 day")
    private Integer wateringFrequency;

    private LocalDate lastWateredDate;
    private String soilType;
    private String temperatureRange;
    private String humidityRequirement;
    private String imageUrl;
}
