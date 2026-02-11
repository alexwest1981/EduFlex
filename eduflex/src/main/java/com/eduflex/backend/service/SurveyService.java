package com.eduflex.backend.service;

import com.eduflex.backend.model.Role;
import com.eduflex.backend.model.User;
import com.eduflex.backend.model.survey.*;
import com.eduflex.backend.model.survey.SurveyDistribution.DistributionStatus;
import com.eduflex.backend.model.survey.SurveyQuestion.QuestionType;
import com.eduflex.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SurveyService {

    @Autowired
    private SurveyTemplateRepository templateRepository;

    @Autowired
    private SurveyDistributionRepository distributionRepository;

    @Autowired
    private SurveyResponseRepository responseRepository;

    @Autowired
    private SurveyAnswerRepository answerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private MessageService messageService;

    // --- Template CRUD ---

    public List<SurveyTemplate> getActiveTemplates() {
        return templateRepository.findByIsActiveTrueOrderByCreatedAtDesc();
    }

    @Transactional
    public SurveyTemplate createTemplate(SurveyTemplate template, User creator) {
        template.setCreatedBy(creator);
        template.setActive(true);
        if (template.getQuestions() != null) {
            for (int i = 0; i < template.getQuestions().size(); i++) {
                SurveyQuestion q = template.getQuestions().get(i);
                q.setTemplate(template);
                q.setSortOrder(i);
            }
        }
        return templateRepository.save(template);
    }

    @Transactional
    public SurveyTemplate updateTemplate(Long id, SurveyTemplate updated) {
        SurveyTemplate existing = templateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Template not found: " + id));

        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());

        existing.getQuestions().clear();
        if (updated.getQuestions() != null) {
            for (int i = 0; i < updated.getQuestions().size(); i++) {
                SurveyQuestion q = updated.getQuestions().get(i);
                q.setTemplate(existing);
                q.setSortOrder(i);
                q.setId(null);
                existing.getQuestions().add(q);
            }
        }

        return templateRepository.save(existing);
    }

    @Transactional
    public void deleteTemplate(Long id) {
        SurveyTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Template not found: " + id));
        template.setActive(false);
        templateRepository.save(template);
    }

    // --- Distribution ---

    @Transactional
    public SurveyDistribution createDistribution(Long templateId, String targetRole,
            LocalDateTime deadline, User sender) {
        SurveyTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("Template not found: " + templateId));

        SurveyDistribution dist = new SurveyDistribution();
        dist.setTemplate(template);
        dist.setTargetRole(targetRole);
        dist.setStatus(DistributionStatus.ACTIVE);
        dist.setSentBy(sender);
        dist.setSentAt(LocalDateTime.now());
        dist.setDeadline(deadline);

        SurveyDistribution saved = distributionRepository.save(dist);

        // Send notification to all target users via internal messaging
        List<User> targets = userRepository.findByRole_Name(targetRole);
        String subject = "Ny enkät: " + template.getTitle();
        String desc = template.getDescription() != null ? template.getDescription() : "";
        String content = "<p>Du har fått en ny enkät: <b>" + template.getTitle() + "</b></p>"
                + (desc.isEmpty() ? "" : "<p>" + desc + "</p>")
                + "<p><a href=\"/survey/" + saved.getId() + "\">Besvara enkäten här</a></p>";

        for (User target : targets) {
            try {
                messageService.sendMessage(null, target.getId(), subject, content, null);
            } catch (Exception e) {
                // Don't fail distribution if a single message fails
            }
        }

        return saved;
    }

    public List<SurveyDistribution> getAllDistributions() {
        return distributionRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public SurveyDistribution closeDistribution(Long distributionId) {
        SurveyDistribution dist = distributionRepository.findById(distributionId)
                .orElseThrow(() -> new IllegalArgumentException("Distribution not found: " + distributionId));
        dist.setStatus(DistributionStatus.CLOSED);
        return distributionRepository.save(dist);
    }

    // --- Respondent-facing ---

    public List<Map<String, Object>> getPendingSurveysForUser(User user) {
        String roleName = user.getRole() != null ? user.getRole().getName() : "";
        List<SurveyDistribution> active = distributionRepository
                .findByTargetRoleAndStatus(roleName, DistributionStatus.ACTIVE);

        List<Map<String, Object>> pending = new ArrayList<>();
        for (SurveyDistribution dist : active) {
            if (!responseRepository.existsByDistributionIdAndRespondentId(dist.getId(), user.getId())) {
                Map<String, Object> item = new HashMap<>();
                item.put("distributionId", dist.getId());
                item.put("title", dist.getTemplate().getTitle());
                item.put("description", dist.getTemplate().getDescription());
                item.put("sentAt", dist.getSentAt());
                item.put("deadline", dist.getDeadline());
                item.put("questionCount", dist.getTemplate().getQuestions().size());
                pending.add(item);
            }
        }
        return pending;
    }

    public Map<String, Object> getDistributionDetails(Long distributionId) {
        SurveyDistribution dist = distributionRepository.findById(distributionId)
                .orElseThrow(() -> new IllegalArgumentException("Distribution not found: " + distributionId));

        Map<String, Object> details = new HashMap<>();
        details.put("distributionId", dist.getId());
        details.put("title", dist.getTemplate().getTitle());
        details.put("description", dist.getTemplate().getDescription());
        details.put("deadline", dist.getDeadline());
        details.put("questions", dist.getTemplate().getQuestions());
        return details;
    }

    @Transactional
    public SurveyResponse submitResponse(Long distributionId, User respondent,
            Map<String, Object> answersMap) {
        SurveyDistribution dist = distributionRepository.findById(distributionId)
                .orElseThrow(() -> new IllegalArgumentException("Distribution not found: " + distributionId));

        if (dist.getStatus() != DistributionStatus.ACTIVE) {
            throw new IllegalStateException("This survey is no longer active");
        }

        if (responseRepository.existsByDistributionIdAndRespondentId(distributionId, respondent.getId())) {
            throw new IllegalStateException("You have already responded to this survey");
        }

        SurveyResponse response = new SurveyResponse();
        response.setDistribution(dist);
        response.setRespondent(respondent);

        Map<Long, SurveyQuestion> questionMap = dist.getTemplate().getQuestions().stream()
                .collect(Collectors.toMap(SurveyQuestion::getId, q -> q));

        for (Map.Entry<String, Object> entry : answersMap.entrySet()) {
            Long questionId = Long.parseLong(entry.getKey());
            SurveyQuestion question = questionMap.get(questionId);
            if (question == null)
                continue;

            SurveyAnswer answer = new SurveyAnswer();
            answer.setResponse(response);
            answer.setQuestion(question);

            switch (question.getQuestionType()) {
                case RATING_1_5:
                    answer.setRatingValue(Integer.parseInt(entry.getValue().toString()));
                    break;
                case YES_NO:
                    answer.setRatingValue("true".equalsIgnoreCase(entry.getValue().toString())
                            || "ja".equalsIgnoreCase(entry.getValue().toString())
                            || "1".equals(entry.getValue().toString()) ? 1 : 0);
                    break;
                case MULTIPLE_CHOICE:
                    answer.setSelectedOption(entry.getValue().toString());
                    break;
                case FREE_TEXT:
                    answer.setAnswerText(entry.getValue().toString());
                    break;
            }

            response.getAnswers().add(answer);
        }

        return responseRepository.save(response);
    }

    // --- Results/Statistics ---

    public Map<String, Object> getDistributionResults(Long distributionId) {
        SurveyDistribution dist = distributionRepository.findById(distributionId)
                .orElseThrow(() -> new IllegalArgumentException("Distribution not found: " + distributionId));

        long totalResponded = responseRepository.countByDistributionId(distributionId);
        long totalTargeted = userRepository.findByRole_Name(dist.getTargetRole()).size();

        Map<String, Object> result = new HashMap<>();
        result.put("templateTitle", dist.getTemplate().getTitle());
        result.put("targetRole", dist.getTargetRole());
        result.put("status", dist.getStatus());
        result.put("totalTargeted", totalTargeted);
        result.put("totalResponded", totalResponded);
        result.put("responseRate",
                totalTargeted > 0 ? Math.round((double) totalResponded / totalTargeted * 100) : 0);

        List<Map<String, Object>> questionStats = new ArrayList<>();
        for (SurveyQuestion question : dist.getTemplate().getQuestions()) {
            Map<String, Object> qStat = new HashMap<>();
            qStat.put("questionId", question.getId());
            qStat.put("questionText", question.getQuestionText());
            qStat.put("questionType", question.getQuestionType());

            List<SurveyAnswer> answers = answerRepository
                    .findByResponse_DistributionIdAndQuestionId(distributionId, question.getId());

            switch (question.getQuestionType()) {
                case RATING_1_5: {
                    double avg = answers.stream()
                            .filter(a -> a.getRatingValue() != null)
                            .mapToInt(SurveyAnswer::getRatingValue)
                            .average().orElse(0);
                    qStat.put("average", Math.round(avg * 10.0) / 10.0);

                    Map<Integer, Long> distribution = new HashMap<>();
                    for (int i = 1; i <= 5; i++) {
                        final int val = i;
                        distribution.put(i, answers.stream()
                                .filter(a -> a.getRatingValue() != null && a.getRatingValue() == val)
                                .count());
                    }
                    qStat.put("distribution", distribution);
                    break;
                }
                case YES_NO: {
                    long yesCount = answers.stream()
                            .filter(a -> a.getRatingValue() != null && a.getRatingValue() == 1)
                            .count();
                    long noCount = answers.stream()
                            .filter(a -> a.getRatingValue() != null && a.getRatingValue() == 0)
                            .count();
                    qStat.put("yes", yesCount);
                    qStat.put("no", noCount);
                    break;
                }
                case MULTIPLE_CHOICE: {
                    Map<String, Long> optionCounts = answers.stream()
                            .filter(a -> a.getSelectedOption() != null)
                            .collect(Collectors.groupingBy(SurveyAnswer::getSelectedOption, Collectors.counting()));
                    qStat.put("optionCounts", optionCounts);
                    break;
                }
                case FREE_TEXT: {
                    List<String> texts = answers.stream()
                            .filter(a -> a.getAnswerText() != null && !a.getAnswerText().isBlank())
                            .map(SurveyAnswer::getAnswerText)
                            .collect(Collectors.toList());
                    qStat.put("freeTextAnswers", texts);
                    break;
                }
            }

            qStat.put("answerCount", answers.size());
            questionStats.add(qStat);
        }

        result.put("questionStats", questionStats);
        return result;
    }

    // --- Available roles ---

    public List<Map<String, String>> getAvailableRoles() {
        List<Map<String, String>> roles = new ArrayList<>();
        for (Role role : roleRepository.findAll()) {
            Map<String, String> r = new HashMap<>();
            r.put("name", role.getName());
            r.put("description", role.getDescription() != null ? role.getDescription() : role.getName());
            roles.add(r);
        }
        return roles;
    }
}
