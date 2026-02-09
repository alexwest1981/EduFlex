package com.eduflex.backend.event;

import com.eduflex.backend.model.CourseResult;

/**
 * Event published when a CourseResult is graded (status changes to PASSED or FAILED).
 * Used to trigger automatic document generation.
 */
public class CourseResultGradedEvent {
    private final CourseResult courseResult;
    
    public CourseResultGradedEvent(CourseResult courseResult) {
        this.courseResult = courseResult;
    }
    
    public CourseResult getCourseResult() {
        return courseResult;
    }
}
