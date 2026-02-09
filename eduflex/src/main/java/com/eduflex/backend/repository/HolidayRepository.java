package com.eduflex.backend.repository;

import com.eduflex.backend.model.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface HolidayRepository extends JpaRepository<Holiday, Long> {
    List<Holiday> findByStartDateBetween(LocalDate start, LocalDate end);
}
