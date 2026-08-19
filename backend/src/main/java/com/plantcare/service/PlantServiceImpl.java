package com.plantcare.service;

import com.plantcare.dto.PlantRequestDTO;
import com.plantcare.dto.PlantResponseDTO;
import com.plantcare.entity.Plant;
import com.plantcare.exception.ResourceNotFoundException;
import com.plantcare.repository.PlantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PlantServiceImpl implements PlantService {

    private final PlantRepository plantRepository;

    // Constructor Injection (Loose coupling & testability - great for interviews!)
    public PlantServiceImpl(PlantRepository plantRepository) {
        this.plantRepository = plantRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PlantResponseDTO> getAllPlants(String category, String search, boolean wateringDue) {
        LocalDate today = LocalDate.now();
        List<Plant> plants = plantRepository.searchPlants(category, search, wateringDue, today);
        return plants.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PlantResponseDTO getPlantById(Long id) {
        Plant plant = plantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plant not found with id: " + id));
        return mapToResponseDTO(plant);
    }

    @Override
    public PlantResponseDTO createPlant(PlantRequestDTO request) {
        Plant plant = Plant.builder()
                .name(request.getName())
                .species(request.getSpecies())
                .category(request.getCategory())
                .description(request.getDescription())
                .sunlightRequirement(request.getSunlightRequirement())
                .wateringFrequency(request.getWateringFrequency())
                .lastWateredDate(request.getLastWateredDate())
                .soilType(request.getSoilType())
                .temperatureRange(request.getTemperatureRange())
                .humidityRequirement(request.getHumidityRequirement())
                .imageUrl(request.getImageUrl())
                .build();

        // Calculate watering schedule in service layer
        calculateWateringDates(plant);

        Plant savedPlant = plantRepository.save(plant);
        return mapToResponseDTO(savedPlant);
    }

    @Override
    public PlantResponseDTO updatePlant(Long id, PlantRequestDTO request) {
        Plant plant = plantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plant not found with id: " + id));

        plant.setName(request.getName());
        plant.setSpecies(request.getSpecies());
        plant.setCategory(request.getCategory());
        plant.setDescription(request.getDescription());
        plant.setSunlightRequirement(request.getSunlightRequirement());
        plant.setWateringFrequency(request.getWateringFrequency());
        plant.setLastWateredDate(request.getLastWateredDate());
        plant.setSoilType(request.getSoilType());
        plant.setTemperatureRange(request.getTemperatureRange());
        plant.setHumidityRequirement(request.getHumidityRequirement());
        plant.setImageUrl(request.getImageUrl());

        // Recalculate dates upon update
        calculateWateringDates(plant);

        Plant updatedPlant = plantRepository.save(plant);
        return mapToResponseDTO(updatedPlant);
    }

    @Override
    public void deletePlant(Long id) {
        if (!plantRepository.existsById(id)) {
            throw new ResourceNotFoundException("Plant not found with id: " + id);
        }
        plantRepository.deleteById(id);
    }

    // Helper logic for scheduling next watering
    private void calculateWateringDates(Plant plant) {
        if (plant.getLastWateredDate() == null) {
            plant.setLastWateredDate(LocalDate.now());
        }
        if (plant.getWateringFrequency() != null && plant.getWateringFrequency() > 0) {
            plant.setNextWateringDate(plant.getLastWateredDate().plusDays(plant.getWateringFrequency()));
        }
    }

    // Helper mapper Entity -> DTO
    private PlantResponseDTO mapToResponseDTO(Plant plant) {
        return PlantResponseDTO.builder()
                .id(plant.getId())
                .name(plant.getName())
                .species(plant.getSpecies())
                .category(plant.getCategory())
                .description(plant.getDescription())
                .sunlightRequirement(plant.getSunlightRequirement())
                .wateringFrequency(plant.getWateringFrequency())
                .lastWateredDate(plant.getLastWateredDate())
                .nextWateringDate(plant.getNextWateringDate())
                .soilType(plant.getSoilType())
                .temperatureRange(plant.getTemperatureRange())
                .humidityRequirement(plant.getHumidityRequirement())
                .imageUrl(plant.getImageUrl())
                .createdAt(plant.getCreatedAt())
                .updatedAt(plant.getUpdatedAt())
                .build();
    }
}
