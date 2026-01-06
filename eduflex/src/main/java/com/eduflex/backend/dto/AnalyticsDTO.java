package com.eduflex.backend.dto;

import java.util.List;
import java.util.Map;

public record AnalyticsDTO(
        long totalUsers,
        long totalStudents,
        long totalTeachers,
        long totalCourses,
        long activeUsersLast30Days,
        long activeUsersToday,
        double avgLoginsPerUser,
        long totalStorageUsedBytes, // <--- NY: Lagring
        Map<String, Long> usersByMonth, // <--- Riktig data nu
        Map<String, Long> fileTypeDistribution, // <--- NY: Filtyper
        Map<String, Long> courseCategoryDistribution, // <--- NY: Kategorier
        List<CourseStat> courseEnrollments,
        List<UserActivityStat> topActiveUsers // <--- NY: Topplista
) {
    public record CourseStat(String name, long students) {}
    public record UserActivityStat(String fullName, String role, int loginCount) {}
}