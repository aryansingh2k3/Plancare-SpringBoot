package com.plantcare.repository;

import com.plantcare.entity.Plant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PlantRepository extends JpaRepository<Plant, Long> {

    List<Plant> findByCategoryIgnoreCase(String category);

    List<Plant> findByNameContainingIgnoreCase(String name);

    List<Plant> findByNextWateringDateLessThanEqual(LocalDate date);

    @Query("SELECT p FROM Plant p WHERE " +
           "(:category IS NULL OR :category = '' OR LOWER(p.category) = LOWER(:category)) AND " +
           "(:search IS NULL OR :search = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.species) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:wateringDue = false OR p.nextWateringDate <= :today)")
    List<Plant> searchPlants(@Param("category") String category,
                             @Param("search") String search,
                             @Param("wateringDue") boolean wateringDue,
                             @Param("today") LocalDate today);
}
