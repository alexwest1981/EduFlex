package com.eduflex.backend.repository;

import com.eduflex.backend.model.Certification;
import com.eduflex.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CertificationRepository extends JpaRepository<Certification, Long> {
    List<Certification> findByUser(User user);

    List<Certification> findByUserId(Long userId);

    List<Certification> findByStatus(Certification.CertificationStatus status);

    List<Certification> findByExpiresAtBeforeAndStatus(LocalDateTime date, Certification.CertificationStatus status);

    Optional<Certification> findByVerifyCode(String verifyCode);

    List<Certification> findByCourseId(Long courseId);
}
