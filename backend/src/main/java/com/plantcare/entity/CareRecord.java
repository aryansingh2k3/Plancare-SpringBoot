package com.plantcare.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "care_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CareRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plant_id", nullable = false)
    private Plant plant;

    @Column(nullable = false)
    private String careType; // "Watering", "Fertilization", "Repotting", "Pruning"

    @Column(nullable = false)
    private LocalDateTime careDate;

    @Column(length = 500)
    private String notes;
}
