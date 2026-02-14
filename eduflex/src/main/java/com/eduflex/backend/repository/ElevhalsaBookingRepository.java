package com.eduflex.backend.repository;

import com.eduflex.backend.model.ElevhalsaBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ElevhalsaBookingRepository extends JpaRepository<ElevhalsaBooking, Long> {
    List<ElevhalsaBooking> findByStudentIdOrderByStartTimeAsc(Long studentId);

    List<ElevhalsaBooking> findByStaffMemberIdOrderByStartTimeAsc(Long staffMemberId);
}
