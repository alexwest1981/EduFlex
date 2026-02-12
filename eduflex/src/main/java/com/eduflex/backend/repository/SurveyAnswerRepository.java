package com.eduflex.backend.repository;

import com.eduflex.backend.model.survey.SurveyAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;

@Repository
public interface SurveyAnswerRepository extends JpaRepository<SurveyAnswer, Long> {
    List<SurveyAnswer> findByResponse_DistributionIdAndQuestionId(Long distributionId, Long questionId);

    @Query("SELECT AVG(a.ratingValue) FROM SurveyAnswer a WHERE a.question.questionType = 'RATING_1_5'")
    Double getOverallAverageRating();

    @Query("SELECT TO_CHAR(r.submittedAt, 'YYYY-MM') as month, AVG(a.ratingValue) as average " +
            "FROM SurveyAnswer a JOIN a.response r " +
            "WHERE a.question.questionType = 'RATING_1_5' " +
            "GROUP BY TO_CHAR(r.submittedAt, 'YYYY-MM') " +
            "ORDER BY month DESC")
    List<Map<String, Object>> getMonthlyAverageRatings();

    @Query("SELECT r.respondent.classGroup.name as className, AVG(a.ratingValue) as average " +
            "FROM SurveyAnswer a JOIN a.response r " +
            "WHERE a.question.questionType = 'RATING_1_5' " +
            "GROUP BY r.respondent.classGroup.name")
    List<Map<String, Object>> getClassAverageRatings();
}
