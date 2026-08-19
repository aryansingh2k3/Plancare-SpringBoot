package com.plantcare.service;

import com.plantcare.dto.CareRecordRequestDTO;
import com.plantcare.dto.CareRecordResponseDTO;

import java.util.List;

public interface CareRecordService {
    List<CareRecordResponseDTO> getCareRecordsByPlant(Long plantId);
    CareRecordResponseDTO addCareRecord(Long plantId, CareRecordRequestDTO request);
    CareRecordResponseDTO updateCareRecord(Long id, CareRecordRequestDTO request);
    void deleteCareRecord(Long id);
}
