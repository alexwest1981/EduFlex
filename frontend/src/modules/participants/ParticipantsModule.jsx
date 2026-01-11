import React, { useState, useEffect } from 'react';
import { Users, CheckSquare, Plus, Trash2, Award, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';

export const ParticipantsModuleMetadata = {
    id: 'core_participants',
    name: 'Course Participants',
    version: '1.0.0',
    description: 'Hanterar deltagarlistor och antagning.',
    icon: Users,
    isCore: true, // Denna är central för systemet
    settingsKey: null,
    permissions: ['READ', 'WRITE']
};

const ParticipantsModule = ({ courseId, isTeacher }) => {
    const { t } = useTranslation();
    const [course, setCourse] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [results, setResults] = useState({});

    useEffect(() => {
        loadData();
    }, [courseId]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [c, users] = await Promise.all([
                api.courses.getOne(courseId),
                isTeacher ? api.users.getAll(0, 1000) : Promise.resolve([])
            ]);
            setCourse(c);
            setAllUsers(users?.content || users || []);

            // Ladda resultat om lärare
            if (isTeacher && c.students) {
                const resMap = {};
                await Promise.all(c.students.map(async (s) => {
                    try {
                        const r = await api.courses.getResult(courseId, s.id);
                        if (r) resMap[s.id] = r;
                    } catch (e) { /* ignore */ }
                }));
                setResults(resMap);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddStudent = async (studentId) => {
        try {
            await api.courses.enroll(courseId, studentId);
            alert("Student tillagd!");
            loadData(); // Ladda om listan
        } catch (e) {
            alert("Fel vid tilläggning");
        }
    };

    const handleSetResult = async (studentId, status) => {
        try {
            await api.courses.setResult(courseId, studentId, status);
            // Uppdatera lokalt
            setResults(prev => ({
                ...prev,
                [studentId]: { ...prev[studentId], status }
            }));
        } catch (e) {
            alert(t('course.error_occurred'));
        }
    };

    // Filtrera fram studenter som INTE redan går kursen (för dropdown)
    const enrolledIds = course?.students?.map(s => s.id) || [];
    const availableStudents = allUsers.filter(u => u.role === 'STUDENT' && !enrolledIds.includes(u.id));

    if (isLoading) return <div className="p-4 text-gray-500">Laddar deltagare...</div>;
    if (!course) return null;

    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="bg-white dark:bg-[#1E1F20] rounded-xl shadow-sm border border-gray-200 dark:border-[#3c4043] overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-[#3c4043] flex justify-between items-center bg-gray-50 dark:bg-[#131314]">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{t('course.participants')}</h3>

                    {isTeacher && (
                        <div className="flex gap-2">
                            <select id="studentSelect" className="text-sm border dark:border-[#3c4043] p-2 rounded-lg w-64 bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="">{t('course.select_student')}</option>
                                {availableStudents.map(s => (
                                    <option key={s.id} value={s.id}>{s.fullName} ({s.username})</option>
                                ))}
                            </select>
                            <button
                                onClick={() => {
                                    const sid = document.getElementById('studentSelect').value;
                                    if (sid) handleAddStudent(sid);
                                }}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                <Plus size={16} /> {t('course.add_student')}
                            </button>
                        </div>
                    )}
                </div>

                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-[#282a2c] text-gray-500 dark:text-gray-400 uppercase">
                        <tr>
                            <th className="p-4">{t('profile.firstname')}</th>
                            <th className="p-4">{t('auth.username')}</th>
                            <th className="p-4">{t('course.role')}</th>
                            <th className="p-4">{t('course.status')}</th>
                            {isTeacher && <th className="p-4 text-right">Resultat (Certifikat)</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                        {course.students?.length === 0 && (
                            <tr><td colSpan={isTeacher ? 5 : 4} className="p-6 text-center text-gray-500 italic">Inga deltagare registrerade.</td></tr>
                        )}
                        {course.students?.map(s => {
                            const result = results[s.id]?.status || 'PENDING';
                            return (
                                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-[#282a2c]/50 transition-colors">
                                    <td className="p-4 font-bold text-gray-900 dark:text-white align-middle">{s.fullName}</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-400 align-middle">{s.username}</td>
                                    <td className="p-4 align-middle">
                                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-xs font-bold">STUDENT</span>
                                    </td>
                                    <td className="p-4 text-green-600 dark:text-green-400 font-bold align-middle">
                                        <div className="flex items-center gap-1">
                                            <CheckSquare size={14} /> {t('course.active')}
                                        </div>
                                    </td>
                                    {isTeacher && (
                                        <td className="p-4 align-middle">
                                            <div className="flex justify-end gap-2">
                                                <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#3c4043] rounded-lg p-1">
                                                    <button
                                                        onClick={() => handleSetResult(s.id, 'PASSED')}
                                                        title={t('course.mark_passed')}
                                                        className={`p-1.5 rounded-md transition-all ${result === 'PASSED' ? 'bg-green-500 text-white shadow-md' : 'text-gray-400 hover:text-green-600'}`}
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleSetResult(s.id, 'FAILED')}
                                                        title={t('course.mark_failed')}
                                                        className={`p-1.5 rounded-md transition-all ${result === 'FAILED' ? 'bg-red-500 text-white shadow-md' : 'text-gray-400 hover:text-red-600'}`}
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleSetResult(s.id, 'PENDING')}
                                                        title="Återställ"
                                                        className={`p-1.5 rounded-md transition-all ${result === 'PENDING' ? 'bg-white text-gray-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                                    >
                                                        <div className="w-4 h-4 rounded-full border-2 border-current opacity-50"></div>
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ParticipantsModule;
