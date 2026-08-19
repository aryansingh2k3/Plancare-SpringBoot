package com.plantcare.service;

import com.plantcare.dto.CareRecordRequestDTO;
import com.plantcare.dto.CareRecordResponseDTO;
import com.plantcare.entity.CareRecord;
import com.plantcare.entity.Plant;
import com.plantcare.exception.ResourceNotFoundException;
import com.plantcare.repository.CareRecordRepository;
import com.plantcare.repository.PlantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CareRecordServiceImpl implements CareRecordService {

    private final CareRecordRepository careRecordRepository;
    private final PlantRepository plantRepository;

    public CareRecordServiceImpl(CareRecordRepository careRecordRepository, PlantRepository plantRepository) {
        this.careRecordRepository = careRecordRepository;
        this.plantRepository = plantRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CareRecordResponseDTO> getCareRecordsByPlant(Long plantId) {
        // First verify that the plant exists
        if (!plantRepository.existsById(plantId)) {
            throw new ResourceNotFoundException("Plant not found with id: " + plantId);
        }
        
        List<CareRecord> records = careRecordRepository.findByPlantIdOrderByCareDateDesc(plantId);
        return records.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CareRecordResponseDTO addCareRecord(Long plantId, CareRecordRequestDTO request) {
        Plant plant = plantRepository.findById(plantId)
                .orElseThrow(() -> new ResourceNotFoundException("Plant not found with id: " + plantId));

        CareRecord careRecord = CareRecord.builder()
                .plant(plant)
                .careType(request.getCareType())
                .careDate(request.getCareDate())
                .notes(request.getNotes())
                .build();

        // Business Logic: If the action is "Watering", update the plant's watering schedule
        if ("Watering".equalsIgnoreCase(request.getCareType())) {
            LocalDate wateringDate = request.getCareDate().toLocalDate();
            
            // Only update if this watering date is newer than or equal to the current lastWateredDate
            if (plant.getLastWateredDate() == null || !wateringDate.isBefore(plant.getLastWateredDate())) {
                plant.setLastWateredDate(wateringDate);
                if (plant.getWateringFrequency() != null && plant.getWateringFrequency() > 0) {
                    plant.setNextWateringDate(wateringDate.plusDays(plant.getWateringFrequency()));
                }
                plantRepository.save(plant);
            }
        }

        CareRecord savedRecord = careRecordRepository.save(careRecord);
        return mapToResponseDTO(savedRecord);
    }

    @Override
    public CareRecordResponseDTO updateCareRecord(Long id, CareRecordRequestDTO request) {
        CareRecord careRecord = careRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Care record not found with id: " + id));

        careRecord.setCareType(request.getCareType());
        careRecord.setCareDate(request.getCareDate());
        careRecord.setNotes(request.getNotes());

        // Save updated record
        CareRecord updatedRecord = careRecordRepository.save(careRecord);
        
        // Optionally update plant if the record type is "Watering" and it's the latest
        Plant plant = updatedRecord.getPlant();
        if ("Watering".equalsIgnoreCase(request.getCareType())) {
            LocalDate wateringDate = request.getCareDate().toLocalDate();
            if (plant.getLastWateredDate() == null || !wateringDate.isBefore(plant.getLastWateredDate())) {
                plant.setLastWateredDate(wateringDate);
                if (plant.getWateringFrequency() != null && plant.getWateringFrequency() > 0) {
                    plant.setNextWateringDate(wateringDate.plusDays(plant.getWateringFrequency()));
                }
                plantRepository.save(plant);
            }
        }

        return mapToResponseDTO(updatedRecord);
    }

    @Override
    public void deleteCareRecord(Long id) {
        if (!careRecordRepository.existsById(id)) {
            throw new ResourceNotFoundException("Care record not found with id: " + id);
        }
        careRecordRepository.deleteById(id);
    }

    // Helper mapper Entity -> DTO
    private CareRecordResponseDTO mapToResponseDTO(CareRecord record) {
        return CareRecordResponseDTO.builder()
                .id(record.getId())
                .plantId(record.getPlant().getId())
                .plantName(record.getPlant().getName())
                .careType(record.getCareType())
                .careDate(record.getCareDate())
                .notes(record.getNotes())
                .build();
    }
}
