import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
    LayoutGrid,
    BookOpen,
    Users,
    Plus,
    Trash2,
    ChevronRight,
    Building2,
    GraduationCap,
    School,
    Edit3,
    Check,
    X,
    Search,
    UserPlus,
    Crown,
    Heart
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const SchoolStructureManagement = () => {
    const { t } = useTranslation();
    const [departments, setDepartments] = useState([]);
    const [selectedDept, setSelectedDept] = useState(null);
    const [programs, setPrograms] = useState([]);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [classes, setClasses] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(false);

    // Student Management States
    const [isManagingStudents, setIsManagingStudents] = useState(false);
    const [currentClassForStudents, setCurrentClassForStudents] = useState(null);
    const [classStudents, setClassStudents] = useState([]);
    const [studentSearchQuery, setStudentSearchQuery] = useState('');
    const [studentSearchResults, setStudentSearchResults] = useState([]);
    const [isEditingClass, setIsEditingClass] = useState(null);
    const [editClassName, setEditClassName] = useState('');

    // Teacher management
    const [addingTeacherFor, setAddingTeacherFor] = useState(null);

    // New item names
    const [newDeptName, setNewDeptName] = useState('');
    const [newProgName, setNewProgName] = useState('');
    const [newClassName, setNewClassName] = useState('');

    useEffect(() => {
        loadDepartments();
        loadStaff();
    }, []);

    const loadStaff = async () => {
        try {
            const data = await api.users.getAll(0, 500);
            const staff = (data.content || data || []).filter(u => {
                const roleName = String(u.role?.name || u.Role || '').toUpperCase();
                return roleName.includes('TEACHER') || roleName.includes('ADMIN') || roleName.includes('REKTOR') || roleName.includes('MENTOR');
            });
            setStaffList(staff);
        } catch (err) {
            console.error('Failed to load staff', err);
        }
    };

    const loadDepartments = async () => {
        try {
            setLoading(true);
            const data = await api.principal.structure.getDepartments();
            setDepartments(data || []);
        } catch (err) {
            toast.error('Kunde inte ladda avdelningar');
        } finally {
            setLoading(false);
        }
    };

    const loadPrograms = async (deptId) => {
        try {
            const data = await api.principal.structure.getPrograms(deptId);
            setPrograms(data || []);
        } catch (err) {
            toast.error('Kunde inte ladda program');
        }
    };

    const loadClasses = async (progId) => {
        try {
            const data = await api.principal.structure.getClasses(progId);
            setClasses(data || []);
        } catch (err) {
            toast.error('Kunde inte ladda klasser');
        }
    };

    const handleCreateDept = async () => {
        if (!newDeptName) return;
        try {
            await api.principal.structure.createDepartment({ name: newDeptName });
            setNewDeptName('');
            loadDepartments();
            toast.success('Avdelning skapad');
        } catch (err) {
            toast.error('Kunde inte skapa avdelning');
        }
    };

    const handleCreateProgram = async () => {
        if (!newProgName || !selectedDept) return;
        try {
            await api.principal.structure.createProgram({
                name: newProgName,
                departmentId: selectedDept.id
            });
            setNewProgName('');
            loadPrograms(selectedDept.id);
            toast.success('Program skapat');
        } catch (err) {
            toast.error('Kunde inte skapa program');
        }
    };

    const handleCreateClass = async () => {
        if (!newClassName || !selectedProgram) return;
        try {
            await api.principal.structure.createClass({
                name: newClassName,
                programId: selectedProgram.id
            });
            setNewClassName('');
            loadClasses(selectedProgram.id);
            toast.success('Klass skapad');
        } catch (err) {
            toast.error('Kunde inte skapa klass');
        }
    };

    const handleUpdateMentor = async (classId, mentorId) => {
        try {
            await api.principal.structure.updateClass(classId, { mentorId });
            toast.success('Mentor uppdaterad');
            loadClasses(selectedProgram.id);
        } catch (err) {
            toast.error('Kunde inte uppdatera');
        }
    };

    const handleUpdateMainTeacher = async (classId, mainTeacherId) => {
        try {
            await api.principal.structure.updateClass(classId, { mainTeacherId });
            toast.success('Huvudansvarig lärare uppdaterad');
            loadClasses(selectedProgram.id);
        } catch (err) {
            toast.error('Kunde inte uppdatera');
        }
    };

    const handleAddTeacher = async (classId, teacherId) => {
        try {
            await api.principal.structure.addTeacher(classId, teacherId);
            toast.success('Lärare tillagd');
            setAddingTeacherFor(null);
            loadClasses(selectedProgram.id);
        } catch (err) {
            toast.error('Kunde inte lägga till lärare');
        }
    };

    const handleRemoveTeacher = async (classId, teacherId) => {
        try {
            await api.principal.structure.removeTeacher(classId, teacherId);
            toast.success('Lärare borttagen');
            loadClasses(selectedProgram.id);
        } catch (err) {
            toast.error('Kunde inte ta bort lärare');
        }
    };

    const handleUpdateClassName = async (classId) => {
        if (!editClassName.trim()) return;
        try {
            await api.principal.structure.updateClass(classId, { name: editClassName });
            toast.success('Klassnamn uppdaterat');
            setIsEditingClass(null);
            loadClasses(selectedProgram.id);
        } catch (err) {
            toast.error('Kunde inte uppdatera');
        }
    };

    const handleDeleteDept = async (deptId) => {
        if (!window.confirm('Är du säker på att du vill ta bort denna avdelning?\n\nAlla program och klasser i avdelningen kommer också att tas bort.')) return;
        try {
            await api.principal.structure.deleteDepartment(deptId);
            toast.success('Avdelning borttagen');
            if (selectedDept?.id === deptId) {
                setSelectedDept(null);
                setSelectedProgram(null);
                setPrograms([]);
                setClasses([]);
            }
            loadDepartments();
        } catch (err) {
            toast.error('Kunde inte ta bort avdelning');
        }
    };

    const handleDeleteProgram = async (progId) => {
        if (!window.confirm('Är du säker på att du vill ta bort detta program?\n\nAlla klasser i programmet kommer också att tas bort.')) return;
        try {
            await api.principal.structure.deleteProgram(progId);
            toast.success('Program borttaget');
            if (selectedProgram?.id === progId) {
                setSelectedProgram(null);
                setClasses([]);
            }
            loadPrograms(selectedDept.id);
        } catch (err) {
            toast.error('Kunde inte ta bort program');
        }
    };

    const handleDeleteClass = async (classId) => {
        if (!window.confirm('Är du säker på att du vill ta bort denna klass?')) return;
        try {
            await api.principal.structure.deleteClass(classId);
            toast.success('Klass borttagen');
            loadClasses(selectedProgram.id);
        } catch (err) {
            toast.error('Kunde inte ta bort klass');
        }
    };

    const openStudentManager = async (classObj) => {
        setCurrentClassForStudents(classObj);
        setIsManagingStudents(true);
        try {
            const students = await api.principal.structure.getStudents(classObj.id);
            setClassStudents(students || []);
        } catch (err) {
            console.error('Failed to load class students', err);
        }
    };

    const handleSearchStudents = async (q) => {
        setStudentSearchQuery(q);
        if (q.length < 2) {
            setStudentSearchResults([]);
            return;
        }
        try {
            const results = await api.users.search(q);
            const filtered = (results.content || results || []).filter(r => !classStudents.some(cs => cs.id === r.id));
            setStudentSearchResults(filtered);
        } catch (err) {
            console.error('Search failed', err);
        }
    };

    const handleAddStudent = async (student) => {
        try {
            await api.principal.structure.addStudent(currentClassForStudents.id, student.id);
            setClassStudents([...classStudents, student]);
            setStudentSearchResults(studentSearchResults.filter(s => s.id !== student.id));
            toast.success(t('principal.student_added'));
        } catch (err) {
            toast.error(t('principal.add_failed'));
        }
    };

    const handleRemoveStudent = async (studentId) => {
        try {
            await api.principal.structure.removeStudent(currentClassForStudents.id, studentId);
            setClassStudents(classStudents.filter(s => s.id !== studentId));
            toast.success(t('principal.student_removed'));
        } catch (err) {
            toast.error(t('principal.remove_failed'));
        }
    };

    const getDisplayName = (user) => {
        if (!user) return '';
        return user.fullName || `${user.firstName} ${user.lastName}`;
    };

    const getAvailableTeachers = (cls) => {
        const assignedIds = new Set((cls.teachers || []).map(t => t.id));
        return staffList.filter(s => !assignedIds.has(s.id));
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg">
                    <Building2 size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Organisationshantering</h1>
                    <p className="text-sm text-gray-500">Strukturera skolan med avdelningar, program och klasser.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* 1. DEPARTMENTS */}
                <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col h-[600px]">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <School size={18} className="text-indigo-600" />
                            Avdelningar
                        </h3>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/20">
                        <div className="flex gap-2">
                            <input
                                value={newDeptName}
                                onChange={e => setNewDeptName(e.target.value)}
                                placeholder="Ny avdelning..."
                                className="flex-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg text-sm px-3 py-2"
                            />
                            <button onClick={handleCreateDept} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {departments.map(dept => (
                            <div
                                key={dept.id}
                                className={`group/dept w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${selectedDept?.id === dept.id
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                                    }`}
                                onClick={() => {
                                    setSelectedDept(dept);
                                    setSelectedProgram(null);
                                    setClasses([]);
                                    loadPrograms(dept.id);
                                }}
                            >
                                <span className="font-medium truncate">{dept.name}</span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteDept(dept.id); }}
                                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 rounded opacity-0 group-hover/dept:opacity-100 transition-all"
                                        title="Ta bort avdelning"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                    <ChevronRight size={16} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. PROGRAMS */}
                <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col h-[600px]">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <GraduationCap size={18} className="text-emerald-600" />
                            Program {selectedDept && <span className="text-xs font-normal text-gray-400 ml-2">({selectedDept.name})</span>}
                        </h3>
                    </div>
                    {selectedDept ? (
                        <>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/20">
                                <div className="flex gap-2">
                                    <input
                                        value={newProgName}
                                        onChange={e => setNewProgName(e.target.value)}
                                        placeholder="Nytt program..."
                                        className="flex-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg text-sm px-3 py-2"
                                    />
                                    <button onClick={handleCreateProgram} className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                {programs.map(prog => (
                                    <div
                                        key={prog.id}
                                        onClick={() => {
                                            setSelectedProgram(prog);
                                            loadClasses(prog.id);
                                        }}
                                        className={`group/prog w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${selectedProgram?.id === prog.id
                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        <span className="font-medium truncate">{prog.name}</span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteProgram(prog.id); }}
                                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 rounded opacity-0 group-hover/prog:opacity-100 transition-all"
                                                title="Ta bort program"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            <ChevronRight size={16} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                            <Users size={32} className="mb-2 opacity-20" />
                            <p className="text-sm">Välj en avdelning för att se program</p>
                        </div>
                    )}
                </div>

                {/* 3. CLASSES */}
                <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col h-[600px]">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Users size={18} className="text-amber-600" />
                            Klasser {selectedProgram && <span className="text-xs font-normal text-gray-400 ml-2">({selectedProgram.name})</span>}
                        </h3>
                    </div>
                    {selectedProgram ? (
                        <>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/20">
                                <div className="flex gap-2">
                                    <input
                                        value={newClassName}
                                        onChange={e => setNewClassName(e.target.value)}
                                        placeholder="Ny klass (t.ex. TE22A)..."
                                        className="flex-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg text-sm px-3 py-2"
                                    />
                                    <button onClick={handleCreateClass} className="p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                {classes.map(cls => (
                                    <div
                                        key={cls.id}
                                        className="group w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700 hover:border-amber-200 dark:hover:border-amber-800 transition-all"
                                    >
                                        {/* Header: Name + actions */}
                                        <div className="flex items-center justify-between mb-3">
                                            {isEditingClass === cls.id ? (
                                                <div className="flex items-center gap-1 flex-1">
                                                    <input
                                                        type="text"
                                                        value={editClassName}
                                                        onChange={(e) => setEditClassName(e.target.value)}
                                                        className="px-2 py-1 border rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700 flex-1"
                                                        autoFocus
                                                        onKeyDown={(e) => e.key === 'Enter' && handleUpdateClassName(cls.id)}
                                                    />
                                                    <button onClick={() => handleUpdateClassName(cls.id)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                                                        <Check size={16} />
                                                    </button>
                                                    <button onClick={() => setIsEditingClass(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded">
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    <span className="text-base font-bold text-gray-900 dark:text-white">{cls.name}</span>
                                                    <button
                                                        onClick={() => { setIsEditingClass(cls.id); setEditClassName(cls.name); }}
                                                        className="p-1 text-gray-400 hover:text-indigo-600 rounded"
                                                    >
                                                        <Edit3 size={14} />
                                                    </button>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1 ml-2 shrink-0">
                                                <button
                                                    onClick={() => openStudentManager(cls)}
                                                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-lg transition-colors"
                                                    title="Hantera elever"
                                                >
                                                    <Users size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClass(cls.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Mentor */}
                                        <div className="mb-2">
                                            <label className="flex items-center gap-1 text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                <Heart size={10} />
                                                Mentor
                                            </label>
                                            <select
                                                value={cls.mentorId || ''}
                                                onChange={(e) => handleUpdateMentor(cls.id, e.target.value || null)}
                                                className="w-full text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 cursor-pointer focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                            >
                                                <option value="">Välj mentor...</option>
                                                {staffList.map(staff => (
                                                    <option key={staff.id} value={staff.id}>{getDisplayName(staff)}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Main Teacher (Huvudansvarig lärare) */}
                                        <div className="mb-2">
                                            <label className="flex items-center gap-1 text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                <Crown size={10} />
                                                Huvudansvarig lärare
                                            </label>
                                            <select
                                                value={cls.mainTeacherId || ''}
                                                onChange={(e) => handleUpdateMainTeacher(cls.id, e.target.value || null)}
                                                className="w-full text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 cursor-pointer focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                                            >
                                                <option value="">Välj huvudansvarig...</option>
                                                {staffList.map(staff => (
                                                    <option key={staff.id} value={staff.id}>{getDisplayName(staff)}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Teachers list */}
                                        <div>
                                            <label className="flex items-center gap-1 text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                <GraduationCap size={10} />
                                                Lärare
                                            </label>
                                            <div className="space-y-1">
                                                {(cls.teachers || []).map(teacher => (
                                                    <div key={teacher.id} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-md px-2 py-1 border border-gray-100 dark:border-gray-700 group/teacher">
                                                        <span className="text-xs text-gray-700 dark:text-gray-300">{getDisplayName(teacher)}</span>
                                                        <button
                                                            onClick={() => handleRemoveTeacher(cls.id, teacher.id)}
                                                            className="p-0.5 text-gray-400 hover:text-red-500 opacity-0 group-hover/teacher:opacity-100 transition-opacity"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ))}

                                                {addingTeacherFor === cls.id ? (
                                                    <div className="flex items-center gap-1">
                                                        <select
                                                            onChange={(e) => {
                                                                if (e.target.value) handleAddTeacher(cls.id, e.target.value);
                                                            }}
                                                            className="flex-1 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-emerald-500"
                                                            autoFocus
                                                        >
                                                            <option value="">Välj lärare...</option>
                                                            {getAvailableTeachers(cls).map(staff => (
                                                                <option key={staff.id} value={staff.id}>{getDisplayName(staff)}</option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            onClick={() => setAddingTeacherFor(null)}
                                                            className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setAddingTeacherFor(cls.id)}
                                                        className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-md px-2 py-1 transition-colors w-full"
                                                    >
                                                        <UserPlus size={12} />
                                                        Lägg till lärare
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                            <LayoutGrid size={32} className="mb-2 opacity-20" />
                            <p className="text-sm">Välj ett program för att se klasser</p>
                        </div>
                    )}
                </div>

            </div>

            {/* Student Manager Modal */}
            {isManagingStudents && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1c1c1e] rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/30 rounded-t-xl">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Hantera elever: {currentClassForStudents?.name}
                                </h3>
                                <p className="text-sm text-gray-500">Lägg till eller ta bort elever</p>
                            </div>
                            <button
                                onClick={() => setIsManagingStudents(false)}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto grid md:grid-cols-2 gap-6">
                            {/* Current Students List */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
                                    Inskrivna elever ({classStudents.length})
                                </h4>
                                <div className="space-y-2">
                                    {classStudents.length === 0 ? (
                                        <p className="text-sm text-gray-400 italic py-4">Inga elever</p>
                                    ) : (
                                        classStudents.map(student => (
                                            <div key={student.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 group hover:border-red-200 dark:hover:border-red-800 transition-colors">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">{student.firstName} {student.lastName}</span>
                                                <button
                                                    onClick={() => handleRemoveStudent(student.id)}
                                                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Ta bort från klass"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Add Students Section */}
                            <div className="border-l border-gray-100 dark:border-gray-800 pl-6">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
                                    Lägg till elever
                                </h4>
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Sök elever..."
                                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                        value={studentSearchQuery}
                                        onChange={(e) => handleSearchStudents(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                    {studentSearchResults.map(student => (
                                        <div key={student.id} className="flex justify-between items-center p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg border border-transparent hover:border-blue-100 dark:hover:border-blue-800 transition-all">
                                            <span className="text-sm text-gray-900 dark:text-white">{student.firstName} {student.lastName}</span>
                                            <button
                                                onClick={() => handleAddStudent(student)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-md transition-colors"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {studentSearchQuery.length >= 2 && studentSearchResults.length === 0 && (
                                        <p className="text-xs text-gray-400 text-center py-4">Inga resultat</p>
                                    )}
                                    {studentSearchQuery.length < 2 && (
                                        <p className="text-xs text-gray-400 text-center py-4">Skriv minst 2 tecken för att söka</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 flex justify-end rounded-b-xl">
                            <button
                                onClick={() => setIsManagingStudents(false)}
                                className="px-6 py-2 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-lg hover:bg-black dark:hover:bg-gray-100 transition-colors"
                            >
                                Stäng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SchoolStructureManagement;
