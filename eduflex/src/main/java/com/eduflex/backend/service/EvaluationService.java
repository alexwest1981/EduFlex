package com.eduflex.backend.service;

import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.User;
import com.eduflex.backend.model.evaluation.*;
import com.eduflex.backend.repository.*;
import com.eduflex.backend.service.ai.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class EvaluationService {

    @Autowired
    private EvaluationTemplateRepository templateRepository;

    @Autowired
    private EvaluationInstanceRepository instanceRepository;

    @Autowired
    private EvaluationResponseRepositoryV2 responseRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private NotificationService notificationService;

    // --- Template Management ---

    public List<EvaluationTemplate> getTemplates(Long userId) {
        List<EvaluationTemplate> templates = templateRepository.findByIsSystemTemplateTrue();
        if (userId != null) {
            templates.addAll(templateRepository.findByCreatedById(userId));
        }
        return templates;
    }

    @Transactional
    public EvaluationTemplate createTemplate(EvaluationTemplate template, User creator) {
        template.setCreatedBy(creator);
        // Ensure bidirectional relationship is set for questions
        if (template.getQuestions() != null) {
            template.getQuestions().forEach(q -> q.setTemplate(template));
        }
        return templateRepository.save(template);
    }

    public Optional<EvaluationTemplate> getTemplate(Long id) {
        return templateRepository.findById(id);
    }

    @Transactional
    public EvaluationTemplate updateTemplate(Long id, EvaluationTemplate updatedTemplate) {
        EvaluationTemplate existingTemplate = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        existingTemplate.setName(updatedTemplate.getName());
        existingTemplate.setDescription(updatedTemplate.getDescription());

        // Handle questions: clear existing and add new ones
        existingTemplate.getQuestions().clear();
        if (updatedTemplate.getQuestions() != null) {
            updatedTemplate.getQuestions().forEach(q -> {
                // Create clean copy to avoid detached entity issues
                EvaluationQuestion newQ = new EvaluationQuestion();
                newQ.setQuestionText(q.getQuestionText());
                newQ.setQuestionType(q.getQuestionType());
                newQ.setOrderIndex(q.getOrderIndex());
                newQ.setTemplate(existingTemplate);
                existingTemplate.getQuestions().add(newQ);
            });
        }

        return templateRepository.save(existingTemplate);
    }

    // --- Evaluation Activation ---

    @Transactional
    public EvaluationInstance activateEvaluation(Long courseId, Long templateId, String title) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        EvaluationTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        EvaluationInstance instance = new EvaluationInstance();
        instance.setCourse(course);
        instance.setTemplate(template);
        instance.setTitle(title != null ? title : template.getName() + " - Utvärdering");
        instance.setStatus(EvaluationInstance.EvaluationStatus.ACTIVE);
        instance.setStartDate(java.time.LocalDateTime.now());

        EvaluationInstance savedInstance = instanceRepository.save(instance);

        // Notify students
        if (course.getStudents() != null) {
            String message = "En ny utvärdering finns tillgänglig för kursen " + course.getName() + ": "
                    + savedInstance.getTitle();
            String actionUrl = "/evaluations/student/" + savedInstance.getId();

            for (User student : course.getStudents()) {
                notificationService.createNotification(
                        student.getId(),
                        message,
                        "INFO",
                        savedInstance.getId(),
                        "EVALUATION_INSTANCE",
                        actionUrl);
            }
        }

        return savedInstance;
    }

    public List<EvaluationInstance> getInstancesForCourse(Long courseId) {
        return instanceRepository.findByCourseId(courseId);
    }

    // --- Response Submission ---

    @Transactional
    public EvaluationResponse submitResponse(Long instanceId, Long studentId, Map<Long, String> answers) {
        EvaluationInstance instance = instanceRepository.findById(instanceId)
                .orElseThrow(() -> new RuntimeException("Evaluation instance not found"));

        // Create a hash for anonymity if studentId is provided
        String studentIdHash = studentId != null
                ? org.springframework.util.DigestUtils.md5DigestAsHex(String.valueOf(studentId).getBytes())
                : null;

        // Prevent duplicates if we have a studentIdHash
        if (studentIdHash != null) {
            Optional<EvaluationResponse> existing = responseRepository.findByInstanceIdAndStudentIdHash(instanceId,
                    studentIdHash);
            if (existing.isPresent()) {
                throw new RuntimeException("Du har redan svarat på denna utvärdering.");
            }
        }

        EvaluationResponse response = new EvaluationResponse();
        response.setInstance(instance);
        response.setStudentIdHash(studentIdHash);

        for (Map.Entry<Long, String> entry : answers.entrySet()) {
            EvaluationAnswer answer = new EvaluationAnswer();
            answer.setResponse(response);

            // Find the question in the template to ensure it exists
            EvaluationQuestion question = instance.getTemplate().getQuestions().stream()
                    .filter(q -> q.getId().equals(entry.getKey()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Question " + entry.getKey() + " not found in template"));

            answer.setQuestion(question);
            answer.setAnswerValue(entry.getValue());
            response.getAnswers().add(answer);
        }

        EvaluationResponse savedResponse = responseRepository.save(response);

        // Update response count on instance
        instance.setResponseCount(instance.getResponseCount() + 1);
        instanceRepository.save(instance);

        return savedResponse;
    }

    // --- Analytics & AI ---

    public Map<String, Object> getEvaluationSummary(Long instanceId) {
        EvaluationInstance instance = instanceRepository.findById(instanceId)
                .orElseThrow(() -> new RuntimeException("Instance not found"));

        List<EvaluationResponse> responses = responseRepository.findByInstanceId(instanceId);
        List<EvaluationQuestion> questions = instance.getTemplate().getQuestions();

        Map<Long, Map<String, Object>> questionStats = new HashMap<>();

        for (EvaluationQuestion question : questions) {
            Map<String, Object> stats = new HashMap<>();
            stats.put("text", question.getQuestionText());
            stats.put("type", question.getQuestionType());

            List<String> answers = responses.stream()
                    .flatMap(r -> r.getAnswers().stream())
                    .filter(a -> a.getQuestion().getId().equals(question.getId()))
                    .map(EvaluationAnswer::getAnswerValue)
                    .filter(v -> v != null && !v.isBlank())
                    .collect(Collectors.toList());

            if (question.getQuestionType() == EvaluationQuestion.QuestionType.LIKERT ||
                    question.getQuestionType() == EvaluationQuestion.QuestionType.NPS) {
                double avg = answers.stream()
                        .mapToDouble(Double::parseDouble)
                        .average()
                        .orElse(0.0);
                stats.put("average", avg);
                stats.put("count", answers.size());
            } else if (question.getQuestionType() == EvaluationQuestion.QuestionType.TEXT) {
                stats.put("comments", answers);
                stats.put("count", answers.size());
            } else {
                // For EMOJI or MULTIPLE_CHOICE, we could do frequency analysis
                Map<String, Long> freq = answers.stream()
                        .collect(Collectors.groupingBy(s -> s, Collectors.counting()));
                stats.put("distribution", freq);
                stats.put("count", answers.size());
            }

            questionStats.put(question.getId(), stats);
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("instanceTitle", instance.getTitle());
        summary.put("responseCount", instance.getResponseCount());
        summary.put("status", instance.getStatus());
        summary.put("aiSummary", instance.getAiSummary());
        summary.put("questionStats", questionStats);

        return summary;
    }

    @Transactional
    public String generateAISummary(Long instanceId) {
        EvaluationInstance instance = instanceRepository.findById(instanceId)
                .orElseThrow(() -> new RuntimeException("Instance not found"));

        List<EvaluationResponse> responses = responseRepository.findByInstanceId(instanceId);

        StringBuilder feedbackData = new StringBuilder();
        feedbackData.append("Utvärdering: ").append(instance.getTitle()).append("\n");
        feedbackData.append("Kurs: ").append(instance.getCourse().getName()).append("\n\n");

        for (EvaluationQuestion question : instance.getTemplate().getQuestions()) {
            if (question.getQuestionType() == EvaluationQuestion.QuestionType.TEXT) {
                feedbackData.append("Fråga: ").append(question.getQuestionText()).append("\n");
                responses.stream()
                        .flatMap(r -> r.getAnswers().stream())
                        .filter(a -> a.getQuestion().getId().equals(question.getId()))
                        .map(EvaluationAnswer::getAnswerValue)
                        .filter(v -> v != null && !v.isBlank())
                        .forEach(v -> feedbackData.append("- ").append(v).append("\n"));
                feedbackData.append("\n");
            }
        }

        if (feedbackData.length() < 100) {
            return "För lite data för att generera en AI-analys.";
        }

        String prompt = "Du är en expert på kursutvärdering. Analysera följande kommentarer från elever och ge en sammanfattning. "
                +
                "Lyft fram vad som var bra, vad som kan förbättras och ge konkreta råd till läraren. " +
                "Svara på svenska i ett pedagogiskt och konstruktivt format.\n\n" + feedbackData.toString();

        String aiSummary = geminiService.generateResponse(prompt);
        instance.setAiSummary(aiSummary);
        instanceRepository.save(instance);

        return aiSummary;
    }

    public List<EvaluationInstance> getActiveEvaluationsForStudent(User student) {
        if (student == null || student.getCourses() == null || student.getCourses().isEmpty()) {
            return Collections.emptyList();
        }

        Set<Long> courseIds = student.getCourses().stream().map(Course::getId).collect(Collectors.toSet());
        List<EvaluationInstance> activeInstances = instanceRepository.findByCourseIdInAndStatus(courseIds,
                EvaluationInstance.EvaluationStatus.ACTIVE);

        // Filter out those the student has already answered
        String studentIdHash = org.springframework.util.DigestUtils
                .md5DigestAsHex(String.valueOf(student.getId()).getBytes());

        return activeInstances.stream()
                .filter(instance -> responseRepository.findByInstanceIdAndStudentIdHash(instance.getId(), studentIdHash)
                        .isEmpty())
                .collect(Collectors.toList());
    }
}
