package com.eduflex.scorm.controller;

import com.eduflex.scorm.model.XApiState;
import com.eduflex.scorm.model.XApiStatement;
import com.eduflex.scorm.repository.XApiAgentProfileRepository;
import com.eduflex.scorm.repository.XApiStateRepository;
import com.eduflex.scorm.repository.XApiStatementRepository;
import com.eduflex.scorm.model.XApiAgentProfile;
import com.eduflex.scorm.service.StatusCallbackService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/lrs")
public class LrsController {

    private static final Logger log = LoggerFactory.getLogger(LrsController.class);

    private final XApiStatementRepository statementRepository;
    private final XApiStateRepository stateRepository;
    private final XApiAgentProfileRepository agentProfileRepository;
    private final StatusCallbackService callbackService;
    private final ObjectMapper objectMapper;

    public LrsController(XApiStatementRepository statementRepository, XApiStateRepository stateRepository,
            XApiAgentProfileRepository agentProfileRepository, StatusCallbackService callbackService,
            ObjectMapper objectMapper) {
        this.statementRepository = statementRepository;
        this.stateRepository = stateRepository;
        this.agentProfileRepository = agentProfileRepository;
        this.callbackService = callbackService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/statements")
    @Transactional
    public ResponseEntity<List<String>> receiveStatements(
            @RequestHeader(value = "X-Experience-API-Version", defaultValue = "1.0.3") String version,
            @RequestBody Object payload) {

        log.info("Received xAPI Statement(s) (Version: {})", version);

        try {
            String rawJson = objectMapper.writeValueAsString(payload);
            XApiStatement statement = new XApiStatement(rawJson);
            JsonNode node = objectMapper.readTree(rawJson);

            // Basic Field Extraction
            if (node.has("actor")) {
                if (node.get("actor").has("mbox")) {
                    statement.setActorEmail(node.get("actor").get("mbox").asText().replace("mailto:", ""));
                } else if (node.get("actor").has("account")) {
                    statement.setActorEmail(node.get("actor").get("account").get("name").asText());
                }
            }

            if (node.has("verb") && node.get("verb").has("id")) {
                statement.setVerbId(node.get("verb").get("id").asText());
            }

            if (node.has("object") && node.get("object").has("id")) {
                statement.setObjectId(node.get("object").get("id").asText());
            }

            if (node.has("context") && node.get("context").has("registration")) {
                statement.setRegistration(node.get("context").get("registration").asText());
            }

            statementRepository.save(statement);

            // Trigger callback for completion/progress
            String verbId = statement.getVerbId();
            if ("http://adlnet.gov/expapi/verbs/completed".equals(verbId) ||
                    "http://adlnet.gov/expapi/verbs/passed".equals(verbId)) {
                callbackService.notifyProgress(
                        statement.getActorEmail(),
                        statement.getObjectId(),
                        verbId,
                        statement.getRegistration(),
                        rawJson);
            }

            return ResponseEntity.ok()
                    .header("X-Experience-API-Version", "1.0.3")
                    .body(List.of(UUID.randomUUID().toString()));
        } catch (Exception e) {
            log.error("Failed to process xAPI statement", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/activities/state")
    public ResponseEntity<String> getState(
            @RequestParam String activityId,
            @RequestParam String agent,
            @RequestParam String stateId,
            @RequestParam(required = false) String registration) {

        String actorEmail = extractEmailFromAgent(agent);
        Optional<XApiState> state;

        if (registration != null && !registration.isEmpty() && !"undefined".equals(registration)) {
            state = stateRepository.findByActorEmailAndActivityIdAndStateIdAndRegistration(actorEmail, activityId,
                    stateId, registration);
        } else {
            state = stateRepository.findByActorEmailAndActivityIdAndStateId(actorEmail, activityId, stateId);
        }

        String data = state.map(XApiState::getStateData).orElse("{}");
        return ResponseEntity.ok()
                .header("X-Experience-API-Version", "1.0.3")
                .header("Content-Type", "application/json")
                .body(data);
    }

    @PutMapping("/activities/state")
    @Transactional
    public ResponseEntity<Void> saveState(
            @RequestParam String activityId,
            @RequestParam String agent,
            @RequestParam String stateId,
            @RequestParam(required = false) String registration,
            @RequestBody String stateData) {

        String actorEmail = extractEmailFromAgent(agent);
        XApiState state = stateRepository
                .findByActorEmailAndActivityIdAndStateIdAndRegistration(actorEmail, activityId, stateId, registration)
                .orElse(new XApiState(actorEmail, activityId, stateId, stateData, registration));

        state.setStateData(stateData);
        stateRepository.save(state);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/agents/profile")
    public ResponseEntity<String> getAgentProfile(@RequestParam String agent, @RequestParam String profileId) {
        String agentId = extractEmailFromAgent(agent);
        String doc = agentProfileRepository.findByAgentIdAndProfileId(agentId, profileId)
                .map(XApiAgentProfile::getProfileDocument)
                .orElse("{}");

        return ResponseEntity.ok()
                .header("X-Experience-API-Version", "1.0.3")
                .header("Content-Type", "application/json")
                .body(doc);
    }

    private String extractEmailFromAgent(String agentParam) {
        if (agentParam == null)
            return "unknown";
        if (!agentParam.trim().startsWith("{"))
            return agentParam.replace("mailto:", "");
        try {
            JsonNode node = objectMapper.readTree(agentParam);
            if (node.has("mbox"))
                return node.get("mbox").asText().replace("mailto:", "");
            if (node.has("account"))
                return node.get("account").get("name").asText();
        } catch (Exception e) {
            log.warn("Failed to parse agent JSON: {}", agentParam);
        }
        return agentParam;
    }
}
