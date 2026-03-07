package com.eduflex.backend.repository;

import com.eduflex.backend.model.ProgramApplication;
import com.eduflex.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProgramApplicationRepository extends JpaRepository<ProgramApplication, Long> {
    List<ProgramApplication> findByUser(User user);
}
