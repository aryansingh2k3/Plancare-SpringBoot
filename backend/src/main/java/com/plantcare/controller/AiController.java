package com.plantcare.controller;

import com.plantcare.service.AiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI Plant Assistant", description = "Endpoints for generating intelligent care instructions using Gemini LLM")
public class AiController {

    private final AiService aiService;

    // Constructor Injection
    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @GetMapping("/tips")
    @Operation(summary = "Get AI care tips", description = "Returns care advice for a plant species. Falls back to pre-defined tips if Gemini is unavailable.")
    public ResponseEntity<Map<String, String>> getPlantCareTips(@RequestParam String species) {
        String tips = aiService.getPlantCareTips(species);
        // Returning JSON wrap: { "tips": "..." }
        return ResponseEntity.ok(Map.of("tips", tips));
    }
}
