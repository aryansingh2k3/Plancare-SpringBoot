package com.plantcare.controller;

import com.plantcare.dto.CareRecordRequestDTO;
import com.plantcare.dto.CareRecordResponseDTO;
import com.plantcare.service.CareRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Plant Care Logging", description = "APIs for tracking plant watering, fertilizing, and pruning records")
public class CareRecordController {

    private final CareRecordService careRecordService;

    // Constructor Injection
    public CareRecordController(CareRecordService careRecordService) {
        this.careRecordService = careRecordService;
    }

    @GetMapping("/plants/{id}/care")
    @Operation(summary = "Get care records for a specific plant", description = "Retrieves all logged care history for a plant ordered by date")
    public ResponseEntity<List<CareRecordResponseDTO>> getCareRecordsByPlant(@PathVariable Long id) {
        List<CareRecordResponseDTO> records = careRecordService.getCareRecordsByPlant(id);
        return ResponseEntity.ok(records);
    }

    @PostMapping("/plants/{id}/care")
    @Operation(summary = "Log a care event for a plant", description = "Logs a care activity. If careType is 'Watering', it updates the plant's schedule.")
    public ResponseEntity<CareRecordResponseDTO> addCareRecord(
            @PathVariable Long id,
            @Valid @RequestBody CareRecordRequestDTO request) {
        CareRecordResponseDTO createdRecord = careRecordService.addCareRecord(id, request);
        return new ResponseEntity<>(createdRecord, HttpStatus.CREATED);
    }

    @PutMapping("/care/{id}")
    @Operation(summary = "Update a care record by ID")
    public ResponseEntity<CareRecordResponseDTO> updateCareRecord(
            @PathVariable Long id,
            @Valid @RequestBody CareRecordRequestDTO request) {
        CareRecordResponseDTO updatedRecord = careRecordService.updateCareRecord(id, request);
        return ResponseEntity.ok(updatedRecord);
    }

    @DeleteMapping("/care/{id}")
    @Operation(summary = "Delete a care record by ID")
    public ResponseEntity<Void> deleteCareRecord(@PathVariable Long id) {
        careRecordService.deleteCareRecord(id);
        return ResponseEntity.noContent().build();
    }
}
