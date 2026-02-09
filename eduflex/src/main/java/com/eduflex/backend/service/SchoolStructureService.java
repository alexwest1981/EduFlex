package com.eduflex.backend.service;

import com.eduflex.backend.model.ClassGroup;
import com.eduflex.backend.model.Department;
import com.eduflex.backend.model.Program;
import com.eduflex.backend.repository.ClassGroupRepository;
import com.eduflex.backend.repository.DepartmentRepository;
import com.eduflex.backend.repository.ProgramRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SchoolStructureService {

    private final DepartmentRepository departmentRepository;
    private final ProgramRepository programRepository;
    private final ClassGroupRepository classGroupRepository;

    public SchoolStructureService(DepartmentRepository departmentRepository,
                                  ProgramRepository programRepository,
                                  ClassGroupRepository classGroupRepository) {
        this.departmentRepository = departmentRepository;
        this.programRepository = programRepository;
        this.classGroupRepository = classGroupRepository;
    }

    // --- Department ---
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public Department saveDepartment(Department department) {
        return departmentRepository.save(department);
    }

    public void deleteDepartment(Long id) {
        departmentRepository.deleteById(id);
    }

    // --- Program ---
    public List<Program> getProgramsByDepartment(Long departmentId) {
        return programRepository.findByDepartmentId(departmentId);
    }

    public Program saveProgram(Program program) {
        return programRepository.save(program);
    }

    public void deleteProgram(Long id) {
        programRepository.deleteById(id);
    }

    // --- ClassGroup ---
    public List<ClassGroup> getClassesByProgram(Long programId) {
        return classGroupRepository.findByProgramId(programId);
    }

    public ClassGroup saveClassGroup(ClassGroup classGroup) {
        return classGroupRepository.save(classGroup);
    }

    public void deleteClassGroup(Long id) {
        classGroupRepository.deleteById(id);
    }
}
