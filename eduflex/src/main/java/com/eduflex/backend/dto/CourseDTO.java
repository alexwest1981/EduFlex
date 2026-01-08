package com.eduflex.backend.dto;

import com.eduflex.backend.model.CourseEvaluation;
import java.util.List;

public record CourseDTO(
        Long id,
        String name,
        String courseCode,
        String category,
        String description,
        String startDate,
        String endDate,
        String color,
        UserSummaryDTO teacher,
        List<UserSummaryDTO> students,
        boolean isOpen,
        CourseEvaluation evaluation,
        Integer maxStudents,
        Integer enrolledCount,
        String classroomLink,
        String classroomType,
        String examLink
) {}