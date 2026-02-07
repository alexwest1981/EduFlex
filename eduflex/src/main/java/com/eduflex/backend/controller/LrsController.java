package com.eduflex.backend.controller;

import com.eduflex.backend.model.XApiState;
import com.eduflex.backend.model.XApiStatement;
import com.eduflex.backend.repository.XApiStateRepository;
import com.eduflex.backend.repository.XApiStatementRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/lrs")
// @CrossOrigin(origins = "*") // Removed to avoid conflict with
// SecurityConfig.setAllowCredentials(true)
@Tag(name = "LRS (xAPI)", description = "Lightweight Learning Record Store for xAPI compliance")
public class LrsController {

    private static final Logger logger = LoggerFactory.getLogger(LrsController.class);
    private final XApiStatementRepository statementRepository;
    private final XApiStateRepository stateRepository;
    private final com.eduflex.backend.repository.XApiAgentProfileRepository agentProfileRepository;

    private final com.eduflex.backend.security.JwtUtils jwtUtils;
    private final com.eduflex.backend.service.XApiProgressService progressService;

    public LrsController(XApiStatementRepository statementRepository,
            XApiStateRepository stateRepository,
            com.eduflex.backend.repository.XApiAgentProfileRepository agentProfileRepository,
            com.eduflex.backend.security.JwtUtils jwtUtils,
            com.eduflex.backend.service.XApiProgressService progressService) {
        this.statementRepository = statementRepository;
        this.stateRepository = stateRepository;
        this.agentProfileRepository = agentProfileRepository;
        this.jwtUtils = jwtUtils;
        this.progressService = progressService;
    }

    @PostMapping("/statements")
    @Transactional
    @Operation(summary = "Receive xAPI Statements", description = "Ingests xAPI statements from content players or mobile apps.")
    public ResponseEntity<List<String>> receiveStatements(
            @RequestHeader(value = "X-Experience-API-Version", defaultValue = "1.0.3") String version,
            @RequestBody Object payload) {

        logger.info("Received xAPI Statement(s) (Version: {})", version);

        // Convert payload to string for storage
        String rawJson;
        ObjectMapper mapper = new ObjectMapper();
        try {
            rawJson = mapper.writeValueAsString(payload);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(List.of("Error serializing statement: " + e.getMessage()));
        }

        XApiStatement statement = new XApiStatement(rawJson);

        // EXTRACTION LOGIC
        try {
            JsonNode node = mapper.readTree(rawJson);

            // Validate basic xAPI structure
            if (!node.has("actor") || !node.has("verb") || !node.has("object")) {
                logger.warn("Invalid xAPI statement: missing actor, verb, or object");
                // We might want to return 400 here, but for now we log and proceed (or save as
                // invalid)
            }

            // Actor (Mbox)
            if (node.has("actor") && node.get("actor").has("mbox")) {
                statement.setActorEmail(node.get("actor").get("mbox").asText().replace("mailto:", ""));
            } else if (node.has("actor") && node.get("actor").has("account")) {
                statement.setActorEmail(node.get("actor").get("account").get("name").asText());
            }

            // Verb
            if (node.has("verb") && node.get("verb").has("id")) {
                statement.setVerbId(node.get("verb").get("id").asText());
            }

            // Object
            if (node.has("object") && node.get("object").has("id")) {
                statement.setObjectId(node.get("object").get("id").asText());
            }

            // Registration
            if (node.has("context") && node.get("context").has("registration")) {
                statement.setRegistration(node.get("context").get("registration").asText());
            }

        } catch (Exception e) {
            logger.warn("Failed to extract xAPI fields: {}", e.getMessage());
        }

        statementRepository.save(statement);

        // Trigger progress calculation
        // Ideally this should be async/event-driven, but direct call is fine for MVP
        try {
            progressService.processStatement(statement);
        } catch (Exception e) {
            logger.error("Failed to process statement for progress", e);
        }

        // xAPI expects a list of IDs of stored statements in response to a POST
        return ResponseEntity.ok()
                .header("X-Experience-API-Version", "1.0.3")
                .body(List.of(java.util.UUID.randomUUID().toString()));
    }

    @GetMapping("/statements")
    @Operation(summary = "Get Recent Statements", description = "List recently received xAPI statements.")
    public ResponseEntity<List<XApiStatement>> getRecentStatements(
            @RequestParam(required = false) String actor,
            @RequestParam(required = false) String activity,
            @RequestParam(required = false) String registration) {

        List<XApiStatement> results;
        if (actor != null) {
            results = statementRepository.findAll().stream()
                    .filter(s -> actor.equals(s.getActorEmail()))
                    .toList();
        } else if (registration != null) {
            results = statementRepository.findAll().stream()
                    .filter(s -> registration.equals(s.getRegistration()))
                    .toList();
        } else {
            results = statementRepository.findAll();
        }

        return ResponseEntity.ok()
                .header("X-Experience-API-Version", "1.0.3")
                .body(results);
    }

