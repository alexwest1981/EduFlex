package com.eduflex.backend.service;

import com.eduflex.backend.model.AcademicTerm;
import com.eduflex.backend.model.PolicyAcceptance;
import com.eduflex.backend.model.SchoolPolicy;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.AcademicTermRepository;
import com.eduflex.backend.repository.PolicyAcceptanceRepository;
import com.eduflex.backend.repository.SchoolPolicyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AcademicGovernanceService {

    private final AcademicTermRepository academicTermRepository;
    private final SchoolPolicyRepository schoolPolicyRepository;
    private final PolicyAcceptanceRepository policyAcceptanceRepository;

    public AcademicGovernanceService(AcademicTermRepository academicTermRepository,
                                     SchoolPolicyRepository schoolPolicyRepository,
                                     PolicyAcceptanceRepository policyAcceptanceRepository) {
        this.academicTermRepository = academicTermRepository;
        this.schoolPolicyRepository = schoolPolicyRepository;
        this.policyAcceptanceRepository = policyAcceptanceRepository;
    }

    // --- Academic Terms ---
    public List<AcademicTerm> getAllTerms() {
        return academicTermRepository.findAll();
    }

    public AcademicTerm saveTerm(AcademicTerm term) {
        return academicTermRepository.save(term);
    }

    public void lockTerm(Long termId, boolean locked) {
        AcademicTerm term = academicTermRepository.findById(termId)
                .orElseThrow(() -> new RuntimeException("Term not found"));
        term.setLocked(locked);
        academicTermRepository.save(term);
    }

    // --- School Policies ---
    public List<SchoolPolicy> getAllPolicies() {
        return schoolPolicyRepository.findAll();
    }

    public SchoolPolicy savePolicy(SchoolPolicy policy) {
        return schoolPolicyRepository.save(policy);
    }

    public void acceptPolicy(Long policyId, User user) {
        SchoolPolicy policy = schoolPolicyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found"));
        
        if (policyAcceptanceRepository.findByPolicyIdAndUserId(policyId, user.getId()).isEmpty()) {
            PolicyAcceptance acceptance = new PolicyAcceptance(policy, user);
            policyAcceptanceRepository.save(acceptance);
        }
    }

    public boolean hasUserAcceptedPolicy(Long policyId, Long userId) {
        return policyAcceptanceRepository.findByPolicyIdAndUserId(policyId, userId).isPresent();
    }
}
