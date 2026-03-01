package com.eduflex.backend.dto;

import com.eduflex.backend.model.CourseEvaluation;
import com.eduflex.backend.model.SkolverketCourse;
import com.eduflex.backend.model.Course.CourseVisibility;
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
                CourseVisibility visibility,
                CourseEvaluation evaluation,
                Integer maxStudents,
                Integer enrolledCount,
                String classroomLink,
                String classroomType,
                String examLink,
                String slug,
                Double price,
                SkolverketCourse skolverketCourse,
                List<com.eduflex.backend.model.GroupRoom> groupRooms) {
}