    /**
     * cmi5 Fetch Implementation
     * In cmi5, the AU can 'fetch' a token from the server.
     * The response body MUST be a JSON object with the property "auth-token".
     */
    // Implement robust fetchAuthToken with try-catch and explicit JSON content type
    @PostMapping("/fetch")
    public ResponseEntity<String> fetchAuthToken(@RequestHeader Map<String, String> headers) {
        logger.info(">>> CMI5 FETCH REQUEST: headers={}", headers);
        // Generate a real JWT token for the xAPI actor
        try {
            String token = jwtUtils.generateJwtToken("xapi-actor");

            logger.info("Generated JWT fetch token for CMI5 AU. Token length: {}",
                    (token != null ? token.length() : 0));

            // Manually construct JSON to be 100% sure of the format and avoid serialization
            // issues
            // Including ALL possible variations of the token key
            String jsonResponse = String.format(
                    "{\"auth-token\":\"%s\",\"auth_token\":\"%s\",\"authToken\":\"%s\",\"token\":\"%s\"}",
                    token, token, token, token);

            logger.info("<<< CMI5 FETCH RESPONSE: {}", jsonResponse);

            return ResponseEntity.ok()
                    .header("X-Experience-API-Version", "1.0.3")
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .header("Cache-Control", "no-cache, no-store, must-revalidate")
                    .header("Pragma", "no-cache")
                    .header("Expires", "0")
                    .body(jsonResponse);
        } catch (Exception e) {
            logger.error("Error generating CMI5 token", e);
            String errorJson = "{\"error\":\"Failed to generate token: " + e.getMessage().replace("\"", "'") + "\"}";
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .body(errorJson);
        }
    }

    // --- xAPI STATE API ---

    @GetMapping("/activities/state")
    @Transactional(readOnly = true)
    @Operation(summary = "Get xAPI State", description = "Retrieves state data (like bookmarks) for an AU.")
    public ResponseEntity<String> getState(
            @RequestParam String activityId,
            @RequestParam String agent,
            @RequestParam String stateId,
            @RequestParam(required = false) String registration) {

        logger.info(">>> GET STATE: activityId={}, stateId={}, registration={}, agent={}",
                activityId, stateId, registration, agent);

        String actorEmail = extractEmailFromAgent(agent);
        java.util.Optional<XApiState> state;

        if (registration != null && !registration.isEmpty() && !"undefined".equals(registration)) {
            state = stateRepository.findByActorEmailAndActivityIdAndStateIdAndRegistration(actorEmail, activityId,
                    stateId, registration);
        } else {
            state = stateRepository.findByActorEmailAndActivityIdAndStateId(actorEmail, activityId, stateId);
        }

        // Check if data is literally "undefined"
        if (state.isEmpty() && "LMS.LaunchData".equals(stateId)) {
            logger.warn("LMS.LaunchData missing for registration {}. Returning default.", registration);
            String defaultLaunchData = "{\"launchMode\":\"Normal\",\"launchParameters\":\"\",\"moveOn\":\"NotApplicable\",\"masteryScore\":0.8,\"returnURL\":\"\"}";

            logger.info("<<< GET STATE RESPONSE (Default LaunchData): {}", defaultLaunchData);

            return ResponseEntity.ok()
                    .header("X-Experience-API-Version", "1.0.3")
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .header("Cache-Control", "no-cache, no-store, must-revalidate")
                    .header("Pragma", "no-cache")
                    .header("Expires", "0")
                    .body(defaultLaunchData);
        }

        String data = state.map(XApiState::getStateData).orElse("{}");
        if (data == null || data.trim().isEmpty() || "undefined".equalsIgnoreCase(data.trim())) {
            data = "{}";
        }

        logger.info("<<< GET STATE RESPONSE ({}): {}", stateId, data);

        return ResponseEntity.ok()
                .header("X-Experience-API-Version", "1.0.3")
                .header("Content-Type", "application/json;charset=UTF-8")
                .header("Cache-Control", "no-cache, no-store, must-revalidate")
                .header("Pragma", "no-cache")
                .header("Expires", "0")
                .body(data);
    }

