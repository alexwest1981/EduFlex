package com.eduflex.backend.service;

import com.eduflex.backend.model.Holiday;
import com.eduflex.backend.repository.HolidayRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class AcademicCalendarService {

    private final HolidayRepository holidayRepository;

    public AcademicCalendarService(HolidayRepository holidayRepository) {
        this.holidayRepository = holidayRepository;
    }

    public List<Holiday> getAllHolidays() {
        return holidayRepository.findAll();
    }

    public Holiday saveHoliday(Holiday holiday) {
        return holidayRepository.save(holiday);
    }

    public boolean isDateAssignmentFree(LocalDate date) {
        return holidayRepository.findAll().stream()
                .anyMatch(h -> !h.isAssignmentsAllowed() && 
                               (date.isEqual(h.getStartDate()) || date.isEqual(h.getEndDate()) || 
                                (date.isAfter(h.getStartDate()) && date.isBefore(h.getEndDate()))));
    }
}
