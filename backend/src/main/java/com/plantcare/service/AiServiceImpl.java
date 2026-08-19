package com.plantcare.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiServiceImpl implements AiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate;

    public AiServiceImpl() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    @SuppressWarnings("rawtypes")
    public String getPlantCareTips(String species) {
        if (apiKey == null || apiKey.trim().isEmpty() || "null".equalsIgnoreCase(apiKey)) {
            return getLocalFallbackTips(species);
        }

        try {
            String url = apiUrl + "?key=" + apiKey;

            // Prepare Request Payload for Gemini API
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", "Provide practical and structured care instructions for the plant species: " + species + 
                                 ". Include light requirements, watering interval, soil choice, and standard humidity tips. Keep the response formatted in clean markdown.");

            Map<String, Object> partsObj = new HashMap<>();
            partsObj.put("parts", List.of(textPart));

            Map<String, Object> payload = new HashMap<>();
            payload.put("contents", List.of(partsObj));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map body = response.getBody();
                List candidates = (List) body.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map firstCandidate = (Map) candidates.get(0);
                    Map content = (Map) firstCandidate.get("content");
                    if (content != null) {
                        List parts = (List) content.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            Map firstPart = (Map) parts.get(0);
                            return (String) firstPart.get("text");
                        }
                    }
                }
            }
            
            // If response format is unexpected, go to fallback
            return getLocalFallbackTips(species);

        } catch (Exception e) {
            System.err.println("Gemini API request failed. Using fallback tips. Error: " + e.getMessage());
            return getLocalFallbackTips(species);
        }
    }

    private String getLocalFallbackTips(String species) {
        String lowerSpecies = species.toLowerCase();
        
        if (lowerSpecies.contains("water") || lowerSpecies.contains("hydro") || lowerSpecies.contains("aquat") || lowerSpecies.contains("money plant")) {
            return "### 💧 AI Care Tips for **" + species + "** (Water / Hydroponic Group)\n\n" +
                   "*   **Medium**: Grown directly in water (with optional decorative pebbles). No soil required!\n" +
                   "*   **Water Change**: Change the water completely every 7–10 days to prevent algae growth and replenish oxygen levels. Use room-temperature chlorine-free water.\n" +
                   "*   **Light**: Place in bright, indirect sunlight. Avoid direct sunlight, which warms the water and accelerates algae growth.\n" +
                   "*   **Nutrition**: Since there is no soil, add a few drops of specialized liquid hydroponic fertilizer to the water once a month during the growing season.\n" +
                   "*   **Pro Tip**: Ensure only the roots are submerged in the water. The stems and leaves should remain dry above the waterline to avoid rot.";
        } else if (lowerSpecies.contains("aloe") || lowerSpecies.contains("succulent") || lowerSpecies.contains("cactus") || lowerSpecies.contains("snake")) {
            return "### 🌵 AI Care Tips for **" + species + "** (Succulent / Arid Group)\n\n" +
                   "*   **Light**: Requires bright, direct sunlight. 6+ hours per day is ideal.\n" +
                   "*   **Water**: Water thoroughly only when the soil is completely dry. Typically every 10–14 days. Avoid overwatering!\n" +
                   "*   **Soil**: Use a well-draining succulent or cactus soil mix (rich in sand and perlite).\n" +
                   "*   **Humidity & Temp**: Prefers low humidity and warm temperatures (18°C–29°C).\n" +
                   "*   **Pro Tip**: Ensure the container has a drainage hole to prevent root rot.";
        } else if (lowerSpecies.contains("fern") || lowerSpecies.contains("boston")) {
            return "### 🌿 AI Care Tips for **" + species + "** (Fern / Moisture-loving Group)\n\n" +
                   "*   **Light**: Prefers medium to bright indirect light. Avoid direct hot sun.\n" +
                   "*   **Water**: Keep the soil consistently moist but not waterlogged. Water when the top 1 inch feels dry (every 4-7 days).\n" +
                   "*   **Soil**: Rich, moisture-retaining potting soil mix with peat moss.\n" +
                   "*   **Humidity & Temp**: High humidity is key. Mist daily or use a pebble tray. Keep temperature between 16°C–24°C.\n" +
                   "*   **Pro Tip**: Fronds turn yellow if humidity is too low.";
        } else if (lowerSpecies.contains("pothos") || lowerSpecies.contains("monstera") || lowerSpecies.contains("philodendron")) {
            return "### 🍃 AI Care Tips for **" + species + "** (Tropical Foliage Group)\n\n" +
                   "*   **Light**: Thrives in medium to bright indirect light. Can tolerate lower light.\n" +
                   "*   **Water**: Water when the top 2 inches of soil feels dry. Typically every 7–10 days.\n" +
                   "*   **Soil**: Loose, well-aerated potting mix containing peat moss, perlite, and orchid bark.\n" +
                   "*   **Humidity & Temp**: Appreciates moderate to high humidity (50%+). Keep temperature warm (18°C–27°C).\n" +
                   "*   **Pro Tip**: Clean the leaves periodically with a damp cloth to help the plant photosynthesize.";
        } else {
            return "### 🌱 AI Care Tips for **" + species + "** (General Guidelines)\n\n" +
                   "*   **Light**: Provide bright, indirect sunlight for optimal growth.\n" +
                   "*   **Water**: Water when the top 1-2 inches of soil feels dry. Check moisture levels weekly.\n" +
                   "*   **Soil**: Use a high-quality, general-purpose potting mix that drains well.\n" +
                   "*   **Humidity & Temp**: Maintain comfortable indoor conditions (40-60% humidity, 18°C–24°C).\n" +
                   "*   **Pro Tip**: Check your plant's leaves regularly for signs of underwatering (drooping, dry tips) or overwatering (yellowing leaves).";
        }
    }
}
