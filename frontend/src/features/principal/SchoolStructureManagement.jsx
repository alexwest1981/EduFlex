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
    School
} from 'lucide-react';
import toast from 'react-hot-toast';

const SchoolStructureManagement = () => {
    const [departments, setDepartments] = useState([]);
    const [selectedDept, setSelectedDept] = useState(null);
    const [programs, setPrograms] = useState([]);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);

    // New item names
    const [newDeptName, setNewDeptName] = useState('');
    const [newProgName, setNewProgName] = useState('');
    const [newClassName, setNewClassName] = useState('');

    useEffect(() => {
        loadDepartments();
    }, []);

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
                            <button
                                key={dept.id}
                                onClick={() => {
                                    setSelectedDept(dept);
                                    setSelectedProgram(null);
                                    loadPrograms(dept.id);
                                }}
                                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedDept?.id === dept.id
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                                    }`}
                            >
                                <span className="font-medium truncate">{dept.name}</span>
                                <ChevronRight size={16} />
                            </button>
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
                                    <button
                                        key={prog.id}
                                        onClick={() => {
                                            setSelectedProgram(prog);
                                            loadClasses(prog.id);
                                        }}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedProgram?.id === prog.id
                                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        <span className="font-medium truncate">{prog.name}</span>
                                        <ChevronRight size={16} />
                                    </button>
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
                            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                {classes.map(cls => (
                                    <div
                                        key={cls.id}
                                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
                                    >
                                        <span className="font-medium truncate">{cls.name}</span>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {/* Action buttons could go here */}
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
        </div>
    );
};

export default SchoolStructureManagement;
