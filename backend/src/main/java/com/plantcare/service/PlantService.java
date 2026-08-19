package com.plantcare.service;

import com.plantcare.dto.PlantRequestDTO;
import com.plantcare.dto.PlantResponseDTO;

import java.util.List;

public interface PlantService {
    List<PlantResponseDTO> getAllPlants(String category, String search, boolean wateringDue);
    PlantResponseDTO getPlantById(Long id);
    PlantResponseDTO createPlant(PlantRequestDTO request);
    PlantResponseDTO updatePlant(Long id, PlantRequestDTO request);
    void deletePlant(Long id);
}
