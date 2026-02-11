package com.eduflex.backend.repository;

import com.eduflex.backend.model.ClassWellbeingSurvey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassWellbeingSurveyRepository extends JpaRepository<ClassWellbeingSurvey, Long> {
    List<ClassWellbeingSurvey> findByClassGroupIdOrderByCreatedAtDesc(Long classGroupId);

    @Query("SELECT AVG(s.rating) FROM ClassWellbeingSurvey s WHERE s.classGroup.id = :classGroupId")
    Double getAverageRatingByClassGroupId(Long classGroupId);

    @Query("SELECT AVG(s.rating) FROM ClassWellbeingSurvey s")
    Double getOverallAverageRating();
}
