package com.eduflex.backend.service.ai;

import com.eduflex.backend.model.*;
import com.eduflex.backend.repository.*;
import com.eduflex.backend.service.ResourceService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AIResourceService {

  private static final Logger logger = LoggerFactory.getLogger(AIResourceService.class);

  private final GeminiService geminiService;
  private final ResourceService resourceService;
  private final ObjectMapper objectMapper;
  private final AssignmentRepository assignmentRepository;
  private final LessonRepository lessonRepository;
  private final QuizRepository quizRepository;
  private final UserRepository userRepository;

  public AIResourceService(GeminiService geminiService, ResourceService resourceService, ObjectMapper objectMapper,
      AssignmentRepository assignmentRepository, LessonRepository lessonRepository, QuizRepository quizRepository,
      UserRepository userRepository) {
    this.geminiService = geminiService;
    this.resourceService = resourceService;
    this.objectMapper = objectMapper;
    this.assignmentRepository = assignmentRepository;
    this.lessonRepository = lessonRepository;
    this.quizRepository = quizRepository;
    this.userRepository = userRepository;
  }

  private static final String RESOURCE_SYSTEM_PROMPT = """
      Du är en pedagogisk expert för EduFlex LMS. Din uppgift är att generera högkvalitativa utbildningsresurser.

      TYPER:
      - QUIZ: Ett set med frågor, alternativ och rätta svar.
      - TASK: En inlämningsuppgift med instruktioner och betygskriterier.
      - LESSON: En lektionsplanering med mål, genomgång och aktiviteter.

      VIKTIGT:
      Svara ALLTID med ETT enda JSON-objekt (INTE en array). Inget markdown. Inga kodblock. Börja direkt med { och sluta med }.

      FORMAT FÖR QUIZ:
      {
        "name": "Quiz-titel",
        "description": "Kort beskrivning",
        "type": "QUIZ",
        "content": {
          "questions": [
            { "text": "Fråga?", "options": ["A", "B", "C"], "answer": "B" }
          ]
        }
      }

      FORMAT FÖR TASK (Uppgift):
      {
        "name": "Uppgifts-titel",
        "description": "Övergripande beskrivning",
        "type": "TASK",
        "content": {
          "instructions": "Detaljerade steg...",
          "criteria": ["Kriterie 1", "Kriterie 2"],
          "submissionType": "FILE"
        }
      }

      FORMAT FÖR LESSON:
      {
        "name": "Lektions-titel",
        "description": "Syfte",
        "type": "LESSON",
        "content": {
          "outline": [
            { "title": "Introduktion", "content": "Säg hej..." },
            { "title": "Genomgång", "content": "Förklara X..." }
          ],
          "duration": "60 min"
        }
      }
      """;

  @Transactional
  public Resource generateResource(Long userId, String type, String prompt, String context) {
    String fullPrompt = RESOURCE_SYSTEM_PROMPT + "\n\nUPPGIFT:\nSkapa en " + type + " baserat på följande:\n"
        + prompt;
    if (context != null && !context.isEmpty()) {
      fullPrompt += "\n\nEXTRA KONTEXT:\n" + context;
    }

    try {
      String jsonResponse = geminiService.generateJsonContent(fullPrompt);
      jsonResponse = cleanJson(jsonResponse);

      // Gemini sometimes wraps the result in an array – unwrap if needed
      Map<String, Object> data;
      if (jsonResponse.startsWith("[")) {
        List<Map<String, Object>> list = objectMapper.readValue(jsonResponse,
            new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, Object>>>() {});
        if (list.isEmpty()) throw new RuntimeException("Gemini returned empty array");
        data = list.get(0);
      } else {
        data = objectMapper.readValue(jsonResponse,
            new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
      }
      String resourceTypeStr = ((String) data.get("type")).toUpperCase();
      Resource.ResourceType resourceType = Resource.ResourceType.valueOf(resourceTypeStr);

      User author = userRepository.findById(userId).orElseThrow();

      // 1. Create the Generic Resource (for the Resource Bank)
      Resource resource = new Resource();
      resource.setName((String) data.get("name"));
      resource.setDescription((String) data.get("description"));
      resource.setType(resourceType);

      // Convert the content map back to JSON string for storage
      Object contentObj = data.get("content");
      String contentJson = objectMapper.writeValueAsString(contentObj);
      resource.setContent(contentJson);

      // Save as Resource
      Resource savedResource = resourceService.createResource(userId, resource);

      // 2. ALSO save as domain-specific entity so it appears in specific modules
      try {
        if ("TASK".equals(resourceTypeStr)) {
          saveAsAssignment(author, data);
        } else if ("LESSON".equals(resourceTypeStr)) {
          saveAsLesson(author, data);
        } else if ("QUIZ".equals(resourceTypeStr)) {
          saveAsQuiz(author, data);
        }
      } catch (Exception e) {
        logger.error("Failed to save domain-specific entity for AI resource", e);
        // We don't fail the whole operation if domain-saving fails, but it's not ideal
      }

      return savedResource;

    } catch (Exception e) {
      logger.error("Failed to generate AI resource", e);
      throw new RuntimeException("Could not generate resource: " + e.getMessage());
    }
  }

  private void saveAsAssignment(User author, Map<String, Object> data) {
    Assignment assignment = new Assignment();
    assignment.setTitle((String) data.get("name"));
    assignment.setAuthor(author);

    Map<String, Object> content = (Map<String, Object>) data.get("content");
    StringBuilder desc = new StringBuilder();
    desc.append(data.get("description")).append("\n\n");
    if (content.containsKey("instructions")) {
      desc.append("### Instruktioner\n").append(content.get("instructions")).append("\n\n");
    }
    if (content.containsKey("criteria")) {
      desc.append("### Betygskriterier\n");
      List<String> criteria = (List<String>) content.get("criteria");
      for (String c : criteria) {
        desc.append("- ").append(c).append("\n");
      }
    }
    assignment.setDescription(desc.toString());
    assignment.setDueDate(LocalDateTime.now().plusDays(7)); // Default 1 week out
    assignmentRepository.save(assignment);
  }

  private void saveAsLesson(User author, Map<String, Object> data) {
    Lesson lesson = new Lesson();
    lesson.setTitle((String) data.get("name"));
    lesson.setAuthor(author);
    lesson.setSortOrder(0);

    Map<String, Object> content = (Map<String, Object>) data.get("content");
    StringBuilder sb = new StringBuilder();
    sb.append("# ").append(data.get("name")).append("\n\n");
    sb.append(data.get("description")).append("\n\n");

    if (content.containsKey("outline")) {
      List<Map<String, String>> outline = (List<Map<String, String>>) content.get("outline");
      for (Map<String, String> section : outline) {
        sb.append("## ").append(section.get("title")).append("\n");
        sb.append(section.get("content")).append("\n\n");
      }
    }

    if (content.containsKey("duration")) {
      sb.append("**Tidsåtgång:** ").append(content.get("duration"));
    }

    lesson.setContent(sb.toString());
    lessonRepository.save(lesson);
  }

  private void saveAsQuiz(User author, Map<String, Object> data) {
    Quiz quiz = new Quiz();
    quiz.setTitle((String) data.get("name"));
    quiz.setDescription((String) data.get("description"));
    quiz.setAuthor(author);

    Map<String, Object> content = (Map<String, Object>) data.get("content");
    if (content.containsKey("questions")) {
      List<Map<String, Object>> questionsData = (List<Map<String, Object>>) content.get("questions");
      List<Question> questions = new ArrayList<>();

      for (Map<String, Object> qData : questionsData) {
        Question q = new Question();
        q.setText((String) qData.get("text"));
        q.setQuiz(quiz);

        List<String> optionsTexts = (List<String>) qData.get("options");
        String correctAnswerText = (String) qData.get("answer");

        List<Option> options = new ArrayList<>();
        for (String optText : optionsTexts) {
          Option o = new Option();
          o.setText(optText);
          o.setCorrect(optText.equalsIgnoreCase(correctAnswerText));
          o.setQuestion(q);
          options.add(o);
        }
        q.setOptions(options);
        questions.add(q);
      }
      quiz.setQuestions(questions);
    }
    quizRepository.save(quiz);
  }

  private String cleanJson(String response) {
    if (response == null)
      return "{}";
    response = response.trim();
    if (response.startsWith("```json")) {
      response = response.substring(7);
    } else if (response.startsWith("```")) {
      response = response.substring(3);
    }
    if (response.endsWith("```")) {
      response = response.substring(0, response.length() - 3);
    }
    return response.trim();
  }
}
