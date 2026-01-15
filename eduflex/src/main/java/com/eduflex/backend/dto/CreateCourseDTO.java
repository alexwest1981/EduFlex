package com.eduflex.backend.dto;

import java.time.LocalDate;

public record CreateCourseDTO(
                String name,
                String courseCode,
                String category,
                String description,
                LocalDate startDate,
                LocalDate endDate,
                Long teacherId,
                String color,
                Integer maxStudents, // <--- NYTT FÄLT
                Long skolverketCourseId, // Link to Skolverket course
                java.util.List<java.util.Map<String, String>> groupRooms // New field for group rooms
) {
        // Records automatically provide an accessor method named after the component
        // (e.g., skolverketCourseId()).
        // If you need a getter with the 'get' prefix, you can define it explicitly.
        public Long getSkolverketCourseId() {
                return skolverketCourseId;
        }

        // Records are designed to be immutable. Adding a setter like this
        // goes against the typical use case for records.
        // If mutability is required, a regular class might be more appropriate.
        public void setSkolverketCourseId(Long skolverketCourseId) {
                // This setter would typically modify a field.
                // For a record, this would imply modifying the internal state,
                // which is generally not done.
                // If you intend to create a new record with a modified value,
                // you would typically use a 'with' method pattern.
                // For demonstration, if this were a class, it would be:
                // this.skolverketCourseId = skolverketCourseId;
                // As a record, this is not directly supported for its components.
                // The record components are final.
                throw new UnsupportedOperationException(
                                "Records are immutable. Cannot set skolverketCourseId directly.");
        }
}