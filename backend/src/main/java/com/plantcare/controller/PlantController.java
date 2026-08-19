package com.plantcare.controller;

import com.plantcare.dto.PlantRequestDTO;
import com.plantcare.dto.PlantResponseDTO;
import com.plantcare.service.PlantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plants")
@Tag(name = "Plant Management", description = "APIs for managing and searching plants")
public class PlantController {

    private final PlantService plantService;

    // Constructor Injection
    public PlantController(PlantService plantService) {
        this.plantService = plantService;
    }

    @GetMapping
    @Operation(summary = "Get all plants", description = "Retrieves all plants with optional search, category, and watering due filters")
    public ResponseEntity<List<PlantResponseDTO>> getAllPlants(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "false") boolean wateringDue) {
        
        List<PlantResponseDTO> plants = plantService.getAllPlants(category, search, wateringDue);
        return ResponseEntity.ok(plants);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single plant by ID")
    public ResponseEntity<PlantResponseDTO> getPlantById(@PathVariable Long id) {
        PlantResponseDTO plant = plantService.getPlantById(id);
        return ResponseEntity.ok(plant);
    }

    @PostMapping
    @Operation(summary = "Add a new plant")
    public ResponseEntity<PlantResponseDTO> createPlant(@Valid @RequestBody PlantRequestDTO request) {
        PlantResponseDTO createdPlant = plantService.createPlant(request);
        return new ResponseEntity<>(createdPlant, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update plant details")
    public ResponseEntity<PlantResponseDTO> updatePlant(
            @PathVariable Long id,
            @Valid @RequestBody PlantRequestDTO request) {
        PlantResponseDTO updatedPlant = plantService.updatePlant(id, request);
        return ResponseEntity.ok(updatedPlant);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a plant")
    public ResponseEntity<Void> deletePlant(@PathVariable Long id) {
        plantService.deletePlant(id);
        return ResponseEntity.noContent().build();
    }
}
