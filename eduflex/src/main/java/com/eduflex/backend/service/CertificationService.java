package com.eduflex.backend.service;

import com.eduflex.backend.model.Certification;
import com.eduflex.backend.model.Course;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.CertificationRepository;
import com.eduflex.backend.repository.CourseRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class CertificationService {

    private final CertificationRepository certificationRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public CertificationService(CertificationRepository certificationRepository,
            UserRepository userRepository,
            CourseRepository courseRepository) {
        this.certificationRepository = certificationRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
    }

    public List<Certification> getUserCertifications(Long userId) {
        return certificationRepository.findByUserId(userId);
    }

    @Transactional
    public Certification issueCertification(Long userId, Long courseId, Integer validityMonths) {
        User user = userRepository.findById(userId).orElseThrow();
        Course course = courseRepository.findById(courseId).orElseThrow();

        Certification cert = Certification.builder()
                .user(user)
                .course(course)
                .title(course.getName())
                .issuedAt(LocalDateTime.now())
                .status(Certification.CertificationStatus.ACTIVE)
                .verifyCode(UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .build();

        if (validityMonths != null && validityMonths > 0) {
            cert.setExpiresAt(LocalDateTime.now().plusMonths(validityMonths));
        }

        return certificationRepository.save(cert);
    }

    public List<Certification> getExpiringCertifications(int daysAhead) {
        LocalDateTime threshold = LocalDateTime.now().plusDays(daysAhead);
        return certificationRepository.findByExpiresAtBeforeAndStatus(threshold,
                Certification.CertificationStatus.ACTIVE);
    }

    @Transactional
    public void updateCertificationStatuses() {
        List<Certification> active = certificationRepository.findByStatus(Certification.CertificationStatus.ACTIVE);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime soon = now.plusDays(30);

        for (Certification cert : active) {
            if (cert.getExpiresAt() != null) {
                if (cert.getExpiresAt().isBefore(now)) {
                    cert.setStatus(Certification.CertificationStatus.EXPIRED);
                } else if (cert.getExpiresAt().isBefore(soon)) {
                    cert.setStatus(Certification.CertificationStatus.EXPIRING_SOON);
                }
            }
        }
        certificationRepository.saveAll(active);
    }

    public List<Certification> getAllCertifications() {
        return certificationRepository.findAll();
    }
}