    @PutMapping("/activities/state")
    @Transactional
    @Operation(summary = "Save xAPI State", description = "Stores state data (like bookmarks) for an AU.")
    public ResponseEntity<Void> saveState(
            @RequestParam String activityId,
            @RequestParam String agent,
            @RequestParam String stateId,
            @RequestParam(required = false) String registration,
            @RequestBody String stateData) {

        if (stateData == null || "undefined".equalsIgnoreCase(stateData.trim())) {
            logger.warn("Attempted to save 'undefined' state data. Ignoring.");
            return ResponseEntity.badRequest().build();
        }

        String actorEmail = extractEmailFromAgent(agent);
        java.util.Optional<XApiState> existing;

        if (registration != null && !registration.isEmpty() && !"undefined".equals(registration)) {
            existing = stateRepository.findByActorEmailAndActivityIdAndStateIdAndRegistration(actorEmail, activityId,
                    stateId, registration);
        } else {
            existing = stateRepository.findByActorEmailAndActivityIdAndStateId(actorEmail, activityId, stateId);
        }

        XApiState state = existing.orElse(new XApiState());
        state.setActorEmail(actorEmail);
        state.setActivityId(activityId);
        state.setStateId(stateId);
        state.setStateData(stateData);
        state.setRegistration(registration);

        stateRepository.save(state);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/activities/state")
    @Transactional
    @Operation(summary = "Delete xAPI State", description = "Clears state data for an AU.")
    public ResponseEntity<Void> deleteState(
            @RequestParam String activityId,
            @RequestParam String agent,
            @RequestParam String stateId,
            @RequestParam(required = false) String registration) {

        String actorEmail = extractEmailFromAgent(agent);
        if (registration != null && !registration.isEmpty() && !"undefined".equals(registration)) {
            stateRepository.deleteByActorEmailAndActivityIdAndStateIdAndRegistration(actorEmail, activityId, stateId,
                    registration);
        } else {
            stateRepository.deleteByActorEmailAndActivityIdAndStateId(actorEmail, activityId, stateId);
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/agents/profile")
    @Transactional(readOnly = true)
    @Operation(summary = "Get Agent Profile", description = "Retrieves agent profile data.")
    public ResponseEntity<String> getAgentProfile(
            @RequestParam String agent,
            @RequestParam String profileId) {

        String agentId = extractEmailFromAgent(agent);
        logger.info("LRS Profile Request: agentId={}, profileId={}", agentId, profileId);

        return agentProfileRepository.findByAgentIdAndProfileId(agentId, profileId)
                .map(p -> {
                    String doc = p.getProfileDocument();
                    if (doc == null || doc.trim().isEmpty() || "undefined".equalsIgnoreCase(doc.trim())) {
                        doc = "{}";
                    }
                    logger.info("Returning agent profile {}: {}", profileId, doc);
                    return ResponseEntity.ok()
                            .header("X-Experience-API-Version", "1.0.3")
                            .header("Content-Type", "application/json;charset=UTF-8")
                            .header("Cache-Control", "no-cache, no-store, must-revalidate")
                            .header("Pragma", "no-cache")
                            .header("Expires", "0")
                            .body(doc);
                })
                .orElseGet(() -> {
                    // Some libraries fail on 404, so we return 200 with {} for maximum
                    // compatibility
                    logger.info("Agent profile {} not found, returning {} for compatibility", profileId, "{}");
                    return ResponseEntity.ok()
                            .header("X-Experience-API-Version", "1.0.3")
                            .header("Content-Type", "application/json;charset=UTF-8")
                            .header("Cache-Control", "no-cache, no-store, must-revalidate")
                            .header("Pragma", "no-cache")
                            .header("Expires", "0")
                            .body("{}");
                });
    }

    @PutMapping("/agents/profile")
    @Transactional
    @Operation(summary = "Save Agent Profile", description = "Stores agent profile data.")
    public ResponseEntity<Void> saveAgentProfile(
            @RequestParam String agent,
            @RequestParam String profileId,
            @RequestBody String profileDocument) {

        if (profileDocument == null || "undefined".equalsIgnoreCase(profileDocument.trim())) {
            logger.warn("Attempted to save 'undefined' profile document. Ignoring.");
            return ResponseEntity.badRequest().build();
        }

        String agentId = extractEmailFromAgent(agent);
        com.eduflex.backend.model.XApiAgentProfile profile = agentProfileRepository
                .findByAgentIdAndProfileId(agentId, profileId)
                .orElse(new com.eduflex.backend.model.XApiAgentProfile());

        profile.setAgentId(agentId);
        profile.setProfileId(profileId);
        profile.setProfileDocument(profileDocument);

        agentProfileRepository.save(profile);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/agents/profile")
    @Transactional
    @Operation(summary = "Delete Agent Profile", description = "Deletes agent profile data.")
    public ResponseEntity<Void> deleteAgentProfile(
            @RequestParam String agent,
            @RequestParam String profileId) {

        String agentId = extractEmailFromAgent(agent);
        agentProfileRepository.deleteByAgentIdAndProfileId(agentId, profileId);
        return ResponseEntity.noContent().build();
    }

    private String extractEmailFromAgent(String agentParam) {
        if (agentParam == null)
            return "unknown";

        // Sometimes agent is passed as a raw email string instead of JSON in some xAPI
        // wrappers
        if (!agentParam.trim().startsWith("{")) {
            return agentParam.replace("mailto:", "");
        }

        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(agentParam);
            if (node.has("mbox")) {
                return node.get("mbox").asText().replace("mailto:", "");
            } else if (node.has("account")) {
                return node.get("account").get("name").asText();
            }
        } catch (Exception e) {
            logger.warn("Failed to extract email from agent JSON: {}. Using raw value.", agentParam);
        }
        return agentParam; // Fallback to raw value
    }
}
