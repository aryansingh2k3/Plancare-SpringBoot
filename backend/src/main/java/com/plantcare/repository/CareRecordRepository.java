package com.plantcare.repository;

import com.plantcare.entity.CareRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CareRecordRepository extends JpaRepository<CareRecord, Long> {
    
    List<CareRecord> findByPlantIdOrderByCareDateDesc(Long plantId);
}
