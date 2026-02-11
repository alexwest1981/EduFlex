package com.eduflex.backend.service;

import com.eduflex.backend.model.ClassGroup;
import com.eduflex.backend.model.Department;
import com.eduflex.backend.model.Program;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.ClassGroupRepository;
import com.eduflex.backend.repository.DepartmentRepository;
import com.eduflex.backend.repository.ProgramRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class SchoolStructureService {

    private final DepartmentRepository departmentRepository;
    private final ProgramRepository programRepository;
    private final ClassGroupRepository classGroupRepository;
    private final com.eduflex.backend.repository.UserRepository userRepository;

    public SchoolStructureService(DepartmentRepository departmentRepository,
            ProgramRepository programRepository,
            ClassGroupRepository classGroupRepository,
            com.eduflex.backend.repository.UserRepository userRepository) {
        this.departmentRepository = departmentRepository;
        this.programRepository = programRepository;
        this.classGroupRepository = classGroupRepository;
        this.userRepository = userRepository;
    }

    // --- Department ---
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public Department saveDepartment(Department department) {
        return departmentRepository.save(department);
    }

    public void deleteDepartment(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Department not found: " + id));
        // Cascade: unlink all students/teachers from all classes in all programs
        for (Program prog : dept.getPrograms()) {
            cleanupClassesInProgram(prog.getId());
        }
        departmentRepository.delete(dept);
    }

    // --- Program ---
    public List<Program> getProgramsByDepartment(Long departmentId) {
        return programRepository.findByDepartment_Id(departmentId);
    }

    public Program saveProgram(Program program) {
        return programRepository.save(program);
    }

    public void deleteProgram(Long id) {
        Program prog = programRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Program not found: " + id));
        cleanupClassesInProgram(id);
        programRepository.delete(prog);
    }

    private void cleanupClassesInProgram(Long programId) {
        List<ClassGroup> classes = classGroupRepository.findByProgram_Id(programId);
        for (ClassGroup cls : classes) {
            cleanupClassGroup(cls);
        }
    }

    private void cleanupClassGroup(ClassGroup cls) {
        // Unlink students
        List<User> students = userRepository.findByClassGroup_Id(cls.getId());
        for (User student : students) {
            student.setClassGroup(null);
        }
        userRepository.saveAll(students);
        // Clear teachers (join table has ON DELETE CASCADE, but clear for JPA consistency)
        cls.getTeachers().clear();
        classGroupRepository.save(cls);
    }

    // --- ClassGroup ---
    public List<ClassGroup> getClassesByProgram(Long programId) {
        return classGroupRepository.findByProgram_Id(programId);
    }

    public ClassGroup saveClassGroup(ClassGroup classGroup) {
        return classGroupRepository.save(classGroup);
    }

    public ClassGroup updateClassGroup(Long id, ClassGroup classGroup) {
        ClassGroup existing = classGroupRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Class not found: " + id));

        if (classGroup.getName() != null)
            existing.setName(classGroup.getName());

        if (classGroup.getMentorId() != null) {
            User mentor = userRepository.findById(classGroup.getMentorId()).orElse(null);
            existing.setMentor(mentor);
        }

        if (classGroup.getMainTeacherId() != null) {
            User mainTeacher = userRepository.findById(classGroup.getMainTeacherId()).orElse(null);
            existing.setMainTeacher(mainTeacher);
        }

        return classGroupRepository.save(existing);
    }

    public void deleteClassGroup(Long id) {
        ClassGroup cls = classGroupRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Class not found: " + id));
        cleanupClassGroup(cls);
        classGroupRepository.delete(cls);
    }

    // --- Student Management ---
    public List<User> getStudentsInClass(Long classGroupId) {
        return userRepository.findByClassGroup_Id(classGroupId);
    }

    public void addStudentToClass(Long classGroupId, Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + studentId));
        ClassGroup classGroup = classGroupRepository.findById(classGroupId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found: " + classGroupId));
        student.setClassGroup(classGroup);
        userRepository.save(student);
    }

    public void removeStudentFromClass(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + studentId));
        student.setClassGroup(null);
        userRepository.save(student);
    }

    // --- Teacher Management ---
    public List<User> getTeachersInClass(Long classGroupId) {
        ClassGroup classGroup = classGroupRepository.findById(classGroupId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found: " + classGroupId));
        return new ArrayList<>(classGroup.getTeachers());
    }

    public void addTeacherToClass(Long classGroupId, Long teacherId) {
        ClassGroup classGroup = classGroupRepository.findById(classGroupId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found: " + classGroupId));
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new IllegalArgumentException("Teacher not found: " + teacherId));
        classGroup.getTeachers().add(teacher);
        classGroupRepository.save(classGroup);
    }

    public void removeTeacherFromClass(Long classGroupId, Long teacherId) {
        ClassGroup classGroup = classGroupRepository.findById(classGroupId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found: " + classGroupId));
        classGroup.getTeachers().removeIf(t -> t.getId().equals(teacherId));
        classGroupRepository.save(classGroup);
    }
}
