package com.eduflex.backend.dto;

import com.eduflex.backend.model.Quiz;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ExamBookingRequest {
    private Quiz quizData;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long courseId;
    private Long teacherId;
    private boolean notifySms;
    private boolean notifyEmail;
    private boolean notifyPush;
    private boolean notifyInternal; // Always good to have as an explicit option
}
